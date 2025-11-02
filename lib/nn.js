import { makePRNG, shuffleInPlace, range } from './util';

function zeros(n) { return Array(n).fill(0); }
function mat(rows, cols, fn) {
  const out = Array(rows);
  for (let r = 0; r < rows; r++) {
    out[r] = Array(cols);
    for (let c = 0; c < cols; c++) out[r][c] = fn(r, c);
  }
  return out;
}

function dotMV(W, v) { // W: [o][i], v: [i] -> [o]
  const o = W.length, i = W[0].length;
  const out = Array(o).fill(0);
  for (let r = 0; r < o; r++) {
    let s = 0;
    for (let c = 0; c < i; c++) s += W[r][c] * v[c];
    out[r] = s;
  }
  return out;
}

function addV(a, b) { const out = Array(a.length); for (let i=0;i<a.length;i++) out[i]=a[i]+b[i]; return out; }
function subV(a, b) { const out = Array(a.length); for (let i=0;i<a.length;i++) out[i]=a[i]-b[i]; return out; }
function mulVS(v, s) { const out = Array(v.length); for (let i=0;i<v.length;i++) out[i]=v[i]*s; return out; }
function hadamard(a,b){const out=Array(a.length);for(let i=0;i<a.length;i++) out[i]=a[i]*b[i];return out;}
function outer(u, v) { // u: [m], v: [n] -> [m][n]
  const m = u.length, n = v.length;
  const W = Array(m);
  for (let i = 0; i < m; i++) {
    const row = Array(n);
    for (let j = 0; j < n; j++) row[j] = u[i] * v[j];
    W[i] = row;
  }
  return W;
}
function addMM(A,B){const R=A.length,C=A[0].length;const O=mat(R,C,()=>0);for(let r=0;r<R;r++){for(let c=0;c<C;c++){O[r][c]=A[r][c]+B[r][c];}}return O;}

// Activations
const activations = {
  relu: {
    f: (v) => v.map(x => x > 0 ? x : 0),
    df: (v) => v.map(x => x > 0 ? 1 : 0),
  },
  tanh: {
    f: (v) => v.map(x => Math.tanh(x)),
    df: (v) => v.map(x => 1 - Math.tanh(x)**2),
  },
  sigmoid: {
    f: (v) => v.map(x => 1 / (1 + Math.exp(-x))),
    df: (v) => {
      const s = v.map(x => 1 / (1 + Math.exp(-x)));
      return s.map(z => z * (1 - z));
    }
  },
  linear: {
    f: (v) => v.slice(),
    df: (v) => v.map(_ => 1),
  }
};

export class MLP {
  constructor(layerSizes, opts = {}) {
    this.layerSizes = layerSizes.slice();
    this.hiddenActivation = opts.hiddenActivation || 'tanh';
    this.outputActivation = opts.outputActivation || 'sigmoid';
    this.loss = opts.loss || 'bce'; // 'bce' for classification, 'mse' for regression
    const seed = opts.seed ?? 1234;
    const rand = makePRNG(seed);

    // Xavier/He init depending on activation
    this.W = []; // array of matrices [out][in]
    this.b = []; // array of vectors [out]
    for (let l = 0; l < layerSizes.length - 1; l++) {
      const fanIn = layerSizes[l];
      const fanOut = layerSizes[l+1];
      const act = (l < layerSizes.length - 2) ? this.hiddenActivation : this.outputActivation;
      const scale = act === 'relu' ? Math.sqrt(2 / fanIn) : Math.sqrt(1 / fanIn);
      const Wi = mat(fanOut, fanIn, () => (rand() * 2 - 1) * scale);
      const bi = zeros(fanOut);
      this.W.push(Wi); this.b.push(bi);
    }

    // caches
    this.a = []; // activations per layer (including input)
    this.z = []; // pre-activations per layer (excluding input)
  }

  forward(x) {
    this.a = [x.slice()];
    this.z = [];
    for (let l = 0; l < this.W.length; l++) {
      const pre = addV(dotMV(this.W[l], this.a[l]), this.b[l]);
      this.z.push(pre);
      const isOutput = l === this.W.length - 1;
      const actKey = isOutput ? this.outputActivation : this.hiddenActivation;
      this.a.push(activations[actKey].f(pre));
    }
    return this.a[this.a.length - 1];
  }

  predict(x) { return this.forward(x); }

  // Single-sample backward update (SGD)
  backward(target, lr = 0.1) {
    const L = this.W.length;
    // Compute loss gradient w.r.t output activation
    const y = Array.isArray(target) ? target.slice() : [target];
    const aL = this.a[L];
    let delta;
    if (this.loss === 'bce' && this.outputActivation === 'sigmoid' && aL.length === 1 && y.length === 1) {
      // For sigmoid + BCE, dL/dz = a - y (nice simplification)
      delta = [aL[0] - y[0]];
    } else {
      // General: delta = (dL/da) * (da/dz)
      let dL_da;
      if (this.loss === 'mse') {
        // L = 0.5 * ||a - y||^2, dL/da = a - y
        dL_da = subV(aL, y);
      } else { // bce
        // numerical-safe BCE gradient per-output: dL/da = (a - y)/(a(1-a)) then multiply by sig' = a(1-a) -> (a - y)
        dL_da = subV(aL, y);
      }
      const actKey = this.outputActivation;
      const da_dz = activations[actKey].df(this.z[L-1]);
      delta = hadamard(dL_da, da_dz);
    }

    // Backprop through layers
    const dW = new Array(L);
    const db = new Array(L);
    for (let l = L - 1; l >= 0; l--) {
      const aPrev = this.a[l]; // [in]
      // Gradients for this layer
      dW[l] = outer(delta, aPrev); // [out][in]
      db[l] = delta.slice(); // [out]

      if (l > 0) {
        // Propagate to previous layer
        const WT = mat(this.W[l][0].length, this.W[l].length, (r,c) => this.W[l][c][r]);
        let deltaPrev = dotMV(WT, delta);
        const da_dz_prev = activations[this.hiddenActivation].df(this.z[l-1]);
        delta = hadamard(deltaPrev, da_dz_prev);
      }
    }

    // SGD step
    for (let l = 0; l < L; l++) {
      for (let i = 0; i < this.W[l].length; i++) {
        for (let j = 0; j < this.W[l][0].length; j++) {
          this.W[l][i][j] -= lr * dW[l][i][j];
        }
      }
      for (let i = 0; i < this.b[l].length; i++) {
        this.b[l][i] -= lr * db[l][i];
      }
    }
  }

  trainEpoch(dataset, lr = 0.1, batchSize = 1, seed = 99) {
    const { X, y } = dataset;
    const idx = range(X.length);
    const rand = makePRNG(seed);
    shuffleInPlace(idx, rand);
    for (let i = 0; i < idx.length; i++) {
      const k = idx[i];
      const out = this.forward(X[k]);
      const target = Array.isArray(y[k]) ? y[k] : [y[k]];
      this.backward(target, lr);
    }
  }

  lossOnDataset(dataset) {
    const { X, y } = dataset;
    let total = 0;
    for (let i = 0; i < X.length; i++) {
      const pred = this.forward(X[i]);
      const target = Array.isArray(y[i]) ? y[i] : [y[i]];
      if (this.loss === 'mse') {
        const diff = subV(pred, target);
        total += 0.5 * diff.reduce((s, v) => s + v*v, 0);
      } else {
        // BCE for single-output
        const p = Math.min(Math.max(pred[0], 1e-7), 1 - 1e-7);
        const t = target[0];
        total += -(t * Math.log(p) + (1 - t) * Math.log(1 - p));
      }
    }
    return total / X.length;
  }
}

import { makePRNG } from './util';

export function generateXOR() {
  // Inputs in [-1, 1] for stability
  const X = [
    [-1, -1], // 0
    [-1, 1],  // 1
    [1, -1],  // 1
    [1, 1],   // 0
  ];
  const y = [0, 1, 1, 0];
  return { X, y };
}

export function generateRegression(n = 64, seed = 42, a = 2.0, b = -1.0, noise = 0.2) {
  const rand = makePRNG(seed);
  const X = [];
  const y = [];
  for (let i = 0; i < n; i++) {
    const x = -1 + 2 * rand();
    const yn = a * x + b + (rand() * 2 - 1) * noise;
    X.push([x]);
    y.push(yn);
  }
  return { X, y };
}

export function generateMoons(n = 200, seed = 7, noise = 0.08) {
  const rand = makePRNG(seed);
  const X = [];
  const y = [];
  for (let i = 0; i < n; i++) {
    const t = Math.PI * rand();
    const r = 1 + (rand() * 2 - 1) * noise;
    // first moon centered at (0,0)
    const x1 = r * Math.cos(t);
    const y1 = r * Math.sin(t);
    X.push([x1, y1]);
    y.push(0);
  }
  for (let i = 0; i < n; i++) {
    const t = Math.PI * rand();
    const r = 1 + (rand() * 2 - 1) * noise;
    // second moon shifted
    const x2 = 1 - r * Math.cos(t);
    const y2 = -0.5 - r * Math.sin(t);
    X.push([x2, y2]);
    y.push(1);
  }
  // Normalize roughly into [-1,1] box
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
  for (const [xi, yi] of X) {
    if (xi < minx) minx = xi; if (xi > maxx) maxx = xi;
    if (yi < miny) miny = yi; if (yi > maxy) maxy = yi;
  }
  const sx = 2 / (maxx - minx);
  const sy = 2 / (maxy - miny);
  for (let i = 0; i < X.length; i++) {
    X[i][0] = -1 + (X[i][0] - minx) * sx;
    X[i][1] = -1 + (X[i][1] - miny) * sy;
  }
  return { X, y };
}

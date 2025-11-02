"use client";
import { useMemo, useRef, useState } from 'react';
import Controls from '../../../components/Controls';
import Canvas2D from '../../../components/Canvas2D';
import LineChart from '../../../components/LineChart';
import { MLP } from '../../../lib/nn';
import { generateRegression } from '../../../lib/datasets';

export default function RegressionPage() {
  const [cfg, setCfg] = useState({ lr: 0.05, epochs: 200, hidden: 0, activation: 'linear', seed: 7 });
  const [regCfg, setRegCfg] = useState({ n: 80, a: 1.8, b: -0.5, noise: 0.2 });
  const [losses, setLosses] = useState([]);
  const modelRef = useRef(null);
  const dataset = useMemo(() => generateRegression(regCfg.n, cfg.seed, regCfg.a, regCfg.b, regCfg.noise), [cfg.seed, regCfg]);

  function reset() {
    const layers = [1];
    if (cfg.hidden > 0) { layers.push(cfg.hidden); }
    layers.push(1);
    modelRef.current = new MLP(layers, {
      hiddenActivation: cfg.activation,
      outputActivation: 'linear',
      loss: 'mse',
      seed: cfg.seed,
    });
    setLosses([]);
  }

  if (!modelRef.current) reset();

  function train(epochs) {
    const m = modelRef.current;
    const ls = [];
    for (let e = 0; e < epochs; e++) {
      m.trainEpoch(dataset, cfg.lr, 1, cfg.seed + e);
      ls.push(m.lossOnDataset(dataset));
    }
    setLosses(prev => [...prev, ...ls]);
  }

  // Prepare points and fitted line
  const pts = dataset.X.map((p, i) => ({ x: p[0], y: dataset.y[i], label: 2 }));
  const linePts = [];
  for (let i = 0; i <= 100; i++) {
    const x = -1 + 2 * (i/100);
    const y = modelRef.current.predict([x])[0];
    linePts.push({ x, y, label: 2 });
  }

  return (
    <div>
      <h1>Linear Regression with Gradient Descent</h1>
      <p className="small">Simple regression using an MLP with linear output and MSE loss.</p>
      <Controls
        defaults={cfg}
        onChange={setCfg}
        onAction={(act) => {
          if (act === 'reset') reset();
          if (act === 'step') train(1);
          if (act === 'train') train(cfg.epochs);
        }}
      />
      <div className="row">
        <div className="panel">
          <h3>Fit</h3>
          <Canvas2D
            points={[...pts, ...linePts]}
            domain={[-1.2, 1.2, -2.5, 2.5]}
          />
          <div className="legend">
            <div className="dot" style={{ background:'#d0def4' }} /> <span className="small">data + fit</span>
          </div>
          <div className="small">Data: y = {regCfg.a}x + {regCfg.b} + noise({regCfg.noise})</div>
        </div>
        <div className="panel">
          <h3>Loss</h3>
          <LineChart data={losses} yLabel="MSE" />
          <div className="small">Current loss: {losses.length? losses[losses.length-1].toFixed(4): '?'}</div>
        </div>
      </div>
    </div>
  );
}

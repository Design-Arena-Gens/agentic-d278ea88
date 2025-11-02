"use client";
import { useMemo, useRef, useState } from 'react';
import Controls from '../../../components/Controls';
import Canvas2D from '../../../components/Canvas2D';
import LineChart from '../../../components/LineChart';
import { MLP } from '../../../lib/nn';
import { generateXOR } from '../../../lib/datasets';

export default function XORPage() {
  const [cfg, setCfg] = useState({ lr: 0.2, epochs: 200, hidden: 8, activation: 'tanh', seed: 1 });
  const modelRef = useRef(null);
  const [losses, setLosses] = useState([]);
  const dataset = useMemo(() => generateXOR(), []);

  function reset() {
    modelRef.current = new MLP([2, cfg.hidden, 1], {
      hiddenActivation: cfg.activation,
      outputActivation: 'sigmoid',
      loss: 'bce',
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

  const points = dataset.X.map((p, i) => ({ x: p[0], y: p[1], label: dataset.y[i] }));
  const decisionFn = (x, y) => modelRef.current.predict([x, y])[0];

  return (
    <div>
      <h1>XOR with Backpropagation</h1>
      <p className="small">A two-layer MLP trained with SGD and binary cross-entropy.</p>
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
          <h3>Decision boundary</h3>
          <Canvas2D points={points} decisionFn={decisionFn} domain={[-1.2, 1.2, -1.2, 1.2]} />
          <div className="legend">
            <div className="dot" style={{ background:'#59d499' }} /> <span className="small">class 0</span>
            <div className="dot" style={{ background:'#ff7aa2' }} /> <span className="small">class 1</span>
          </div>
        </div>
        <div className="panel">
          <h3>Loss</h3>
          <LineChart data={losses} yLabel="BCE" />
          <div className="small">Current loss: {losses.length? losses[losses.length-1].toFixed(4): '?'}</div>
        </div>
      </div>
    </div>
  );
}

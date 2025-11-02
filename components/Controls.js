"use client";
import { useState, useEffect } from 'react';

export default function Controls({ defaults, onChange, onAction }) {
  const [lr, setLr] = useState(defaults.lr ?? 0.1);
  const [epochs, setEpochs] = useState(defaults.epochs ?? 50);
  const [hidden, setHidden] = useState(defaults.hidden ?? 8);
  const [activation, setActivation] = useState(defaults.activation ?? 'tanh');
  const [seed, setSeed] = useState(defaults.seed ?? 42);

  useEffect(() => {
    onChange && onChange({ lr: +lr, epochs: +epochs, hidden: +hidden, activation, seed: +seed });
  }, [lr, epochs, hidden, activation, seed]);

  return (
    <div className="controls">
      <div className="control">
        <label>Learning rate</label>
        <input type="number" step="0.001" value={lr} onChange={e => setLr(e.target.value)} />
      </div>
      <div className="control">
        <label>Epochs</label>
        <input type="number" step="1" value={epochs} onChange={e => setEpochs(e.target.value)} />
      </div>
      <div className="control">
        <label>Hidden size</label>
        <input type="number" step="1" value={hidden} onChange={e => setHidden(e.target.value)} />
      </div>
      <div className="control">
        <label>Activation</label>
        <select value={activation} onChange={e => setActivation(e.target.value)}>
          <option value="tanh">tanh</option>
          <option value="relu">relu</option>
          <option value="sigmoid">sigmoid</option>
          <option value="linear">linear</option>
        </select>
      </div>
      <div className="control">
        <label>Seed</label>
        <input type="number" step="1" value={seed} onChange={e => setSeed(e.target.value)} />
      </div>
      <button className="button" onClick={() => onAction && onAction('train')}>Train</button>
      <button className="button secondary" onClick={() => onAction && onAction('step')}>Step 1 Epoch</button>
      <button className="button danger" onClick={() => onAction && onAction('reset')}>Reset</button>
    </div>
  );
}

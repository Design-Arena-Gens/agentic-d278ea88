"use client";
import { useEffect, useRef } from 'react';

// Renders dataset points and optional decision boundary heatmap
export default function Canvas2D({
  width = 640,
  height = 360,
  points = [], // [{x,y,label}]
  decisionFn = null, // (x,y) -> prob in [0,1]
  domain = [-1, 1, -1, 1], // xmin, xmax, ymin, ymax
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const [xmin, xmax, ymin, ymax] = domain;
    const sx = (x) => (x - xmin) / (xmax - xmin) * width;
    const sy = (y) => height - (y - ymin) / (ymax - ymin) * height;

    // Background decision boundary
    if (decisionFn) {
      const step = 4; // pixels
      for (let py = 0; py < height; py += step) {
        for (let px = 0; px < width; px += step) {
          const x = xmin + (px / width) * (xmax - xmin);
          const y = ymin + ((height - py) / height) * (ymax - ymin);
          const p = decisionFn(x, y);
          const c0 = [34, 53, 86];
          const c1 = [106, 165, 255];
          const r = Math.round(c0[0] * (1-p) + c1[0] * p);
          const g = Math.round(c0[1] * (1-p) + c1[1] * p);
          const b = Math.round(c0[2] * (1-p) + c1[2] * p);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(px, py, step, step);
        }
      }
    } else {
      ctx.fillStyle = '#0b0f15';
      ctx.fillRect(0,0,width,height);
    }

    // Axes
    ctx.strokeStyle = '#1f2630';
    ctx.lineWidth = 1;
    // x=0
    const x0 = sx(0); if (x0 >= 0 && x0 <= width) { ctx.beginPath(); ctx.moveTo(x0,0); ctx.lineTo(x0,height); ctx.stroke(); }
    // y=0
    const y0 = sy(0); if (y0 >= 0 && y0 <= height) { ctx.beginPath(); ctx.moveTo(0,y0); ctx.lineTo(width,y0); ctx.stroke(); }

    // Points
    for (const p of points) {
      const cx = sx(p.x);
      const cy = sy(p.y);
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI*2);
      ctx.fillStyle = p.label === 1 ? '#ff7aa2' : '#59d499';
      if (typeof p.label === 'number' && p.label !== 0 && p.label !== 1) {
        ctx.fillStyle = '#d0def4';
      }
      ctx.fill();
      ctx.strokeStyle = '#0a0f16';
      ctx.stroke();
    }
  }, [width, height, points, decisionFn, domain]);

  return <canvas className="canvas" ref={canvasRef} />;
}

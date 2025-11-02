"use client";

export default function LineChart({ width=640, height=180, data = [], color = '#6aa5ff', yLabel = 'loss' }) {
  const pad = { left: 40, right: 10, top: 10, bottom: 24 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const xs = data.map((_, i) => i);
  const minX = 0, maxX = Math.max(1, xs[xs.length-1] ?? 1);
  const minY = Math.min(...data, 0), maxY = Math.max(...data, 1);
  function sx(x) { return pad.left + (x - minX) / (maxX - minX) * w; }
  function sy(y) { return pad.top + h - (y - minY) / (maxY - minY || 1) * h; }

  const path = data.map((y, i) => `${i===0?'M':'L'}${sx(i)},${sy(y)}`).join(' ');

  return (
    <svg width={width} height={height} style={{ width: '100%', height }}>
      <rect x={0} y={0} width={width} height={height} fill="#0b0f15" stroke="#1f2630" />
      {/* Axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top+h} stroke="#2a3444" />
      <line x1={pad.left} y1={pad.top+h} x2={pad.left+w} y2={pad.top+h} stroke="#2a3444" />
      {/* Labels */}
      <text x={pad.left - 10} y={pad.top + 12} fill="#9fb0c0" fontSize="10" textAnchor="end">{maxY.toFixed(3)}</text>
      <text x={pad.left - 10} y={pad.top + h} fill="#9fb0c0" fontSize="10" textAnchor="end">{minY.toFixed(3)}</text>
      <text x={pad.left + w} y={pad.top + h + 14} fill="#9fb0c0" fontSize="10" textAnchor="end">epoch</text>
      <text x={pad.left + 6} y={pad.top + 12} fill="#9fb0c0" fontSize="10">{yLabel}</text>
      {/* Line */}
      {data.length > 1 && <path d={path} stroke={color} fill="none" strokeWidth={2} />}
    </svg>
  );
}

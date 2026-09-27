export default function TrendAreaChart({ points, height = 220 }) {
  const width = 640;
  const paddingLeft = 28;
  const paddingRight = 14;
  const paddingBottom = 24;
  const paddingTop = 14;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;
  const sections = 4;

  const maxValue = Math.max(1, ...points.map((p) => p.value));
  const niceMax = Math.max(sections, Math.ceil(maxValue / sections) * sections);

  const stepX = points.length > 1 ? chartW / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: paddingLeft + i * stepX,
    y: paddingTop + chartH - (p.value / niceMax) * chartH,
    ...p,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${coords[coords.length - 1]?.x ?? paddingLeft},${paddingTop + chartH} L${coords[0]?.x ?? paddingLeft},${paddingTop + chartH} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label="Violations reported over time"
      style={{ animation: 'scaleIn 0.5s var(--ease-spring) both', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="sv-trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sv-primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--sv-primary)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {Array.from({ length: sections + 1 }).map((_, i) => {
        const y = paddingTop + chartH - (chartH / sections) * i;
        const value = Math.round((niceMax / sections) * i);
        return (
          <g key={i}>
            <line x1={paddingLeft} x2={width - paddingRight} y1={y} y2={y} stroke="var(--slate-200)" strokeDasharray="4 4" />
            <text x={paddingLeft - 6} y={y + 3} fontSize="9.5" textAnchor="end" fill="var(--slate-400)">{value}</text>
          </g>
        );
      })}

      {coords.length > 1 ? <path d={areaPath} fill="url(#sv-trend-fill)" stroke="none" /> : null}
      {coords.length > 1 ? <path d={linePath} fill="none" stroke="var(--sv-primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {coords.map((c) => (
        <circle key={c.month} cx={c.x} cy={c.y} r={3.5} fill="var(--sv-primary)" />
      ))}
      {coords.map((c) => (
        <text key={`${c.month}-label`} x={c.x} y={height - 6} fontSize="10" textAnchor="middle" fill="var(--slate-500)">
          {c.month}
        </text>
      ))}
      <line x1={paddingLeft} x2={width - paddingRight} y1={paddingTop + chartH} y2={paddingTop + chartH} stroke="var(--slate-300)" />
    </svg>
  );
}

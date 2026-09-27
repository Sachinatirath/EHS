// Curved area line with data points — the "Inspection Completion Rate" chart
// (mobile: gifted-charts LineChart `curved` + `areaChart`, primary teal).
export default function TrendAreaChart({ months, values, height = 220 }) {
  const width = 640;
  const paddingLeft = 30;
  const paddingRight = 16;
  const paddingBottom = 24;
  const paddingTop = 14;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;
  const sections = 4;
  const niceMax = 100;

  const stepX = values.length > 1 ? chartW / (values.length - 1) : 0;
  const coords = values.map((v, i) => ({
    x: paddingLeft + i * stepX,
    y: paddingTop + chartH - (v / niceMax) * chartH,
    month: months[i],
  }));

  // Catmull-Rom -> cubic Bezier for the same smooth "curved" look as the mobile chart.
  const linePath = coords.reduce((d, c, i) => {
    if (i === 0) return `M${c.x.toFixed(1)},${c.y.toFixed(1)}`;
    const p0 = coords[i - 2] ?? coords[i - 1];
    const p1 = coords[i - 1];
    const p3 = coords[i + 1] ?? c;
    const cp1x = p1.x + (c.x - p0.x) / 6;
    const cp1y = p1.y + (c.y - p0.y) / 6;
    const cp2x = c.x - (p3.x - p1.x) / 6;
    const cp2y = c.y - (p3.y - p1.y) / 6;
    return `${d} C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`;
  }, '');
  const baseY = paddingTop + chartH;
  const areaPath = `${linePath} L${coords[coords.length - 1]?.x ?? paddingLeft},${baseY} L${coords[0]?.x ?? paddingLeft},${baseY} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label="Inspection completion rate over time"
      style={{ animation: 'scaleIn 0.5s var(--ease-spring) both', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="fa-trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F766E" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0F766E" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {Array.from({ length: sections + 1 }).map((_, i) => {
        const y = paddingTop + chartH - (chartH / sections) * i;
        return (
          <g key={i}>
            <line x1={paddingLeft} x2={width - paddingRight} y1={y} y2={y} stroke="var(--slate-200)" strokeDasharray="4 4" />
            <text x={paddingLeft - 6} y={y + 3} fontSize="9.5" textAnchor="end" fill="var(--slate-400)">{(niceMax / sections) * i}</text>
          </g>
        );
      })}

      {coords.length > 1 ? <path d={areaPath} fill="url(#fa-trend-fill)" stroke="none" /> : null}
      {coords.length > 1 ? <path d={linePath} fill="none" stroke="#0F766E" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {coords.map((c) => (
        <circle key={c.month} cx={c.x} cy={c.y} r={4} fill="#0F766E" />
      ))}
      {coords.map((c) => (
        <text key={`${c.month}-label`} x={c.x} y={height - 6} fontSize="10" textAnchor="middle" fill="var(--slate-500)">
          {c.month}
        </text>
      ))}
      <line x1={paddingLeft} x2={width - paddingRight} y1={baseY} y2={baseY} stroke="var(--slate-300)" />
    </svg>
  );
}

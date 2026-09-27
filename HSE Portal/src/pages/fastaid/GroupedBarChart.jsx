// Grouped bars: one group per month, one bar per department series (the same
// chart the mobile OHC dashboard renders with react-native-gifted-charts).
export default function GroupedBarChart({ months, series, height = 240 }) {
  const width = 640;
  const paddingLeft = 32;
  const paddingRight = 10;
  const paddingBottom = 26;
  const paddingTop = 10;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;
  const sections = 4;

  const maxValue = Math.max(1, ...series.flatMap((s) => s.values));
  const niceMax = Math.max(sections, Math.ceil(maxValue / sections) * sections);

  const groupWidth = chartW / Math.max(1, months.length);
  const barGap = 3;
  const barWidth = Math.max(6, (groupWidth - barGap * (series.length + 1)) / series.length);

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Refill requests by department"
        style={{ animation: 'scaleIn 0.5s var(--ease-spring) both', overflow: 'visible' }}
      >
        {Array.from({ length: sections + 1 }).map((_, i) => {
          const y = paddingTop + chartH - (chartH / sections) * i;
          const value = Math.round((niceMax / sections) * i);
          return (
            <g key={i}>
              <line x1={paddingLeft} x2={width - paddingRight} y1={y} y2={y} stroke="var(--slate-200)" strokeDasharray="4 4" />
              <text x={paddingLeft - 8} y={y + 3} fontSize="9.5" textAnchor="end" fill="var(--slate-400)">{value}</text>
            </g>
          );
        })}

        {months.map((month, mi) => {
          const gx = paddingLeft + mi * groupWidth;
          return (
            <g key={month}>
              {series.map((s, si) => {
                const barH = (s.values[mi] / niceMax) * chartH;
                const x = gx + barGap + si * (barWidth + barGap);
                return <rect key={s.key} x={x} y={paddingTop + chartH - barH} width={barWidth} height={barH} rx={2.5} fill={s.color} />;
              })}
              <text x={gx + groupWidth / 2} y={height - 8} fontSize="9.5" textAnchor="middle" fill="var(--slate-500)">
                {month}
              </text>
            </g>
          );
        })}
        <line x1={paddingLeft} x2={width - paddingRight} y1={paddingTop + chartH} y2={paddingTop + chartH} stroke="var(--slate-300)" />
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
        {series.map((s) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color, display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate-700)' }}>{s.key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GroupedBarChart({ departments, series, height = 240 }) {
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

  const groupCount = Math.max(1, departments.length);
  const groupWidth = chartW / groupCount;
  const barGap = 3;
  const barWidth = Math.max(6, (groupWidth - barGap * (series.length + 1)) / series.length);

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Violations by department"
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

        {departments.length === 0 ? (
          <text x={width / 2} y={paddingTop + chartH / 2} fontSize="12" textAnchor="middle" fill="var(--slate-400)">
            No data yet
          </text>
        ) : null}

        {departments.map((dept, di) => {
          const gx = paddingLeft + di * groupWidth;
          return (
            <g key={dept}>
              {series.map((s, si) => {
                const val = s.values[di];
                const barH = (val / niceMax) * chartH;
                const x = gx + barGap + si * (barWidth + barGap);
                const y = paddingTop + chartH - barH;
                return <rect key={s.status} x={x} y={y} width={barWidth} height={barH} rx={2.5} fill={s.color} />;
              })}
              <text x={gx + groupWidth / 2} y={height - 8} fontSize="9.5" textAnchor="middle" fill="var(--slate-500)">
                {dept.length > 11 ? `${dept.slice(0, 10)}…` : dept}
              </text>
            </g>
          );
        })}
        <line x1={paddingLeft} x2={width - paddingRight} y1={paddingTop + chartH} y2={paddingTop + chartH} stroke="var(--slate-300)" />
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }}>
        {series.map((s) => (
          <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color, display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate-700)' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

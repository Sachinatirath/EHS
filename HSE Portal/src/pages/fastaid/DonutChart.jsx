// Donut with no centre label — the mobile PieChart is `donut` with an empty
// inner circle, so the portal port keeps the hole empty too.
export default function DonutChart({ slices, size = 176, thickness = 28, showLegend = true }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let offsetSoFar = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Most commonly expired or missing items"
        style={{ animation: 'scaleIn 0.55s var(--ease-spring) both' }}
      >
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--slate-100)" strokeWidth={thickness} />
          {total > 0
            ? slices.map((s) => {
                const dash = (s.value / total) * circumference;
                const circle = (
                  <circle
                    key={s.label}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={thickness}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offsetSoFar}
                    strokeLinecap="butt"
                  />
                );
                offsetSoFar += dash;
                return circle;
              })
            : null}
        </g>
      </svg>

      {showLegend ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12, justifyContent: 'center' }}>
        {slices.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: 5, background: s.color, display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate-700)' }}>{s.label}</span>
          </div>
        ))}
      </div> : null}
    </div>
  );
}

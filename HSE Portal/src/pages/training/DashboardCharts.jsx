// Lightweight SVG charts for the Training dashboard (no chart library).

function Legend({ items }) {
  return (
    <div className="trd-legend">
      {items.map((it) => (
        <span key={it.label} className="trd-legend-item">
          <span className="trd-legend-swatch" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function niceMax(value) {
  if (value <= 1) return 1;
  const pow = 10 ** Math.floor(Math.log10(value));
  const n = value / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

export function BarChart({ data, color = 'var(--trd-indigo)', height = 260 }) {
  const width = 460;
  const pad = { top: 10, right: 10, bottom: 70, left: 34 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const ticks = 5;
  const slot = innerW / Math.max(data.length, 1);
  const barW = Math.min(46, slot * 0.72);

  return (
    <svg className="trd-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Bar chart">
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = (max / ticks) * i;
        const y = pad.top + innerH - (v / max) * innerH;
        return (
          <g key={i}>
            <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="trd-grid" />
            <text x={pad.left - 6} y={y + 3} textAnchor="end" className="trd-axis">
              {Number.isInteger(v) ? v : v.toFixed(1)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = pad.left + slot * i + (slot - barW) / 2;
        const y = pad.top + innerH - h;
        const cx = pad.left + slot * i + slot / 2;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={h} rx={4} fill={color} className="trd-bar">
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
            <text
              x={cx}
              y={pad.top + innerH + 14}
              textAnchor="end"
              className="trd-axis"
              transform={`rotate(-25 ${cx} ${pad.top + innerH + 14})`}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function arcPath(cx, cy, r, inner, start, end) {
  const large = end - start > Math.PI ? 1 : 0;
  const p = (radius, a) => [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
  const [x1, y1] = p(r, start);
  const [x2, y2] = p(r, end);
  if (!inner) return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  const [x3, y3] = p(inner, end);
  const [x4, y4] = p(inner, start);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`;
}

export function PieChart({ slices, donut = false, size = 220 }) {
  const visible = slices.filter((s) => s.value > 0);
  const total = visible.reduce((sum, s) => sum + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const inner = donut ? r * 0.5 : 0;
  let angle = -Math.PI / 2;

  return (
    <div className="trd-pie">
      <Legend items={slices} />
      <svg className="trd-pie-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Pie chart">
        {total > 0 && visible.length === 1 ? (
          <>
            <circle cx={cx} cy={cy} r={r} fill={visible[0].color} />
            {donut ? <circle cx={cx} cy={cy} r={inner} fill="var(--bg-card)" /> : null}
          </>
        ) : (
          visible.map((s) => {
            const start = angle;
            const end = angle + (s.value / total) * Math.PI * 2;
            angle = end;
            return (
              <path key={s.label} d={arcPath(cx, cy, r, inner, start, end)} fill={s.color} className="trd-slice">
                <title>{`${s.label}: ${s.value}`}</title>
              </path>
            );
          })
        )}
      </svg>
    </div>
  );
}

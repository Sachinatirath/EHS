import { STAT_VARIANTS } from '../data/statColors';

// Shared card/section container — replaces hand-rolled `.panel` divs with
// inline styles so every page gets consistent spacing, radius and borders.
export default function Panel({ title, icon, actions, accent, plain, noMargin, style, bodyStyle, children }) {
  const accentColor = accent && STAT_VARIANTS[accent] ? STAT_VARIANTS[accent].color : accent;
  const panelStyle = {
    ...(noMargin ? { margin: 0 } : null),
    ...(accentColor ? { borderTop: `3px solid ${accentColor}` } : null),
    ...style,
  };

  return (
    <div className="panel" style={panelStyle}>
      {title && !plain ? (
        <div className="panel-header">
          {icon}
          <span style={{ flex: 1 }}>{title}</span>
          {actions}
        </div>
      ) : null}
      <div className="panel-body" style={bodyStyle}>
        {title && plain ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>{icon}{title}</h3>
            {actions}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

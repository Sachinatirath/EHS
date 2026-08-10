export default function PageHeader({ title, subtitle, actions, badge }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 className="page-title" style={{ marginBottom: 4 }}>{title}</h1>
          {badge}
        </div>
        {subtitle ? <p className="page-subtitle" style={{ margin: 0 }}>{subtitle}</p> : null}
      </div>
      {actions ? <div className="btn-row" style={{ marginTop: 0 }}>{actions}</div> : null}
    </div>
  );
}

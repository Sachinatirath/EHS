/** Status dropdown + date range shared by every list page. */
export default function ListFilters({
  statusLabel = 'Status', statusOptions, status, onStatus, from, to, onFrom, onTo, disabled, children,
}) {
  const active = status !== 'all' || from || to;
  const clear = () => {
    onStatus('all');
    onFrom('');
    onTo('');
  };

  return (
    <div className="list-filters">
      <div className="list-filters-group">{children}</div>
      <div className="list-filters-group list-filters-end">
        <div className="field" style={{ minWidth: 170 }}>
          <label>{statusLabel}</label>
          <select value={status} onChange={(e) => onStatus(e.target.value)} disabled={disabled}>
            {statusOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <div className="field" style={{ minWidth: 150 }}>
          <label>From date</label>
          <input type="date" value={from} max={to || undefined} onChange={(e) => onFrom(e.target.value)} disabled={disabled} />
        </div>
        <div className="field" style={{ minWidth: 150 }}>
          <label>To date</label>
          <input type="date" value={to} min={from || undefined} onChange={(e) => onTo(e.target.value)} disabled={disabled} />
        </div>
        {active ? (
          <button type="button" className="btn btn-outline" style={{ padding: '9px 14px' }} onClick={clear}>Clear filters</button>
        ) : null}
      </div>
    </div>
  );
}

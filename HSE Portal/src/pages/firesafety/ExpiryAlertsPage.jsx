import PageHeader from '../../components/PageHeader';
import { ALERT_RULES } from '../../data/fireSafetyData';

export default function ExpiryAlertsPage({ pushToast, onNavigate }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Expiry & Compliance Alerts"
        subtitle="Automated attention list for service, hydro test, inspection, AMC and corrective action due dates"
      />

      <div className="mini-stat-grid">
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--blue-500)' }}>
          <div className="mini-stat-label">Service Due ≤ 30 Days</div>
          <div className="mini-stat-value">12</div>
          <div className="mini-stat-sub">Fire assets</div>
          <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => onNavigate('fs-register')}>View List</button>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--amber-500)' }}>
          <div className="mini-stat-label">Hydro Test Due</div>
          <div className="mini-stat-value">4</div>
          <div className="mini-stat-sub">Cylinder test control</div>
          <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => onNavigate('fs-refill')}>View List</button>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--green-500)' }}>
          <div className="mini-stat-label">Corrective Actions Overdue</div>
          <div className="mini-stat-value">5</div>
          <div className="mini-stat-sub">Department escalation</div>
          <button
            type="button"
            className="btn"
            style={{ width: '100%', marginTop: 14, background: 'var(--red-100)', color: 'var(--red-600)' }}
            onClick={() => pushToast('Overdue corrective actions escalated to Safety HOD.', 'error')}
          >
            Escalate
          </button>
        </div>
      </div>

      <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--green-500)' }}>
        <div className="panel-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Alert Rules</h3>
          <div className="spec-row">
            {ALERT_RULES.map((r) => (
              <div className="spec-item" key={r.days}>
                <div className="spec-label">{r.days}</div>
                <div className="spec-value">{r.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

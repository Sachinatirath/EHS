import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { RISK_ASSESSMENTS, RISK_PILL, STATUS_PILL } from '../../data/mocData';

export default function RiskAssessmentPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="MOC Risk Assessment"
        subtitle="Identify hazards, impacts, affected documents, controls and residual risk before approval"
      />

      <Panel noMargin plain title="Risk Assessment Method" style={{ borderLeft: '3px solid var(--amber-500)' }}>
        <div className="spec-row">
          <div className="spec-item">
            <div className="spec-label">Likelihood</div>
            <div className="spec-value">1–5</div>
          </div>
          <div className="spec-item">
            <div className="spec-label">Severity</div>
            <div className="spec-value">1–5</div>
          </div>
          <div className="spec-item">
            <div className="spec-label">Initial Risk</div>
            <div className="spec-value">Likelihood × Severity</div>
          </div>
          <div className="spec-item">
            <div className="spec-label">Residual Risk</div>
            <div className="spec-value">After controls</div>
          </div>
        </div>
      </Panel>

      <Panel noMargin>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>MOC</th><th>Hazard / Impact</th><th>Initial L×S</th><th>Risk Level</th>
                <th>Key Controls</th><th>Residual L×S</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {RISK_ASSESSMENTS.map((r) => (
                <tr key={r.mocId}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.mocId}</td>
                  <td>{r.hazard}</td>
                  <td>{r.initial}</td>
                  <td><span className={`pill ${RISK_PILL[r.level]}`}>{r.level}</span></td>
                  <td>{r.controls}</td>
                  <td>{r.residual}</td>
                  <td><span className={`pill ${STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Opened risk assessment for ${r.mocId}.`, 'info')}>
                      Open Risk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

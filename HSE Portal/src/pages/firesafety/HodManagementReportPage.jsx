import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { DEPARTMENT_PERFORMANCE, ESCALATION_FLOW } from '../../data/fireSafetyData';

export default function HodManagementReportPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="HOD / Management Fire Safety Report"
        subtitle="Monthly compliance, audit score, open findings, department performance and critical alerts"
        actions={(
          <button type="button" className="table-link" style={{ fontSize: 14 }} onClick={() => window.print()}>
            Print / PDF
          </button>
        )}
      />

      <div className="mini-stat-grid">
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--blue-500)' }}>
          <div className="mini-stat-label">Assets</div>
          <div className="mini-stat-value">286</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--amber-500)' }}>
          <div className="mini-stat-label">Audit Coverage</div>
          <div className="mini-stat-value">84%</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--green-500)' }}>
          <div className="mini-stat-label">Compliance</div>
          <div className="mini-stat-value">90.5%</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--red-500)' }}>
          <div className="mini-stat-label">Open Findings</div>
          <div className="mini-stat-value">23</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--slate-200)' }}>
          <div className="mini-stat-label">Critical / High</div>
          <div className="mini-stat-value">7</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--slate-200)' }}>
          <div className="mini-stat-label">Closure Rate</div>
          <div className="mini-stat-value">88%</div>
        </div>
      </div>

      <div className="two-col">
        <Panel noMargin plain title="Department Performance" style={{ borderLeft: '3px solid var(--blue-500)' }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Department</th><th>Assets</th><th>Audited</th><th>Findings</th><th>Overdue</th><th>Closure</th></tr>
              </thead>
              <tbody>
                {DEPARTMENT_PERFORMANCE.map((d) => (
                  <tr key={d.department}>
                    <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{d.department}</td>
                    <td>{d.assets}</td>
                    <td>{d.audited}</td>
                    <td>{d.findings}</td>
                    <td>{d.overdue}</td>
                    <td>{d.closure}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel noMargin plain title="Management Escalation Flow" style={{ borderLeft: '3px solid var(--amber-500)' }}>
          <ul className="workflow-list">
            {ESCALATION_FLOW.map((s) => (
              <li key={s.title} style={{ cursor: 'pointer' }} onClick={() => pushToast(s.title, 'info')}>
                <span className="step-dot" />
                <div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

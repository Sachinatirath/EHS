import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconBell, IconCheckCircle } from '../../components/icons';
import { CATEGORY_META, useGemba, isEscalated, formatTarget, formatDuration } from './store';

/** Plant Head view: Gemba observations that missed their target date & time without being closed. */
export default function GembaEscalations() {
  const { records, now } = useGemba();
  const rows = records
    .filter((o) => isEscalated(o, now))
    .sort((a, b) => new Date(a.targetDateTime) - new Date(b.targetDateTime));

  return (
    <div className="page-enter">
      <PageHeader
        title="Plant Head Escalations"
        subtitle="Observations that missed their target completion time are escalated here automatically for direct intervention"
        badge={<span className="pill pill-red">{rows.length} overdue</span>}
      />

      <Panel title="Overdue SLA Escalations" icon={<IconBell size={17} />} accent="red">
        {rows.length ? (
          <div className="table-wrap">
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Ref ID</th><th>Missed Target / Overdue By</th><th>Observer (Emp ID)</th><th>Location &amp; Area</th>
                  <th>Category</th><th>Observation Description</th><th>Defaulting Action Owner</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} className="gemba-row-escalated">
                    <td style={{ fontWeight: 700, color: 'var(--red-700)' }}>{o.id}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: 'var(--red-600)' }}>{formatTarget(o.targetDateTime)}</div>
                      <span className="pill pill-red gemba-pulse" style={{ marginTop: 4 }}>Overdue {formatDuration(now - new Date(o.targetDateTime))}</span>
                    </td>
                    <td><div style={{ fontWeight: 700 }}>{o.observerName}</div><div className="gemba-sub">Emp ID: {o.employeeId}</div></td>
                    <td><div style={{ fontWeight: 600 }}>{o.area}</div><div className="gemba-sub">{o.location}</div></td>
                    <td><span className={`pill ${CATEGORY_META[o.category]?.pill}`}>{o.category}</span></td>
                    <td className="gemba-details" title={o.description}><div className="gemba-clamp">{o.description}</div></td>
                    <td><span className="gemba-owner">{o.assignedTo}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gemba-all-clear"><IconCheckCircle size={18} /> All observations are resolved or within their target SLA time. No escalations active.</div>
        )}
      </Panel>
    </div>
  );
}

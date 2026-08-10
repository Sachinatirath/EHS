import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import {
  IconPlus, IconFileText, IconPercent, IconAlertTriangle, IconCheckSquare, IconRepeat, IconArchive,
} from '../../components/icons';
import { REVIEW_INBOX, DOC_TYPE_DISTRIBUTION, STATUS_PILL, PRIORITY_PILL } from '../../data/docReviewData';

export default function DocReviewDashboard({ pushToast, onNavigate }) {
  const topInbox = REVIEW_INBOX.slice(0, 4);

  return (
    <div className="page-enter">
      <PageHeader
        title="Doc Review Dashboard"
        subtitle="Controlled document lifecycle — review, approval and revision tracking"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('dr-submit')}>
            <IconPlus /> Submit New Document
          </button>
        )}
      />

      <div className="stat-grid">
        <StatCard value={247} label="Total Controlled Docs" color="#2563eb" bg="#eef4ff" icon={<IconFileText size={18} />} delay={0} />
        <StatCard value="89%" label="Review Compliance" color="#b45309" bg="#fef1d6" icon={<IconPercent size={18} />} delay={40} />
        <StatCard value={5} label="Overdue Reviews" color="#dc2626" bg="#fde0e0" icon={<IconAlertTriangle size={18} />} delay={80} />
        <StatCard value={9} label="Pending Approval" color="#15803d" bg="#d9f6e4" icon={<IconCheckSquare size={18} />} delay={120} />
        <StatCard value={7} label="Revision Requests" color="#b45309" bg="#fef1d6" icon={<IconRepeat size={18} />} delay={160} />
        <StatCard value={13} label="Archived" color="#2563eb" bg="#eef4ff" icon={<IconArchive size={18} />} delay={200} />
      </div>

      <div className="two-col">
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Document Type Distribution</h3>
            {DOC_TYPE_DISTRIBUTION.map((d) => {
              const pct = Math.round((d.count / 247) * 100);
              return (
                <div className="dept-bar-row" key={d.type}>
                  <div className="dept-bar-head">
                    <span>{d.type}</span>
                    <span>{d.count}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--amber-500)' }}>
          <div className="panel-body">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Review Inbox Preview</h3>
            {topInbox.map((d) => (
              <div key={d.id} className="finding-item" onClick={() => pushToast(`${d.id} opened.`, 'info')}>
                <div className="finding-title">
                  {d.id} — {d.title} <span className={`pill ${PRIORITY_PILL[d.priority]}`} style={{ marginLeft: 6 }}>{d.priority}</span>
                </div>
                <div className="finding-meta">
                  Due {d.reviewDue} · <span className={`pill ${STATUS_PILL[d.status]}`} style={{ marginLeft: 4 }}>{d.status}</span>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => onNavigate('dr-inbox')}>
              Open Review Inbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

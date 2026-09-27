import PageHeader from '../../components/PageHeader';
import { MASTER_REGISTER, TYPE_PILL, STATUS_PILL } from '../../data/docReviewData';

export default function MasterRegisterPage({ pushToast }) {
  return (
    <div className="page-enter">
      <PageHeader
        title="Master Document Register"
        subtitle="Complete controlled document inventory with revision history, location, and availability"
        actions={(
          <button type="button" className="table-link" style={{ fontSize: 14 }} onClick={() => pushToast('Master register exported.', 'info')}>
            Export Register
          </button>
        )}
      />

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doc. No.</th><th>Issue Date</th><th>Title</th><th>Type</th>
                <th>Version</th><th>Review Due</th><th>Department</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {MASTER_REGISTER.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{d.id}</td>
                  <td>{d.issueDate}</td>
                  <td style={{ fontWeight: 600 }}>{d.title}</td>
                  <td><span className={`pill ${TYPE_PILL[d.type]}`}>{d.type}</span></td>
                  <td>{d.version}</td>
                  <td>{d.reviewDue}</td>
                  <td>{d.department}</td>
                  <td><span className={`pill ${STATUS_PILL[d.status]}`}>{d.status}</span></td>
                  <td>
                    <button type="button" className="table-link" onClick={() => pushToast(`Viewing ${d.id}.`, 'info')}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

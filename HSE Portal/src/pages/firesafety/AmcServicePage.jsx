import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import AmcRequestModal from './AmcRequestModal';
import { IconPlus } from '../../components/icons';
import { AMC_SERVICES, STATUS_PILL } from '../../data/fireSafetyData';

export default function AmcServicePage({ pushToast }) {
  const [rows, setRows] = useState(AMC_SERVICES);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = (service) => {
    setRows((r) => [{ ...service, status: 'SPARE INSTALLED', workshopJob: `WRK-2026-${222 + r.length}` }, ...r]);
    setModalOpen(false);
    pushToast(`${service.id} created for ${service.client}.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="AMC / Service Management"
        subtitle="Client complaints, temporary replacement, workshop jobs, service certificates and return-to-service control"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> New Client Request
          </button>
        )}
      />

      <div className="mini-stat-grid">
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--blue-500)' }}>
          <div className="mini-stat-label">Client Complaints</div>
          <div className="mini-stat-value">24</div>
          <div className="mini-stat-sub">This month</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--amber-500)' }}>
          <div className="mini-stat-label">Temporary Spares Issued</div>
          <div className="mini-stat-value">31</div>
          <div className="mini-stat-sub">Field replacement cycle</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--green-500)' }}>
          <div className="mini-stat-label">Workshop TAT</div>
          <div className="mini-stat-value">2.4 days</div>
          <div className="mini-stat-sub">Average service turnaround</div>
        </div>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service ID</th><th>Client</th><th>Original Asset</th><th>Complaint</th>
                <th>Temporary Spare</th><th>Workshop Job</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td>{r.client}</td>
                  <td style={{ color: 'var(--blue-700)', fontWeight: 600 }}>{r.assetId}</td>
                  <td>{r.complaint}</td>
                  <td style={{ color: 'var(--blue-700)', fontWeight: 600 }}>{r.spareId}</td>
                  <td>{r.workshopJob}</td>
                  <td><span className={`pill ${STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Tracking ${r.id}.`, 'info')}>
                      {r.status === 'CLOSED' ? 'View' : 'Track'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AmcRequestModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}

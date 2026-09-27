import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import AmcRequestModal from './AmcRequestModal';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { AMC_SERVICES, STATUS_PILL } from '../../data/fireSafetyData';

const STATUSES = ['SPARE INSTALLED', 'UNDER REPAIR', 'CLOSED'];

export default function ServiceRequestsPage({ pushToast }) {
  const [rows, setRows] = useState(AMC_SERVICES);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.id.toLowerCase().includes(q) || r.assetId.toLowerCase().includes(q) || r.client.toLowerCase().includes(q);
    const matchesStatus = status === 'All' || r.status === status;
    return matchesSearch && matchesStatus;
  }), [rows, search, status]);

  const handleSave = (service) => {
    setRows((r) => [{ ...service, status: 'SPARE INSTALLED', workshopJob: `WRK-2026-${222 + r.length}`, requestTime: 'Just now', engineer: service.engineer, spareInstalled: 'Pending' }, ...r]);
    setModalOpen(false);
    pushToast(`${service.id} created for ${service.client}.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="AMC Service Request & Replacement"
        subtitle="Client request → temporary replacement → workshop repair/refill → return → reinstallation → client closure"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> New Client Request
          </button>
        )}
      />

      <div className="mini-stat-grid">
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--blue-500)' }}>
          <div className="mini-stat-label">Open Client Requests</div>
          <div className="mini-stat-value">4</div>
          <div className="mini-stat-sub">Awaiting service / repair</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--amber-500)' }}>
          <div className="mini-stat-label">Temporary Replacements</div>
          <div className="mini-stat-value">6</div>
          <div className="mini-stat-sub">Spare extinguishers deployed</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--green-500)' }}>
          <div className="mini-stat-label">At Workshop</div>
          <div className="mini-stat-value">8</div>
          <div className="mini-stat-sub">Repair / refill / test</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--red-500)' }}>
          <div className="mini-stat-label">Ready for Return</div>
          <div className="mini-stat-value">3</div>
          <div className="mini-stat-sub">Service completed</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--blue-500)' }}>
          <div className="mini-stat-label">Installed Back</div>
          <div className="mini-stat-value">18</div>
          <div className="mini-stat-sub">Closed service jobs</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--green-500)' }}>
          <div className="mini-stat-label">Client Closure</div>
          <div className="mini-stat-value">96%</div>
          <div className="mini-stat-sub">Monthly closure rate</div>
        </div>
      </div>

      <div className="info-callout">
        <strong>AMC Service Model:</strong>&nbsp;Client reports defective fire equipment → field inspection → available spare is installed → defective unit is collected and tagged → workshop repair/refill/test → repaired original returned → spare collected → original reinstalled → client acceptance → closure.
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search request / asset / client..." />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Service Status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button type="button" className="btn btn-outline" onClick={() => pushToast('Service requests exported to CSV.', 'info')}>
          <IconDownload size={15} /> Export CSV
        </button>
      </div>

      <Panel noMargin bodyStyle={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service ID</th><th>Request Time</th><th>Client</th><th>Original Asset</th><th>Complaint</th>
                <th>Engineer</th><th>Temporary Spare</th><th>Spare Installed</th><th>Status</th><th>Workshop Job</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td>{r.requestTime}</td>
                  <td>{r.client}</td>
                  <td style={{ color: 'var(--blue-700)', fontWeight: 600 }}>{r.assetId}</td>
                  <td>{r.complaint}</td>
                  <td>{r.engineer}</td>
                  <td style={{ color: 'var(--blue-700)', fontWeight: 600 }}>{r.spareId}</td>
                  <td>{r.spareInstalled}</td>
                  <td><span className={`pill ${STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td>{r.workshopJob}</td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Tracking ${r.id}.`, 'info')}>Track</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No service requests match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <AmcRequestModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}

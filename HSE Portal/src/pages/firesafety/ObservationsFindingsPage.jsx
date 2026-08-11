import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconSearch, IconDownload } from '../../components/icons';
import { FINDINGS, RISK_LEVELS, STATUS_PILL } from '../../data/fireSafetyData';

const STATUSES = ['OPEN', 'IN PROGRESS', 'VERIFICATION'];

export default function ObservationsFindingsPage({ pushToast }) {
  const [search, setSearch] = useState('');
  const [risk, setRisk] = useState('All');
  const [status, setStatus] = useState('All');

  const filtered = useMemo(() => FINDINGS.filter((f) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || f.observation.toLowerCase().includes(q) || f.assetId.toLowerCase().includes(q);
    const matchesRisk = risk === 'All' || f.risk === risk;
    const matchesStatus = status === 'All' || f.status === status;
    return matchesSearch && matchesRisk && matchesStatus;
  }), [search, risk, status]);

  return (
    <div className="page-enter">
      <PageHeader
        title="Observations & Findings"
        subtitle="Every fire safety observation is assigned to the concern department for corrective action and verification"
        actions={(
          <button type="button" className="btn btn-outline" onClick={() => pushToast('Findings exported to CSV.', 'info')}>
            <IconDownload size={15} /> Export CSV
          </button>
        )}
      />

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search finding..." />
        </div>
        <select value={risk} onChange={(e) => setRisk(e.target.value)}>
          <option value="All">All Risk</option>
          {RISK_LEVELS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <Panel noMargin bodyStyle={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Finding ID</th><th>Asset</th><th>Equipment</th><th>Observation</th>
                <th>Department</th><th>Owner</th><th>Due</th><th>Risk</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{f.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--blue-700)' }}>{f.assetId}</td>
                  <td>{f.equipment}</td>
                  <td>{f.observation}</td>
                  <td>{f.department}</td>
                  <td>{f.owner}</td>
                  <td>{f.due}</td>
                  <td><span className={`pill ${STATUS_PILL[f.risk]}`}>{f.risk}</span></td>
                  <td><span className={`pill ${STATUS_PILL[f.status]}`}>{f.status}</span></td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${f.id}.`, 'info')}>View</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No findings match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

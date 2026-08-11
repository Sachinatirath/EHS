import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { FIRE_AUDITS, AUDIT_RESULTS, STATUS_PILL } from '../../data/fireSafetyData';

export default function FireEquipmentAuditPage({ pushToast, onNavigate }) {
  const [search, setSearch] = useState('');
  const [result, setResult] = useState('All');

  const filtered = useMemo(() => FIRE_AUDITS.filter((a) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || a.id.toLowerCase().includes(q) || a.assetId.toLowerCase().includes(q);
    const matchesResult = result === 'All' || a.result === result;
    return matchesSearch && matchesResult;
  }), [search, result]);

  return (
    <div className="page-enter">
      <PageHeader
        title="Fire Equipment Audit"
        subtitle="Audit completed / pending equipment with checklist score and evidence"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('fs-new-audit')}>
            <IconPlus /> New Audit
          </button>
        )}
      />

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
        </div>
        <select value={result} onChange={(e) => setResult(e.target.value)}>
          <option value="All">All Results</option>
          {AUDIT_RESULTS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <button type="button" className="btn btn-outline" onClick={() => pushToast('Audit list exported to CSV.', 'info')}>
          <IconDownload size={15} /> Export CSV
        </button>
      </div>

      <Panel noMargin bodyStyle={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit No.</th><th>Asset</th><th>Type</th><th>Department</th>
                <th>Date</th><th>Score</th><th>Result</th><th>Risk</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{a.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--blue-700)' }}>{a.assetId}</td>
                  <td>{a.type}</td>
                  <td>{a.department}</td>
                  <td>{a.date}</td>
                  <td style={{ fontWeight: 700 }}>{a.score}%</td>
                  <td><span className={`pill ${STATUS_PILL[a.result]}`}>{a.result}</span></td>
                  <td><span className={`pill ${STATUS_PILL[a.risk]}`}>{a.risk}</span></td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${a.id}.`, 'info')}>View</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No audits match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

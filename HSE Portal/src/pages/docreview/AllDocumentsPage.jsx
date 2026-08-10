import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { IconSearch } from '../../components/icons';
import { DOCUMENTS, DOC_TYPES, TYPE_PILL, STATUS_PILL } from '../../data/docReviewData';

const STATUSES = ['CURRENT', 'UNDER REVIEW', 'REVISION', 'AWAITING APPROVAL'];

export default function AllDocumentsPage({ pushToast }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');

  const filtered = useMemo(() => DOCUMENTS.filter((d) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || d.id.toLowerCase().includes(q) || d.title.toLowerCase().includes(q);
    const matchesType = type === 'All' || d.type === type;
    const matchesStatus = status === 'All' || d.status === status;
    return matchesSearch && matchesType && matchesStatus;
  }), [search, type, status]);

  return (
    <div className="page-enter">
      <PageHeader
        title="All Controlled Documents"
        subtitle="Complete document register with search, filter, and bulk actions"
        actions={(
          <button type="button" className="table-link" style={{ fontSize: 14 }} onClick={() => pushToast('Document list exported to CSV.', 'info')}>
            Export CSV
          </button>
        )}
      />

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, number, keyword..." />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="All">All Types</option>
          {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doc. No.</th><th>Title</th><th>Type</th><th>Version</th><th>Author</th>
                <th>Issue Date</th><th>Review Due</th><th>Department</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{d.id}</td>
                  <td style={{ fontWeight: 600 }}>{d.title}</td>
                  <td><span className={`pill ${TYPE_PILL[d.type]}`}>{d.type}</span></td>
                  <td>{d.version}</td>
                  <td>{d.author}</td>
                  <td>{d.issueDate}</td>
                  <td>{d.reviewDue}</td>
                  <td>{d.department}</td>
                  <td><span className={`pill ${STATUS_PILL[d.status]}`}>{d.status}</span></td>
                  <td>
                    <button type="button" className="table-link" onClick={() => pushToast(`Viewing ${d.id}.`, 'info')}>View</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No documents match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

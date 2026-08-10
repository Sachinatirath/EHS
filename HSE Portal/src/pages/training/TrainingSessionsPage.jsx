import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import CreateTrainingSessionModal from './CreateTrainingSessionModal';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { TRAINING_SESSIONS, SESSION_STATUS_PILL, SESSION_HOD_PILL } from '../../data/trainingData';

export default function TrainingSessionsPage({ pushToast }) {
  const [rows, setRows] = useState(TRAINING_SESSIONS);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.id.toLowerCase().includes(q) || r.topic.toLowerCase().includes(q);
    const matchesStatus = status === 'All' || r.status === status;
    return matchesSearch && matchesStatus;
  }), [rows, search, status]);

  const handleSave = (session) => {
    setRows((r) => [{
      id: session.id,
      topic: session.topic,
      date: session.date || '—',
      trainer: session.trainer || '—',
      participants: session.participants.length,
      status: 'Scheduled',
      hodReview: 'Pending HOD',
    }, ...r]);
    setModalOpen(false);
    pushToast(`${session.id} (${session.topic}) created with ${session.participants.length} participant(s).`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Training Sessions"
        subtitle="One training session can contain 1, 10, 50 or 100+ participants"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> New Training Session
          </button>
        )}
      />

      <div className="info-callout">
        <strong>Multi-employee process:</strong> Create one session → add multiple Employee IDs → validate employees → record attendance and score → save → every participant gets an individual training history entry.
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search training..." />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option>Completed</option>
          <option>Scheduled</option>
        </select>
        <button type="button" className="btn btn-outline" onClick={() => pushToast('Training register exported to CSV.', 'info')}>
          <IconDownload size={15} /> Export Training Register
        </button>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Training</th><th>Date</th><th>Trainer</th>
                <th>Participants</th><th>Status</th><th>HOD Review</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.topic}</td>
                  <td>{r.date}</td>
                  <td>{r.trainer}</td>
                  <td>{r.participants}</td>
                  <td><span className={`pill ${SESSION_STATUS_PILL[r.status] || 'pill-slate'}`}>{r.status}</span></td>
                  <td><span className={`pill ${SESSION_HOD_PILL[r.hodReview] || 'pill-slate'}`}>{r.hodReview}</span></td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${r.id}.`, 'info')}>View</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No training sessions match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateTrainingSessionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}

import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import CreateTrainingSessionModal from './CreateTrainingSessionModal';
import TrainingSessionDetailModal from './TrainingSessionDetailModal';
import { exportTrainingRegisterExcel } from '../../utils/trainingExcel';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { TRAINING_SESSIONS, SESSION_ATTENDEES, SESSION_STATUS_PILL, SESSION_HOD_PILL, formatDate } from '../../data/trainingData';

const participantCount = (s) => (SESSION_ATTENDEES[s.id]?.length || 0) + (s.extraParticipants?.length || 0);
const sessionDate = (s) => (s.endDate && s.endDate !== s.startDate
  ? `${formatDate(s.startDate)} → ${formatDate(s.endDate)}`
  : formatDate(s.startDate));

export default function TrainingSessionsPage({ pushToast }) {
  const [rows, setRows] = useState(TRAINING_SESSIONS);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.id.toLowerCase().includes(q) || r.topic.toLowerCase().includes(q);
    const matchesStatus = status === 'All' || r.status === status;
    return matchesSearch && matchesStatus;
  }), [rows, search, status]);

  const handleExport = async () => {
    if (!filtered.length) {
      pushToast('No training sessions to export for the current filters.', 'error');
      return;
    }
    setExporting(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      await exportTrainingRegisterExcel(filtered, `training-register-${stamp}.xlsx`);
      pushToast(`Exported ${filtered.length} training session(s) with attendees to Excel.`, 'success');
    } catch (err) {
      pushToast(`Export failed: ${err.message}`, 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleSave = (session) => {
    setRows((r) => [{
      id: session.id,
      topic: session.topic,
      startDate: session.date,
      endDate: session.date,
      trainer: session.trainer,
      location: session.location,
      shift: session.shift,
      validity: parseInt(session.validity, 10) || null,
      extraParticipants: session.participants,
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

      <div className="filter-bar">
        <div className="search-field search-field-sm">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search training..." />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option>Completed</option>
          <option>Scheduled</option>
        </select>
        <button type="button" className="btn btn-outline" onClick={handleExport} disabled={exporting}>
          <IconDownload size={15} /> {exporting ? 'Exporting…' : 'Export Training Register'}
        </button>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Date</th><th>Training</th><th>Trainer</th>
                <th>Participants</th><th>Status</th><th>HOD Review</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="ep-row-clickable" onClick={() => setSelected(r)} title="Click to view attendees">
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td>{sessionDate(r)}</td>
                  <td style={{ fontWeight: 600 }}>{r.topic}</td>
                  <td>{r.trainer || '—'}</td>
                  <td>{participantCount(r)}</td>
                  <td><span className={`pill ${SESSION_STATUS_PILL[r.status] || 'pill-slate'}`}>{r.status}</span></td>
                  <td><span className={`pill ${SESSION_HOD_PILL[r.hodReview] || 'pill-slate'}`}>{r.hodReview}</span></td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={(e) => { e.stopPropagation(); setSelected(r); }}>View</button>
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

      <TrainingSessionDetailModal session={selected} onClose={() => setSelected(null)} pushToast={pushToast} />
      <CreateTrainingSessionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}

import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import Modal from '../../components/Modal';
import StatCard from '../../components/StatCard';
import { IconPlus, IconBell, IconFlag, IconAlertTriangle, IconCheckCircle } from '../../components/icons';
import {
  useOhc, findEmployee, followupStatus, completeFollowup, updateFollowup, addFollowup, setPending, todayKey, addDays, fmtDate,
} from './store';
import { ExportBar, EmployeeField, Pill, Empty } from './shared';
import { downloadPdf } from './ohcExport';
import { followupsExcel } from './reports';
import './ohc.css';

const ACTIONS = ['Doctor review', 'OHC follow-up', 'BP check', 'Dressing change', 'Referral — Hospital / Specialist', 'Referral — Orthopaedics', 'Referral — Ophthalmology'];

function CloseModal({ fu, onClose, pushToast }) {
  const [mode, setMode] = useState('complete');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(addDays(todayKey(), 2));
  const emp = findEmployee(fu.employee_id);
  const save = () => {
    if (mode === 'complete') {
      completeFollowup(fu.id, notes.trim() || 'Reviewed — closed.');
      pushToast(`Follow-up for ${emp?.name} closed`, 'success');
    } else {
      updateFollowup(fu.id, { review_date: date, notes: notes.trim() || fu.notes });
      pushToast(`Review moved to ${fmtDate(date)}`, 'success');
    }
    onClose();
  };
  return (
    <Modal open title={`${fu.id} • ${emp?.name}`} onClose={onClose} width={480}>
      <div className="info-callout"><span><strong>{fu.reason}</strong> — {fu.action}. Review date {fmtDate(fu.review_date)}.</span></div>
      <div className="ohc-seg" style={{ marginBottom: 14 }}>
        <button type="button" className={mode === 'complete' ? 'is-active' : ''} onClick={() => setMode('complete')}>Mark Completed</button>
        <button type="button" className={mode === 'reschedule' ? 'is-active' : ''} onClick={() => setMode('reschedule')}>Reschedule</button>
      </div>
      {mode === 'reschedule' ? <div className="field" style={{ marginBottom: 12 }}><label>New Review Date</label><input type="date" min={todayKey()} value={date} onChange={(e) => setDate(e.target.value)} /></div> : null}
      <div className="field"><label>{mode === 'complete' ? 'Closure Notes / Outcome' : 'Reason (optional)'}</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={mode === 'complete' ? 'e.g. Symptoms resolved. Fit for work.' : ''} /></div>
      <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className={`btn ${mode === 'complete' ? 'btn-success' : 'btn-primary'}`} onClick={save}>{mode === 'complete' ? 'Close Follow-up' : 'Save New Date'}</button>
      </div>
    </Modal>
  );
}

function AddModal({ onClose, pushToast }) {
  const [f, setF] = useState({ employee_id: '', reason: '', action: ACTIONS[0], review_date: addDays(todayKey(), 1) });
  const [error, setError] = useState('');
  const save = (e) => {
    e.preventDefault();
    try {
      addFollowup(f);
      pushToast('Follow-up scheduled', 'success');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <Modal open title="Schedule Follow-up / Referral" onClose={onClose} width={560}>
      <form onSubmit={save}>
        <div className="form-grid">
          <EmployeeField value={f.employee_id} onChange={(v) => setF((s) => ({ ...s, employee_id: v }))} required autoFocus />
          <div className="field"><label>Review Date<span className="req">*</span></label><input type="date" value={f.review_date} onChange={(e) => setF((s) => ({ ...s, review_date: e.target.value }))} /></div>
          <div className="field"><label>Reason<span className="req">*</span></label><input value={f.reason} onChange={(e) => setF((s) => ({ ...s, reason: e.target.value }))} /></div>
          <div className="field"><label>Action</label><select value={f.action} onChange={(e) => setF((s) => ({ ...s, action: e.target.value }))}>{ACTIONS.map((a) => <option key={a}>{a}</option>)}</select></div>
        </div>
        {error ? <div className="ohc-error">{error}</div> : null}
        <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Schedule</button>
        </div>
      </form>
    </Modal>
  );
}

const FILTERS = [['open', 'Open'], ['due', 'Due / Overdue'], ['referred', 'Referred'], ['completed', 'Completed'], ['', 'All']];

export default function FollowUpPage({ onNavigate, pushToast }) {
  const { followups } = useOhc();
  const [filter, setFilter] = useState('open');
  const [closing, setClosing] = useState(null);
  const [adding, setAdding] = useState(false);

  const rows = followups.map((f) => ({ ...f, st: followupStatus(f) }));
  const by = (k) => rows.filter((r) => r.st.key === k).length;
  const list = rows
    .filter((r) => {
      if (filter === 'open') return r.status !== 'completed';
      if (filter === 'due') return ['overdue', 'today', 'tomorrow'].includes(r.st.key);
      if (filter === 'referred') return r.status === 'referred';
      if (filter === 'completed') return r.status === 'completed';
      return true;
    })
    .sort((a, b) => a.review_date.localeCompare(b.review_date));

  const pdf = () => downloadPdf({
    title: 'Follow-up & Referral Register',
    filename: `OHC-followups-${todayKey()}.pdf`,
    blocks: [{ heading: `${list.length} records`, columns: ['Employee', 'Reason', 'Action', 'Review Date', 'Status', 'Notes'], widths: [1.8, 1.6, 2, 1.1, 1.1, 2], rows: list.map((f) => [`${f.employee_id} ${findEmployee(f.employee_id)?.name}`, f.reason, f.action, fmtDate(f.review_date), f.st.label, f.notes || '—']) }],
  });

  const openHistory = (id) => {
    setPending('dm-history', { employeeId: id });
    onNavigate('dm-history');
  };

  return (
    <div className="page-enter ohc-page">
      <PageHeader title="Follow-up & Referral" subtitle="Referral, review dates and follow-up closure" actions={<ExportBar pushToast={pushToast} onPdf={pdf} onExcel={() => followupsExcel(list)} />} />

      <div className="stat-grid">
        <StatCard value={by('overdue')} label="Overdue" variant="red" icon={<IconAlertTriangle size={18} />} />
        <StatCard value={by('today') + by('tomorrow')} label="Due today / tomorrow" variant="amber" icon={<IconBell size={18} />} delay={40} />
        <StatCard value={rows.filter((r) => r.status === 'referred').length} label="External referrals open" variant="blue" icon={<IconFlag size={18} />} delay={80} />
        <StatCard value={by('completed')} label="Completed" variant="green" icon={<IconCheckCircle size={18} />} delay={120} />
      </div>

      <div className="filter-bar no-print">
        <div className="ohc-seg">
          {FILTERS.map(([k, label]) => <button key={k} type="button" className={filter === k ? 'is-active' : ''} onClick={() => setFilter(k)}>{label}</button>)}
        </div>
        <button type="button" className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setAdding(true)}><IconPlus size={15} /> Schedule Follow-up</button>
      </div>

      <Panel noMargin>
        {list.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Employee</th><th>Reason</th><th>Action</th><th>Review Date</th><th>Status</th><th>Notes</th><th className="no-print" /></tr></thead>
              <tbody>
                {list.map((f) => (
                  <tr key={f.id}>
                    <td><button type="button" className="table-link" onClick={() => openHistory(f.employee_id)}>{f.employee_id} • {findEmployee(f.employee_id)?.name}</button></td>
                    <td>{f.reason}</td>
                    <td>{f.action}</td>
                    <td>{fmtDate(f.review_date)}</td>
                    <td><Pill meta={f.st} /></td>
                    <td className="ohc-muted">{f.notes || '—'}</td>
                    <td className="no-print">{f.status !== 'completed' ? <button type="button" className="btn btn-outline btn-sm" onClick={() => setClosing(f)}>Update</button> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty title="Nothing here">No follow-ups match this filter.</Empty>}
      </Panel>

      {closing ? <CloseModal fu={closing} onClose={() => setClosing(null)} pushToast={pushToast} /> : null}
      {adding ? <AddModal onClose={() => setAdding(false)} pushToast={pushToast} /> : null}
    </div>
  );
}

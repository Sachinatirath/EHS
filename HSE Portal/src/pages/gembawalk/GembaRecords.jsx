import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import Modal from '../../components/Modal';
import { IconClipboard, IconPlus, IconEye } from '../../components/icons';
import {
  GEMBA_CATEGORIES, GEMBA_STATUSES, CATEGORY_META, useGemba, isEscalated, updateGembaStatus, formatTarget, formatDuration,
} from './store';

/** Status tag: Closed, escalated to Plant Head, or the open status while on SLA. */
export function GembaStatus({ obs, now }) {
  if (obs.status === 'Closed') return <span className="pill pill-green">Closed</span>;
  if (isEscalated(obs, now)) return <span className="pill pill-red gemba-pulse">Escalated</span>;
  return <span className="pill pill-blue">{obs.status}</span>;
}

/** Target date & time with a live countdown (or how long it has been overdue). */
export function GembaTarget({ obs, now }) {
  const left = new Date(obs.targetDateTime) - now;
  let info = null;
  if (obs.status !== 'Closed') {
    info = left <= 0
      ? <div className="gemba-sub" style={{ color: 'var(--red-600)', fontWeight: 700 }}>Overdue {formatDuration(left)}</div>
      : <div className="gemba-sub" style={{ color: left < 3600000 ? 'var(--amber-600)' : 'var(--green-600)', fontWeight: 700 }}>{formatDuration(left)} left</div>;
  }
  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      <div style={{ fontWeight: left <= 0 && obs.status !== 'Closed' ? 700 : 500, color: left <= 0 && obs.status !== 'Closed' ? 'var(--red-600)' : undefined }}>{formatTarget(obs.targetDateTime)}</div>
      {info}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="split-row">
      <span>{label}</span>
      <span style={{ color: 'var(--slate-900)', fontWeight: 700, textAlign: 'right' }}>{children}</span>
    </div>
  );
}

/** Master log of every Gemba observation, with search, filters and status updates. */
export default function GembaRecords({ onNavigate, pushToast }) {
  const { records, now } = useGemba();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');

  const q = query.trim().toLowerCase();
  const rows = records.filter((o) => (category === 'all' || o.category === category)
    && (status === 'all' || (status === 'escalated' ? isEscalated(o, now) : o.status === status))
    && (!q || [o.id, o.observerName, o.employeeId, o.area, o.location, o.assignedTo, o.description].some((f) => (f || '').toLowerCase().includes(q))));
  const selected = records.find((o) => o.id === selectedId) || null;

  const open = (o) => {
    setSelectedId(o.id);
    setNewStatus(o.status);
    setNote('');
  };

  const save = () => {
    if (newStatus === selected.status && !note.trim()) {
      setSelectedId(null);
      return;
    }
    updateGembaStatus(selected.id, newStatus, note);
    pushToast(`${selected.id} updated to ${newStatus}.`, 'success');
    setSelectedId(null);
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="All Observations Log"
        subtitle="Every Gemba observation with observer, time, location, owner, target SLA and escalation status"
        actions={<button type="button" className="btn btn-primary" onClick={() => onNavigate('gw-log')}><IconPlus size={15} /> Log Observation</button>}
      />

      <Panel title="Master Observations Log" icon={<IconClipboard size={17} />}>
        <div className="list-filters">
          <div className="list-filters-group">
            <div className="field" style={{ width: 260 }}>
              <label>Search</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ref ID, observer, location, owner…" />
            </div>
          </div>
          <div className="list-filters-group list-filters-end">
            <div className="field" style={{ minWidth: 170 }}>
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {GEMBA_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field" style={{ minWidth: 170 }}>
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All statuses</option>
                {GEMBA_STATUSES.map((s) => <option key={s}>{s}</option>)}
                <option value="escalated">Escalated to Plant Head</option>
              </select>
            </div>
          </div>
        </div>

        <p className="gemba-hint"><IconEye size={14} /> Click an observation to view it or update its status.</p>
        <div className="table-wrap">
          <table className="data-table compact">
            <thead>
              <tr>
                <th>Ref ID</th><th>Date &amp; Time</th><th>Observer</th><th>Area &amp; Location</th><th>Category</th>
                <th>Observation Details</th><th>Action Owner</th><th>Target SLA</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const esc = isEscalated(o, now);
                return (
                  <tr key={o.id} className={esc ? 'gemba-row-escalated' : undefined} style={{ cursor: 'pointer' }} onClick={() => open(o)}>
                    <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{o.id}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{o.obsDate}<div className="gemba-sub">{o.obsTime}</div></td>
                    <td><div style={{ fontWeight: 700 }}>{o.observerName}</div><div className="gemba-sub">ID: {o.employeeId}</div></td>
                    <td><div style={{ fontWeight: 600, color: 'var(--blue-700)' }}>{o.area}</div><div className="gemba-sub">{o.location}</div></td>
                    <td><span className={`pill ${CATEGORY_META[o.category]?.pill}`}>{o.category}</span></td>
                    <td className="gemba-details" title={o.correctiveAction ? `${o.description}\nAction: ${o.correctiveAction}` : o.description}>
                      <div className="gemba-clamp">{o.description}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.assignedTo}</td>
                    <td><GembaTarget obs={o} now={now} /></td>
                    <td><GembaStatus obs={o} now={now} /></td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No observations match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={!!selected} title={selected ? `${selected.id} · ${selected.category}` : ''} onClose={() => setSelectedId(null)} width={620}>
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><GembaStatus obs={selected} now={now} /><GembaTarget obs={selected} now={now} /></div>
            <div>
              <Row label="Observer">{selected.observerName} ({selected.employeeId})</Row>
              <Row label="Observed on">{selected.obsDate} {selected.obsTime}</Row>
              <Row label="Area">{selected.area}</Row>
              <Row label="Location / Machine">{selected.location}</Row>
              <Row label="Action owner">{selected.assignedTo}</Row>
              <Row label="Observation">{selected.description}</Row>
              {selected.correctiveAction ? <Row label="Corrective action">{selected.correctiveAction}</Row> : null}
              {selected.statusNote ? <Row label="Latest update">{selected.statusNote}</Row> : null}
              {selected.closed_at ? <Row label="Closed on">{new Date(selected.closed_at).toLocaleString()}</Row> : null}
            </div>
            {selected.status !== 'Closed' ? (
              <>
                <div className="form-grid">
                  <div className="field">
                    <label>Update Status</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                      {GEMBA_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Update Note</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was done…" />
                </div>
                <div className="btn-row">
                  <button type="button" className="btn btn-outline" onClick={() => setSelectedId(null)}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={save}>Save Update</button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

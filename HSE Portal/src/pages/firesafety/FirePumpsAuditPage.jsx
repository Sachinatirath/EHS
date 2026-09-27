import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import Panel from '../../components/Panel';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { FIRE_PUMPS, PUMP_TYPES, STATUS_PILL } from '../../data/fireSafetyData';

const todayIso = () => new Date().toISOString().slice(0, 10);
const EMPTY = { id: '', type: PUMP_TYPES[0], location: 'Fire Pump House', tag: '', capacity: '', date: todayIso(), observation: '' };

export default function FirePumpsAuditPage({ pushToast }) {
  const [rows, setRows] = useState(FIRE_PUMPS);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.id.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
    const matchesType = type === 'All' || r.type === type;
    const matchesStatus = status === 'All' || r.status === status;
    return matchesSearch && matchesType && matchesStatus;
  }), [rows, search, type, status]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openModal = () => { setForm({ ...EMPTY, id: `FP-${String(rows.length + 1).padStart(3, '0')}`, date: todayIso() }); setModalOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.id.trim()) {
      pushToast('Asset ID is required.', 'error');
      return;
    }
    setRows((r) => [{ ...form, status: 'VALID', score: 100 }, ...r]);
    setModalOpen(false);
    pushToast(`${form.id} audit created.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Fire Pump Audit & Maintenance"
        subtitle="Jockey Pump • Main Electric Pump • Diesel Pump — inspection, testing, observations, maintenance and compliance tracking"
        actions={(
          <button type="button" className="btn btn-primary" onClick={openModal}>
            <IconPlus /> New Pump Audit
          </button>
        )}
      />

      <div className="mini-stat-grid">
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--blue-500)' }}>
          <div className="mini-stat-label">Total Pumps</div>
          <div className="mini-stat-value">18</div>
          <div className="mini-stat-sub">Registered fire pumps</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--amber-500)' }}>
          <div className="mini-stat-label">Jockey Pumps</div>
          <div className="mini-stat-value">6</div>
          <div className="mini-stat-sub">Pressure maintenance</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--green-500)' }}>
          <div className="mini-stat-label">Main Pumps</div>
          <div className="mini-stat-value">6</div>
          <div className="mini-stat-sub">Electric fire pumps</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--red-500)' }}>
          <div className="mini-stat-label">Diesel Pumps</div>
          <div className="mini-stat-value">6</div>
          <div className="mini-stat-sub">Emergency backup</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--slate-200)' }}>
          <div className="mini-stat-label">Due for Test</div>
          <div className="mini-stat-value">3</div>
          <div className="mini-stat-sub">This week</div>
        </div>
        <div className="mini-stat" style={{ borderLeft: '3px solid var(--slate-200)' }}>
          <div className="mini-stat-label">Open Findings</div>
          <div className="mini-stat-value">5</div>
          <div className="mini-stat-sub">Maintenance action pending</div>
        </div>
      </div>

      <div className="info-callout">
        <strong>Recommended audit flow:</strong>&nbsp;Pump identification → visual inspection → controller/panel check → pressure &amp; suction check → auto/manual start test → running condition → leakage/vibration/noise → diesel fuel/battery/oil checks → discharge performance → observation → maintenance assignment → corrective action → EHS verification → closure.
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pump / location / asset..." />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="All">All Pump Types</option>
          {PUMP_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          {['VALID', 'OBSERVATION', 'TEST DUE'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <button type="button" className="btn btn-outline" onClick={() => pushToast('Fire pump register exported to CSV.', 'info')}>
          <IconDownload size={15} /> Export CSV
        </button>
      </div>

      <Panel noMargin bodyStyle={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pump ID</th><th>Last Test</th><th>Type</th><th>Location</th>
                <th>Tag</th><th>Capacity</th><th>Status</th><th>Score</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: 'var(--blue-700)' }}>{p.id}</td>
                  <td>{p.lastTest}</td>
                  <td>{p.type}</td>
                  <td>{p.location}</td>
                  <td>{p.tag}</td>
                  <td>{p.capacity}</td>
                  <td><span className={`pill ${STATUS_PILL[p.status]}`}>{p.status}</span></td>
                  <td style={{ fontWeight: 700 }}>{p.score}%</td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${p.id}.`, 'info')}>View</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No fire pumps match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={modalOpen} title="New Fire Pump Audit" onClose={() => setModalOpen(false)} width={640}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Asset ID</label>
              <input value={form.id} onChange={set('id')} placeholder="FP-007" />
            </div>
            <div className="field">
              <label>Pump Type</label>
              <select value={form.type} onChange={set('type')}>
                {PUMP_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Location</label>
              <input value={form.location} onChange={set('location')} placeholder="Fire Pump House" />
            </div>
            <div className="field">
              <label>Pump Tag</label>
              <input value={form.tag} onChange={set('tag')} placeholder="JP-01 / MP-E-01 / DP-01" />
            </div>
            <div className="field">
              <label>Capacity / Rating</label>
              <input value={form.capacity} onChange={set('capacity')} placeholder="kW / HP / Flow" />
            </div>
            <div className="field">
              <label>Audit Date</label>
              <input type="date" value={form.date} onChange={set('date')} />
            </div>
          </div>
          <div className="field" style={{ marginTop: 4 }}>
            <label>Initial Observation</label>
            <textarea value={form.observation} onChange={set('observation')} placeholder="Enter audit observation..." />
          </div>
          <div className="field" style={{ marginTop: 4 }}>
            <label>Evidence</label>
            <input type="file" multiple />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Create Audit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

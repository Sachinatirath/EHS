import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import Panel from '../../components/Panel';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { SLINGS, SWL_OPTIONS, SLING_DEPARTMENTS, SLING_STATUS_PILL } from '../../data/webSlingData';

const EMPTY = { id: '', swl: SWL_OPTIONS[0], length: '', width: '', department: SLING_DEPARTMENTS[0], location: '' };

export default function SlingMasterPage({ pushToast, onNavigate }) {
  const [rows, setRows] = useState(SLINGS);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.id.toLowerCase().includes(q);
    const matchesStatus = status === 'All' || r.status === status;
    return matchesSearch && matchesStatus;
  }), [rows, search, status]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openModal = () => {
    const nextNum = rows.length + 1;
    setForm({ ...EMPTY, id: `WS-${String(nextNum).padStart(3, '0')}` });
    setModalOpen(true);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.id.trim()) return;
    setRows((r) => [{ ...form, status: 'VALID', nextDue: 'Not yet inspected' }, ...r]);
    setModalOpen(false);
    pushToast(`${form.id} registered successfully.`, 'success');
  };

  const handleExport = () => pushToast('Sling register exported to CSV.', 'info');
  const handleQr = (id) => pushToast(`QR code generated for ${id}.`, 'info');

  return (
    <div className="page-enter">
      <PageHeader
        title="Web Sling Master Register"
        subtitle="Central register for all 100+ lifting slings"
        actions={(
          <button type="button" className="btn btn-primary" onClick={openModal}>
            <IconPlus /> Register New Sling
          </button>
        )}
      />

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Sling ID..." />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          {['VALID', 'DUE SOON', 'REJECTED'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <button type="button" className="btn btn-outline" onClick={handleExport}>
          <IconDownload size={15} /> Export CSV
        </button>
      </div>

      <Panel noMargin>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sling ID</th><th>SWL</th><th>Length</th><th>Width</th><th>Department</th>
                <th>Location</th><th>Status</th><th>Next Due</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{s.id}</td>
                  <td style={{ color: 'var(--blue-700)', fontWeight: 600 }}>{s.swl}</td>
                  <td>{s.length}</td>
                  <td>{s.width}</td>
                  <td>{s.department}</td>
                  <td>{s.location}</td>
                  <td><span className={`pill ${SLING_STATUS_PILL[s.status]}`}>{s.status}</span></td>
                  <td>{s.nextDue}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${s.id}.`, 'info')}>View</button>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => onNavigate('ws-inspection')}>Inspect</button>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => handleQr(s.id)}>QR</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No slings match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={modalOpen} title="Register New Web Sling" onClose={() => setModalOpen(false)} width={620}>
        <form onSubmit={handleRegister}>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Sling ID <span className="req">*</span></label>
              <input value={form.id} onChange={set('id')} placeholder="WS-127" />
            </div>
            <div className="field">
              <label>SWL / WLL</label>
              <select value={form.swl} onChange={set('swl')}>
                {SWL_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Length</label>
              <input value={form.length} onChange={set('length')} placeholder="5 m" />
            </div>
            <div className="field">
              <label>Width</label>
              <input value={form.width} onChange={set('width')} placeholder="100 mm" />
            </div>
            <div className="field">
              <label>Department</label>
              <select value={form.department} onChange={set('department')}>
                {SLING_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Location</label>
              <input value={form.location} onChange={set('location')} placeholder="Bay-01" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Register Asset</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { EQUIPMENT, EQUIPMENT_TYPES, HOIST_DEPARTMENTS, EQUIP_STATUS_PILL } from '../../data/hoistData';

const EMPTY = { id: '', type: EQUIPMENT_TYPES[0], capacity: '', location: '', department: HOIST_DEPARTMENTS[0] };

export default function EquipmentMasterPage({ pushToast, onNavigate }) {
  const [rows, setRows] = useState(EQUIPMENT);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.id.toLowerCase().includes(q);
    const matchesType = type === 'All' || r.type === type;
    const matchesStatus = status === 'All' || r.status === status;
    return matchesSearch && matchesType && matchesStatus;
  }), [rows, search, type, status]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openModal = () => {
    setForm({ ...EMPTY, id: `RH-20 / EOT-20` });
    setModalOpen(true);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.id.trim()) return;
    setRows((r) => [{ ...form, status: 'VALID', nextDue: 'Not yet audited' }, ...r]);
    setModalOpen(false);
    pushToast(`${form.id} registered successfully.`, 'success');
  };

  const handleExport = () => pushToast('Equipment register exported to CSV.', 'info');

  return (
    <div className="page-enter">
      <PageHeader
        title="Equipment Master Register"
        subtitle="Remote hoists below 5T and EOT cranes below 20T"
        actions={(
          <button type="button" className="btn btn-primary" onClick={openModal}>
            <IconPlus /> Register Equipment
          </button>
        )}
      />

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID..." />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="All">All Types</option>
          {EQUIPMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Status</option>
          {['VALID', 'DUE SOON', 'REJECTED'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <button type="button" className="btn btn-outline" onClick={handleExport}>
          <IconDownload size={15} /> Export CSV
        </button>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Next Due</th><th>Type</th><th>Capacity</th><th>Location</th>
                <th>Department</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((eq) => (
                <tr key={eq.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{eq.id}</td>
                  <td>{eq.nextDue}</td>
                  <td>{eq.type}</td>
                  <td>{eq.capacity}</td>
                  <td>{eq.location}</td>
                  <td>{eq.department}</td>
                  <td><span className={`pill ${EQUIP_STATUS_PILL[eq.status]}`}>{eq.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${eq.id}.`, 'info')}>View</button>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => onNavigate('ho-audit')}>Audit</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No equipment matches your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} title="Register New Equipment" onClose={() => setModalOpen(false)} width={620}>
        <form onSubmit={handleRegister}>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Equipment ID</label>
              <input value={form.id} onChange={set('id')} placeholder="RH-20 / EOT-20" />
            </div>
            <div className="field">
              <label>Equipment Type</label>
              <select value={form.type} onChange={set('type')}>
                {EQUIPMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Capacity</label>
              <input value={form.capacity} onChange={set('capacity')} placeholder="5T / 10T / 15T" />
            </div>
            <div className="field">
              <label>Location</label>
              <input value={form.location} onChange={set('location')} placeholder="Bay-01" />
            </div>
            <div className="field">
              <label>Department</label>
              <select value={form.department} onChange={set('department')}>
                {HOIST_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Register</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

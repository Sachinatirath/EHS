import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { IconPlus, IconSearch, IconDownload } from '../../components/icons';
import { FIRE_ASSETS, FIRE_ASSET_TYPES, FS_DEPARTMENTS, STATUS_PILL } from '../../data/fireSafetyData';

const EMPTY = { id: '', type: FIRE_ASSET_TYPES[0], spec: '', capacity: '', department: FS_DEPARTMENTS[0], location: '' };

export default function FireAssetRegisterPage({ pushToast }) {
  const [rows, setRows] = useState(FIRE_ASSETS);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [department, setDepartment] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.id.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
    const matchesType = type === 'All' || r.type === type;
    const matchesDept = department === 'All' || r.department === department;
    return matchesSearch && matchesType && matchesDept;
  }), [rows, search, type, department]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.id.trim()) {
      pushToast('Asset ID is required.', 'error');
      return;
    }
    setRows((r) => [{ ...form, status: 'VALID', score: 100 }, ...r]);
    setModalOpen(false);
    setForm(EMPTY);
    pushToast(`${form.id} registered successfully.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Fire Asset Register"
        subtitle="Unique asset ID, location, equipment type, capacity, service history and statutory/test details"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> Register Asset
          </button>
        )}
      />

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search asset / location..." />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="All">All Types</option>
          {FIRE_ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="All">All Departments</option>
          {FS_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <button type="button" className="btn btn-outline" onClick={() => pushToast('Fire asset register exported to CSV.', 'info')}>
          <IconDownload size={15} /> Export CSV
        </button>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset ID</th><th>Type</th><th>Specification</th><th>Capacity / Size</th>
                <th>Department</th><th>Location</th><th>Status</th><th>Score</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 700, color: 'var(--blue-700)' }}>{a.id}</td>
                  <td>{a.type}</td>
                  <td>{a.spec}</td>
                  <td>{a.capacity}</td>
                  <td>{a.department}</td>
                  <td>{a.location}</td>
                  <td><span className={`pill ${STATUS_PILL[a.status]}`}>{a.status}</span></td>
                  <td style={{ fontWeight: 700 }}>{a.score}%</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${a.id}.`, 'info')}>View</button>
                      <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Starting audit for ${a.id}.`, 'info')}>Audit</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No fire assets match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} title="Register Fire Asset" onClose={() => setModalOpen(false)} width={640}>
        <form onSubmit={handleRegister}>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Asset ID</label>
              <input value={form.id} onChange={set('id')} placeholder="FE-PRD-050" />
            </div>
            <div className="field">
              <label>Type</label>
              <select value={form.type} onChange={set('type')}>
                {FIRE_ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Specification</label>
              <input value={form.spec} onChange={set('spec')} placeholder="ABC Dry Powder" />
            </div>
            <div className="field">
              <label>Capacity / Size</label>
              <input value={form.capacity} onChange={set('capacity')} placeholder="6 kg / 30 m / 65 mm" />
            </div>
            <div className="field">
              <label>Department</label>
              <select value={form.department} onChange={set('department')}>
                {FS_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Location</label>
              <input value={form.location} onChange={set('location')} placeholder="Bay / Room / Hydrant point" />
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

import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { IconPlus, IconSearch } from '../../components/icons';
import { TRAINING_MATRIX, CERT_VALIDITY_OPTIONS } from '../../data/trainingData';

const EMPTY = { department: '', role: '', training: '', validity: '12 Months', assessment: 'Yes' };

export default function TrainingMatrixPage({ pushToast }) {
  const [rows, setRows] = useState(TRAINING_MATRIX);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return r.department.toLowerCase().includes(q) || r.role.toLowerCase().includes(q) || r.training.toLowerCase().includes(q);
  }), [rows, search]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.department.trim() || !form.role.trim() || !form.training.trim()) {
      pushToast('Department, Job Role and Mandatory Training are required.', 'error');
      return;
    }
    setRows((r) => [{ department: form.department, role: form.role, training: form.training, validity: form.validity.toLowerCase() }, ...r]);
    setModalOpen(false);
    setForm(EMPTY);
    pushToast(`Training matrix rule added for ${form.department} / ${form.role}.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Training Matrix"
        subtitle="Mandatory training requirements by department and job role"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> Add Matrix Rule
          </button>
        )}
      />

      <div className="info-callout">
        <strong>Auto assignment:</strong> Employee department + role determines mandatory training. When a new employee is added, required training can be assigned automatically.
      </div>

      <div className="filter-bar">
        <div className="search-field">
          <IconSearch size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search department / role / training..." />
        </div>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Department</th><th>Role</th><th>Mandatory Training</th><th>Validity</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={`${r.department}-${r.role}-${i}`}>
                  <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{r.department}</td>
                  <td>{r.role}</td>
                  <td>{r.training}</td>
                  <td>{r.validity}</td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Editing matrix rule for ${r.department} / ${r.role}.`, 'info')}>Edit</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No matrix rules match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} title="Add Training Matrix Rule" onClose={() => setModalOpen(false)} width={640}>
        <form onSubmit={handleSave}>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Department</label>
              <input value={form.department} onChange={set('department')} placeholder="Production" />
            </div>
            <div className="field">
              <label>Job Role</label>
              <input value={form.role} onChange={set('role')} placeholder="Operator" />
            </div>
          </div>
          <div className="field" style={{ marginTop: 4 }}>
            <label>Mandatory Training</label>
            <textarea rows={3} value={form.training} onChange={set('training')} placeholder="Safety Induction; General Safety; Fire & Emergency" />
          </div>
          <div className="form-grid form-grid-3" style={{ marginTop: 4 }}>
            <div className="field">
              <label>Validity</label>
              <select value={form.validity} onChange={set('validity')}>
                {CERT_VALIDITY_OPTIONS.map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Assessment Required</label>
              <select value={form.assessment} onChange={set('assessment')}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Save Matrix Rule</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

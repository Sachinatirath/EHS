import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { IconPlus } from '../../components/icons';
import { CORRECTIVE_ACTIONS, FINDINGS, FS_DEPARTMENTS, STATUS_PILL, nextActionId } from '../../data/fireSafetyData';

const EMPTY = { findingId: FINDINGS[0].id, department: FS_DEPARTMENTS[0], owner: '', due: '', action: '' };

export default function CorrectiveActionsPage({ pushToast }) {
  const [rows, setRows] = useState(CORRECTIVE_ACTIONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.owner.trim() || !form.action.trim()) {
      pushToast('Responsible Person and Corrective Action are required.', 'error');
      return;
    }
    const finding = FINDINGS.find((f) => f.id === form.findingId);
    setRows((r) => [{ id: nextActionId(), findingId: form.findingId, assetId: finding?.assetId || '', department: form.department, owner: form.owner, due: form.due, status: 'OPEN' }, ...r]);
    setModalOpen(false);
    setForm(EMPTY);
    pushToast(`Corrective action assigned to ${form.department}.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Corrective Action Management"
        subtitle="Concern department → responsible person → target date → evidence → EHS verification → closure"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> Assign Action
          </button>
        )}
      />

      <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--amber-500)' }}>
        <div className="panel-body">
          <div className="spec-row">
            <div className="spec-item">
              <div className="spec-label">Department</div>
              <div className="spec-value">Mandatory</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Owner</div>
              <div className="spec-value">Named person</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Due date</div>
              <div className="spec-value">Mandatory</div>
            </div>
            <div className="spec-item">
              <div className="spec-label">Evidence</div>
              <div className="spec-value">Photo / document</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Action ID</th><th>Finding</th><th>Asset</th><th>Department</th>
                <th>Owner</th><th>Due</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td>{r.findingId}</td>
                  <td style={{ color: 'var(--blue-700)', fontWeight: 600 }}>{r.assetId}</td>
                  <td>{r.department}</td>
                  <td>{r.owner}</td>
                  <td>{r.due}</td>
                  <td><span className={`pill ${STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Opened ${r.id}.`, 'info')}>Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} title="Assign Corrective Action" onClose={() => setModalOpen(false)} width={640}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Finding ID</label>
              <select value={form.findingId} onChange={set('findingId')}>
                {FINDINGS.map((f) => <option key={f.id} value={f.id}>{f.id}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Concern Department</label>
              <select value={form.department} onChange={set('department')}>
                {FS_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Responsible Person</label>
              <input value={form.owner} onChange={set('owner')} placeholder="Name / employee ID" />
            </div>
          </div>
          <div className="field" style={{ maxWidth: 260, marginTop: 4 }}>
            <label>Target Date</label>
            <input type="date" value={form.due} onChange={set('due')} />
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Corrective Action</label>
            <textarea value={form.action} onChange={set('action')} placeholder="Exact action and acceptance criteria..." />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Assign Action</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

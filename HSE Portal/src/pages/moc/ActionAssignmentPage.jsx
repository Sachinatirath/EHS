import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import Panel from '../../components/Panel';
import { IconPlus } from '../../components/icons';
import { MOC_ACTIONS, MOC_REGISTER, MOC_DEPARTMENTS, STATUS_PILL, nextActionId } from '../../data/mocData';

const EMPTY = { mocId: MOC_REGISTER[0].id, department: MOC_DEPARTMENTS[0], owner: '', due: '', control: '' };

export default function ActionAssignmentPage({ pushToast }) {
  const [rows, setRows] = useState(MOC_ACTIONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.owner.trim() || !form.control.trim()) {
      pushToast('Responsible Owner and Required Control / Action are required.', 'error');
      return;
    }
    setRows((r) => [{ id: nextActionId(), ...form, status: 'OPEN' }, ...r]);
    setModalOpen(false);
    setForm(EMPTY);
    pushToast(`Action assigned to ${form.department}.`, 'success');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="MOC Action Assignment"
        subtitle="Assign every control / recommendation to a concern department, HOD and responsible owner"
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus /> Assign Action
          </button>
        )}
      />

      <Panel noMargin plain title="Action control rules" style={{ borderLeft: '3px solid var(--amber-500)' }}>
        <div className="spec-row">
          <div className="spec-item">
            <div className="spec-label">Owner</div>
            <div className="spec-value">Named person required</div>
          </div>
          <div className="spec-item">
            <div className="spec-label">Due Date</div>
            <div className="spec-value">Mandatory</div>
          </div>
          <div className="spec-item">
            <div className="spec-label">Evidence</div>
            <div className="spec-value">Upload before closure</div>
          </div>
          <div className="spec-item">
            <div className="spec-label">Verification</div>
            <div className="spec-value">EHS / Reviewer</div>
          </div>
        </div>
      </Panel>

      <Panel noMargin>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Action ID</th><th>Due</th><th>MOC</th><th>Concern / Control</th>
                <th>Department</th><th>Owner</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{r.id}</td>
                  <td>{r.due}</td>
                  <td>{r.mocId}</td>
                  <td>{r.control}</td>
                  <td>{r.department}</td>
                  <td>{r.owner}</td>
                  <td><span className={`pill ${STATUS_PILL[r.status]}`}>{r.status}</span></td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => pushToast(`Viewing ${r.id}.`, 'info')}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={modalOpen} title="Assign MOC Action" onClose={() => setModalOpen(false)} width={640}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>MOC</label>
              <select value={form.mocId} onChange={set('mocId')}>
                {MOC_REGISTER.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Concern Department</label>
              <select value={form.department} onChange={set('department')}>
                {MOC_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Responsible Owner</label>
              <input value={form.owner} onChange={set('owner')} placeholder="Named person" />
            </div>
          </div>
          <div className="field" style={{ maxWidth: 260, marginTop: 4 }}>
            <label>Due Date</label>
            <input type="date" value={form.due} onChange={set('due')} />
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Required Control / Action</label>
            <textarea value={form.control} onChange={set('control')} placeholder="Exact action, acceptance criteria and evidence required..." />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="submit" className="btn btn-primary">Assign Action</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

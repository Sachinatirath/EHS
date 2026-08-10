import { useState } from 'react';
import Modal from './Modal';
import { FORKLIFTS, DEPARTMENTS, PRIORITIES, IMMEDIATE_ACTIONS } from '../data/forkliftData';

const todayIso = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  forklift: FORKLIFTS[0].id,
  date: todayIso(),
  priority: 'LOW',
  finding: '',
  department: DEPARTMENTS[0],
  hod: '',
  owner: '',
  dueDate: '',
  immediateAction: 'None',
};

export default function ObservationModal({
  open, onClose, onSubmit,
  title = 'Create Safety Observation & Assign Concern',
  submitLabel = 'Assign Concern',
}) {
  const [form, setForm] = useState(EMPTY);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.finding.trim()) return;
    onSubmit(form);
    setForm(EMPTY);
  };

  const handleClose = () => {
    setForm(EMPTY);
    onClose();
  };

  return (
    <Modal open={open} title={title} onClose={handleClose} width={720}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid form-grid-3">
          <div className="field">
            <label>Forklift <span className="req">*</span></label>
            <select value={form.forklift} onChange={set('forklift')}>
              {FORKLIFTS.map((f) => <option key={f.id} value={f.id}>{f.id}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Observation Date</label>
            <input type="date" value={form.date} onChange={set('date')} />
          </div>
          <div className="field">
            <label>Priority</label>
            <select value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="field" style={{ marginTop: 18 }}>
          <label>Observation / Concern <span className="req">*</span></label>
          <textarea
            value={form.finding}
            onChange={set('finding')}
            placeholder="Example: Reverse alarm not working / fork crack / seat belt damaged..."
            style={{ minHeight: 90 }}
          />
        </div>

        <div className="form-grid form-grid-3" style={{ marginTop: 18 }}>
          <div className="field">
            <label>Concern Department <span className="req">*</span></label>
            <select value={form.department} onChange={set('department')}>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Department HOD</label>
            <input value={form.hod} onChange={set('hod')} placeholder="Department HOD" />
          </div>
          <div className="field">
            <label>Action Owner</label>
            <input value={form.owner} onChange={set('owner')} placeholder="Enter responsible person" />
          </div>
        </div>

        <div className="form-grid form-grid-3" style={{ marginTop: 18 }}>
          <div className="field">
            <label>Due Date</label>
            <input type="date" value={form.dueDate} onChange={set('dueDate')} />
          </div>
          <div className="field">
            <label>Photo Evidence</label>
            <input type="file" onChange={set('photo')} />
          </div>
          <div className="field">
            <label>Immediate Action</label>
            <select value={form.immediateAction} onChange={set('immediateAction')}>
              {IMMEDIATE_ACTIONS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="workflow-strip">
          <strong>Workflow:</strong>&nbsp;Safety Officer → Concern Department HOD → Action Owner → Corrective Action → Evidence → Safety Verification → Closure
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="submit" className="btn btn-primary">{submitLabel}</button>
        </div>
      </form>
    </Modal>
  );
}

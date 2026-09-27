import { useState } from 'react';
import Modal from '../../components/Modal';
import './employeeProfile.css';
import { TRAINING_TOPICS, CERT_VALIDITY_OPTIONS, SHIFT_OPTIONS, DEPARTMENTS, EMPLOYEES, nextSessionId } from '../../data/trainingData';

const emptyParticipant = () => ({ employeeId: '', name: '', department: '', role: '', matched: false, attendance: 'Present' });

// Accepts "EMP-1001", "emp-1001", "emp1001" or just "1001".
function findEmployee(rawId) {
  const q = rawId.trim().toUpperCase().replace(/\s+/g, '');
  if (!q) return null;
  const digits = q.replace(/^EMP-?/, '');
  return EMPLOYEES.find((e) => e.id === q || e.id === `EMP-${digits}`) || null;
}

export default function CreateTrainingSessionModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    id: nextSessionId(),
    date: '',
    topic: TRAINING_TOPICS[0],
    trainer: '',
    location: '',
    shift: SHIFT_OPTIONS[0].value,
    validity: '12 Months',
  }));
  const [participants, setParticipants] = useState(() => [emptyParticipant(), emptyParticipant()]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const updateRow = (idx, fn) => setParticipants((rows) => rows.map((r, i) => (i === idx ? fn(r) : r)));

  const setParticipant = (idx, key) => (e) => {
    const value = e.target.value;
    updateRow(idx, (r) => ({ ...r, [key]: value }));
  };

  // Employee ID drives the row: a known ID fills name/department/role from the Employee Master;
  // clearing or changing to an unknown ID drops previously fetched values.
  const setEmployeeId = (idx) => (e) => {
    const value = e.target.value;
    const emp = findEmployee(value);
    updateRow(idx, (r) => {
      if (emp) return { ...r, employeeId: value, name: emp.name, department: emp.department, role: emp.role, matched: true };
      if (r.matched) return { ...r, employeeId: value, name: '', department: '', role: '', matched: false };
      return { ...r, employeeId: value };
    });
  };

  // Normalise to the canonical ID once the user leaves the field (e.g. "1001" → "EMP-1001").
  const normaliseEmployeeId = (idx) => () => {
    updateRow(idx, (r) => {
      const emp = findEmployee(r.employeeId);
      return emp && r.employeeId !== emp.id ? { ...r, employeeId: emp.id } : r;
    });
  };

  const duplicateOf = (idx) => {
    const id = participants[idx].matched ? findEmployee(participants[idx].employeeId)?.id : participants[idx].employeeId.trim().toUpperCase();
    if (!id) return -1;
    return participants.findIndex((p, i) => i < idx && (p.matched ? findEmployee(p.employeeId)?.id : p.employeeId.trim().toUpperCase()) === id);
  };

  const addParticipant = () => setParticipants((rows) => [...rows, emptyParticipant()]);
  const removeParticipant = (idx) => setParticipants((rows) => rows.filter((_, i) => i !== idx));

  const reset = () => {
    setForm({ id: nextSessionId(), date: '', topic: TRAINING_TOPICS[0], trainer: '', location: '', shift: SHIFT_OPTIONS[0].value, validity: '12 Months' });
    setParticipants([emptyParticipant(), emptyParticipant()]);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (participants.some((_, i) => duplicateOf(i) !== -1)) return;
    onSave({
      ...form,
      participants: participants
        .filter((p) => p.employeeId.trim())
        .map((p) => ({
          employeeId: findEmployee(p.employeeId)?.id || p.employeeId.trim(),
          name: p.name,
          department: p.department,
          role: p.role,
          attendance: p.attendance,
        })),
    });
    reset();
  };

  return (
    <Modal open={open} title="Create Training Session" onClose={handleClose} width={760}>
      <form onSubmit={handleSubmit}>
        <div className="info-callout">
          <strong>Batch Training:</strong>&nbsp;Add 1, 10, 50 or 100+ participants. Each Employee ID is validated before saving and linked to individual employee history.
        </div>

        <div className="form-grid form-grid-3">
          <div className="field">
            <label>Training ID</label>
            <input value={form.id} readOnly />
          </div>
          <div className="field">
            <label>Training Date</label>
            <input type="date" value={form.date} onChange={set('date')} />
          </div>
          <div className="field">
            <label>Training Topic *</label>
            <select value={form.topic} onChange={set('topic')} required>
              {TRAINING_TOPICS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Trainer</label>
            <input value={form.trainer} onChange={set('trainer')} placeholder="EHS / External Trainer" />
          </div>
          <div className="field">
            <label>Location</label>
            <input value={form.location} onChange={set('location')} placeholder="Training Room / Shop Floor" />
          </div>
          <div className="field">
            <label>Shift</label>
            <select value={form.shift} onChange={set('shift')}>
              {SHIFT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Certificate Validity</label>
            <select value={form.validity} onChange={set('validity')}>
              {CERT_VALIDITY_OPTIONS.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '22px 0 12px' }}>Participants</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Employee ID</th><th>Name</th><th>Department</th><th>Role</th>
                <th>Attendance</th><th />
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => {
                const dup = duplicateOf(i);
                const typed = p.employeeId.trim();
                return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <input
                      value={p.employeeId}
                      onChange={setEmployeeId(i)}
                      onBlur={normaliseEmployeeId(i)}
                      placeholder="EMP-1001"
                      style={{ minWidth: 120 }}
                      className={dup !== -1 ? 'ts-id-error' : p.matched ? 'ts-id-ok' : undefined}
                    />
                    {dup !== -1 ? (
                      <div className="ts-hint ts-hint-bad">Already added in row {dup + 1}</div>
                    ) : p.matched ? (
                      <div className="ts-hint ts-hint-ok">✓ Found in Employee Master</div>
                    ) : typed ? (
                      <div className="ts-hint">Not found — enter details manually</div>
                    ) : null}
                  </td>
                  <td><input value={p.name} onChange={setParticipant(i, 'name')} readOnly={p.matched} className={p.matched ? 'ts-fetched' : undefined} placeholder="Employee name" style={{ minWidth: 140 }} /></td>
                  <td><input value={p.department} onChange={setParticipant(i, 'department')} readOnly={p.matched} className={p.matched ? 'ts-fetched' : undefined} list={p.matched ? undefined : 'tr-participant-departments'} placeholder="Department" style={{ minWidth: 130 }} /></td>
                  <td><input value={p.role} onChange={setParticipant(i, 'role')} readOnly={p.matched} className={p.matched ? 'ts-fetched' : undefined} placeholder="Role" style={{ minWidth: 120 }} /></td>
                  <td>
                    <select value={p.attendance} onChange={setParticipant(i, 'attendance')}>
                      <option>Present</option>
                      <option>Absent</option>
                    </select>
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => removeParticipant(i)}>Remove</button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <datalist id="tr-participant-departments">
          {DEPARTMENTS.map((d) => <option key={d} value={d} />)}
        </datalist>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <span style={{ fontSize: 12.5, color: 'var(--slate-500)' }}>
            {participants.length} participants · {participants.filter((p) => p.matched).length} fetched from Employee Master
          </span>
          <button type="button" className="btn btn-outline" onClick={addParticipant}>+ Add Participant</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="submit" className="btn btn-primary" disabled={participants.some((_, i) => duplicateOf(i) !== -1)}>Save Training &amp; Update All Employee Trackers</button>
        </div>
      </form>
    </Modal>
  );
}

import { useState } from 'react';
import Modal from '../../components/Modal';
import { TRAINING_TOPICS, CERT_VALIDITY_OPTIONS, nextSessionId } from '../../data/trainingData';

const emptyParticipant = () => ({ employeeId: '', attendance: 'Present', score: '', result: 'Passed' });

export default function CreateTrainingSessionModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    id: nextSessionId(),
    date: '',
    topic: TRAINING_TOPICS[0],
    trainer: '',
    venue: '',
    validity: '12 Months',
  }));
  const [participants, setParticipants] = useState(() => [emptyParticipant(), emptyParticipant()]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setParticipant = (idx, key) => (e) => {
    const value = e.target.value;
    setParticipants((rows) => rows.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  };
  const addParticipant = () => setParticipants((rows) => [...rows, emptyParticipant()]);
  const removeParticipant = (idx) => setParticipants((rows) => rows.filter((_, i) => i !== idx));

  const reset = () => {
    setForm({ id: nextSessionId(), date: '', topic: TRAINING_TOPICS[0], trainer: '', venue: '', validity: '12 Months' });
    setParticipants([emptyParticipant(), emptyParticipant()]);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, participants: participants.filter((p) => p.employeeId.trim()) });
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
            <label>Venue</label>
            <input value={form.venue} onChange={set('venue')} placeholder="Training Room / Shop Floor" />
          </div>
          <div className="field">
            <label>Certificate Validity</label>
            <select value={form.validity} onChange={set('validity')}>
              {CERT_VALIDITY_OPTIONS.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="field" style={{ marginTop: 4 }}>
          <label>Training Material / Evidence</label>
          <input type="file" multiple />
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '22px 0 12px' }}>Participants</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Employee ID</th><th>Name</th><th>Department</th>
                <th>Attendance</th><th>Score</th><th>Result</th><th />
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><input value={p.employeeId} onChange={setParticipant(i, 'employeeId')} placeholder="EMP-1001" style={{ minWidth: 110 }} /></td>
                  <td>—</td>
                  <td>—</td>
                  <td>
                    <select value={p.attendance} onChange={setParticipant(i, 'attendance')}>
                      <option>Present</option>
                      <option>Absent</option>
                    </select>
                  </td>
                  <td><input value={p.score} onChange={setParticipant(i, 'score')} placeholder="92%" style={{ width: 70 }} /></td>
                  <td>
                    <select value={p.result} onChange={setParticipant(i, 'result')}>
                      <option>Passed</option>
                      <option>Failed</option>
                    </select>
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => removeParticipant(i)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <span style={{ fontSize: 12.5, color: 'var(--slate-500)' }}>{participants.length} participants</span>
          <button type="button" className="btn btn-outline" onClick={addParticipant}>+ Add Participant</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="submit" className="btn btn-primary">Save Training &amp; Update All Employee Trackers</button>
        </div>
      </form>
    </Modal>
  );
}

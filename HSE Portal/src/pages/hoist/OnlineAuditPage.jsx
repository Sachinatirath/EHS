import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Panel from '../../components/Panel';
import { IconTablet } from '../../components/icons';
import { EQUIPMENT, AUDIT_TYPES, AUDIT_CHECKPOINTS } from '../../data/hoistData';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function OnlineAuditPage({ pushToast, onNavigate }) {
  const [info, setInfo] = useState({
    equipment: EQUIPMENT[0].id,
    auditType: AUDIT_TYPES[0],
    date: todayIso(),
    inspector: 'Safety Officer',
    location: EQUIPMENT[0].location,
    department: EQUIPMENT[0].department,
  });
  const [answers, setAnswers] = useState(() => AUDIT_CHECKPOINTS.map(() => ''));
  const [remarks, setRemarks] = useState('');
  const [criticalDefect, setCriticalDefect] = useState('No');
  const [recommendedAction, setRecommendedAction] = useState('Continue Operation');

  const setInfoField = (key) => (e) => {
    const value = e.target.value;
    setInfo((f) => {
      if (key === 'equipment') {
        const match = EQUIPMENT.find((eq) => eq.id === value);
        return { ...f, equipment: value, location: match?.location || f.location, department: match?.department || f.department };
      }
      return { ...f, [key]: value };
    });
  };

  const setAnswer = (idx, value) => setAnswers((prev) => prev.map((a, i) => (i === idx ? value : a)));

  const answeredCount = useMemo(() => answers.filter(Boolean).length, [answers]);
  const completion = Math.round((answeredCount / AUDIT_CHECKPOINTS.length) * 100);
  const hasCriticalFail = useMemo(
    () => AUDIT_CHECKPOINTS.some(([, critical], i) => critical && answers[i] === 'NOT OK'),
    [answers],
  );

  const handleReset = () => {
    setAnswers(AUDIT_CHECKPOINTS.map(() => ''));
    setRemarks('');
    setCriticalDefect('No');
    setRecommendedAction('Continue Operation');
    pushToast('Audit form reset.', 'info');
  };

  const handleSubmit = () => {
    if (answeredCount < AUDIT_CHECKPOINTS.length) {
      pushToast(`Please answer all checklist items (${answeredCount}/${AUDIT_CHECKPOINTS.length} done).`, 'info');
      return;
    }
    pushToast(
      hasCriticalFail
        ? `Audit submitted for ${info.equipment} — critical failure detected, equipment flagged REJECTED.`
        : `Audit submitted for ${info.equipment}.`,
      hasCriticalFail ? 'info' : 'success',
    );
    onNavigate?.('ho-history');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Online Hoist / EOT Audit"
        subtitle="Asset selection → checklist → score → photo evidence → HOD approval"
        actions={<span className="badge-outline"><IconTablet /> TABLET READY</span>}
      />

      <Panel style={{ marginBottom: 20 }}>
        <div className="form-grid form-grid-3">
          <div className="field">
            <label>Equipment <span className="req">*</span></label>
            <select value={info.equipment} onChange={setInfoField('equipment')}>
              {EQUIPMENT.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.id} — {eq.type} — {eq.capacity}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Audit Type</label>
            <select value={info.auditType} onChange={setInfoField('auditType')}>
              {AUDIT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Audit Date</label>
            <input type="date" value={info.date} onChange={setInfoField('date')} />
          </div>
          <div className="field">
            <label>Inspector</label>
            <input value={info.inspector} onChange={setInfoField('inspector')} placeholder="Safety Officer" />
          </div>
          <div className="field">
            <label>Location</label>
            <input value={info.location} onChange={setInfoField('location')} placeholder="Location" />
          </div>
          <div className="field">
            <label>Department</label>
            <input value={info.department} onChange={setInfoField('department')} placeholder="Department" />
          </div>
        </div>
      </Panel>

      <Panel noMargin>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Safety Audit Checklist</h3>
        <p style={{ fontSize: 12.5, color: 'var(--slate-500)', marginBottom: 16 }}>
          Critical failure on emergency stop, brake, hook, limit switch or overload protection automatically results in REJECT.
        </p>

        <div className="table-wrap">
          <table className="data-table radio-table">
            <thead>
              <tr>
                <th>Audit Check Point</th>
                <th style={{ width: 70, textAlign: 'center' }}>OK</th>
                <th style={{ width: 90, textAlign: 'center' }}>NOT OK</th>
                <th style={{ width: 70, textAlign: 'center' }}>N/A</th>
                <th style={{ width: 80 }}>Critical</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_CHECKPOINTS.map(([label, critical], idx) => (
                <tr key={label} className={answers[idx] ? 'answered' : ''}>
                  <td>{idx + 1}. {label}</td>
                  {['OK', 'NOT OK', 'N/A'].map((opt) => (
                    <td className="radio-cell" key={opt}>
                      <input
                        type="radio"
                        name={`chk-${idx}`}
                        checked={answers[idx] === opt}
                        onChange={() => setAnswer(idx, opt)}
                      />
                    </td>
                  ))}
                  <td className={critical ? 'critical-yes' : 'critical-no'}>{critical ? 'YES' : 'NO'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="completion-strip">
          <div className="completion-pct">{completion}%</div>
          <div>
            <div className="completion-label">Complete checklist</div>
            <div className="completion-sub">{answeredCount} / {AUDIT_CHECKPOINTS.length} answered</div>
          </div>
          <div className="progress-track" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${completion}%` }} />
          </div>
        </div>

        <div className="field" style={{ marginBottom: 18 }}>
          <label>Observation / Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter defects, observations and recommendations..."
            style={{ minHeight: 90 }}
          />
        </div>

        <div className="form-grid form-grid-3">
          <div className="field">
            <label>Photo Evidence</label>
            <input type="file" multiple />
          </div>
          <div className="field">
            <label>Critical Defect</label>
            <select value={criticalDefect} onChange={(e) => setCriticalDefect(e.target.value)}>
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
          <div className="field">
            <label>Recommended Action</label>
            <select value={recommendedAction} onChange={(e) => setRecommendedAction(e.target.value)}>
              <option>Continue Operation</option>
              <option>Conditional — Monitor</option>
              <option>Stop Operation — Repair</option>
              <option>Reject — Do Not Operate</option>
            </select>
          </div>
        </div>

        <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" className="btn btn-ghost" onClick={handleReset}>Reset</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit Audit</button>
        </div>
      </Panel>
    </div>
  );
}

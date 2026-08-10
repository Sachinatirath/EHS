import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { IconTablet } from '../../components/icons';
import { FORKLIFTS, AUDIT_TYPES, AUDIT_CHECKPOINTS } from '../../data/forkliftData';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function OnlineAuditPage({ pushToast, onNavigate }) {
  const [info, setInfo] = useState({
    forklift: FORKLIFTS[0].id,
    auditType: AUDIT_TYPES[0],
    date: todayIso(),
    inspector: 'Safety Officer',
    location: FORKLIFTS[0].location,
    department: FORKLIFTS[0].department,
  });
  const [answers, setAnswers] = useState(() => AUDIT_CHECKPOINTS.map(() => ''));
  const [remarks, setRemarks] = useState('');
  const [criticalDefect, setCriticalDefect] = useState('No');
  const [recommendedAction, setRecommendedAction] = useState('Continue Operation');

  const setInfoField = (key) => (e) => {
    const value = e.target.value;
    setInfo((f) => {
      if (key === 'forklift') {
        const match = FORKLIFTS.find((fl) => fl.id === value);
        return { ...f, forklift: value, location: match?.location || f.location, department: match?.department || f.department };
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
        ? `Audit submitted for ${info.forklift} — critical failure detected, forklift flagged REJECTED.`
        : `Audit submitted for ${info.forklift}.`,
      hasCriticalFail ? 'info' : 'success',
    );
    onNavigate?.('fl-history');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Forklift Online Safety Audit"
        subtitle="Inspection → score → evidence → observation → department assignment → HOD closure"
        actions={<span className="badge-outline"><IconTablet /> TABLET READY</span>}
      />

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-body form-grid form-grid-3">
          <div className="field">
            <label>Forklift <span className="req">*</span></label>
            <select value={info.forklift} onChange={setInfoField('forklift')}>
              {FORKLIFTS.map((f) => (
                <option key={f.id} value={f.id}>{f.id} — {f.type} — {f.capacity}</option>
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
            <label>Operating Department</label>
            <input value={info.department} onChange={setInfoField('department')} placeholder="Operating Department" />
          </div>
        </div>
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Forklift Safety Checklist</h3>
          <p style={{ fontSize: 12.5, color: 'var(--slate-500)', marginBottom: 16 }}>
            Critical failures in brakes, forks, steering, hydraulic leakage, seat belt or reverse alarm can result in REJECT / DO NOT OPERATE.
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
              placeholder="Enter defects, unsafe condition, unsafe act and recommendation..."
              style={{ minHeight: 90 }}
            />
          </div>

          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Photo Evidence</label>
              <input type="file" />
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
        </div>
      </div>
    </div>
  );
}

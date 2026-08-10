import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { IconTablet } from '../../components/icons';
import { SLINGS, INSPECTION_TYPES, INSPECTION_CHECKPOINTS } from '../../data/webSlingData';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function OnlineInspectionPage({ pushToast, onNavigate }) {
  const [info, setInfo] = useState({
    sling: SLINGS[0].id,
    inspectionType: INSPECTION_TYPES[0],
    date: todayIso(),
    inspector: 'Safety Officer',
    location: SLINGS[0].location,
    department: SLINGS[0].department,
  });
  const [answers, setAnswers] = useState(() => INSPECTION_CHECKPOINTS.map(() => ''));
  const [remarks, setRemarks] = useState('');
  const [criticalDefect, setCriticalDefect] = useState('No');
  const [recommendedAction, setRecommendedAction] = useState('Continue Use');

  const setInfoField = (key) => (e) => {
    const value = e.target.value;
    setInfo((f) => {
      if (key === 'sling') {
        const match = SLINGS.find((s) => s.id === value);
        return { ...f, sling: value, location: match?.location || f.location, department: match?.department || f.department };
      }
      return { ...f, [key]: value };
    });
  };

  const setAnswer = (idx, value) => setAnswers((prev) => prev.map((a, i) => (i === idx ? value : a)));

  const answeredCount = useMemo(() => answers.filter(Boolean).length, [answers]);
  const completion = Math.round((answeredCount / INSPECTION_CHECKPOINTS.length) * 100);
  const hasCriticalFail = useMemo(
    () => INSPECTION_CHECKPOINTS.some(([, critical], i) => critical && answers[i] === 'NOT OK'),
    [answers],
  );

  const handleReset = () => {
    setAnswers(INSPECTION_CHECKPOINTS.map(() => ''));
    setRemarks('');
    setCriticalDefect('No');
    setRecommendedAction('Continue Use');
    pushToast('Inspection form reset.', 'info');
  };

  const handleSubmit = () => {
    if (answeredCount < INSPECTION_CHECKPOINTS.length) {
      pushToast(`Please answer all checklist points (${answeredCount}/${INSPECTION_CHECKPOINTS.length} done).`, 'info');
      return;
    }
    pushToast(
      hasCriticalFail
        ? `Inspection submitted for ${info.sling} — critical defect found, sling flagged REJECTED.`
        : `Inspection submitted for ${info.sling}.`,
      hasCriticalFail ? 'info' : 'success',
    );
    onNavigate?.('ws-history');
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Online Web Sling Inspection"
        subtitle="QR scan / asset selection → checklist → evidence → score → approval"
        actions={<span className="badge-outline"><IconTablet /> TABLET READY</span>}
      />

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-body form-grid form-grid-3">
          <div className="field">
            <label>Select Sling <span className="req">*</span></label>
            <select value={info.sling} onChange={setInfoField('sling')}>
              {SLINGS.map((s) => (
                <option key={s.id} value={s.id}>{s.id} — {s.swl} — {s.location}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Inspection Type</label>
            <select value={info.inspectionType} onChange={setInfoField('inspectionType')}>
              {INSPECTION_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Inspection Date</label>
            <input type="date" value={info.date} onChange={setInfoField('date')} />
          </div>
          <div className="field">
            <label>Inspector Name</label>
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
      </div>

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Safety Inspection Checklist</h3>
          <p style={{ fontSize: 12.5, color: 'var(--slate-500)', marginBottom: 16 }}>
            Select OK / NOT OK / N/A. Any critical defect automatically results in REJECT.
          </p>

          <div className="table-wrap">
            <table className="data-table radio-table">
              <thead>
                <tr>
                  <th>Inspection Point</th>
                  <th style={{ width: 70, textAlign: 'center' }}>OK</th>
                  <th style={{ width: 90, textAlign: 'center' }}>NOT OK</th>
                  <th style={{ width: 70, textAlign: 'center' }}>N/A</th>
                </tr>
              </thead>
              <tbody>
                {INSPECTION_CHECKPOINTS.map(([label, critical], idx) => (
                  <tr key={label} className={answers[idx] ? 'answered' : ''}>
                    <td>
                      {idx + 1}. {label}
                      {critical ? <span className="critical-yes" style={{ marginLeft: 8 }}>CRITICAL</span> : null}
                    </td>
                    {['OK', 'NOT OK', 'N/A'].map((opt) => (
                      <td className="radio-cell" key={opt}>
                        <input
                          type="radio"
                          name={`insp-${idx}`}
                          checked={answers[idx] === opt}
                          onChange={() => setAnswer(idx, opt)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="completion-strip">
            <div className="completion-pct">{completion}%</div>
            <div>
              <div className="completion-label">Complete the checklist</div>
              <div className="completion-sub">{answeredCount} / {INSPECTION_CHECKPOINTS.length} points</div>
            </div>
            <div className="progress-track" style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: `${completion}%` }} />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 18 }}>
            <label>Inspection Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter observations, findings and recommendations..."
              style={{ minHeight: 90 }}
            />
          </div>

          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Photo Evidence</label>
              <input type="file" multiple />
            </div>
            <div className="field">
              <label>Critical Defect?</label>
              <select value={criticalDefect} onChange={(e) => setCriticalDefect(e.target.value)}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
            <div className="field">
              <label>Recommended Action</label>
              <select value={recommendedAction} onChange={(e) => setRecommendedAction(e.target.value)}>
                <option>Continue Use</option>
                <option>Monitor / Corrective Action</option>
                <option>Remove From Service</option>
                <option>Reject — Do Not Use</option>
              </select>
            </div>
          </div>

          <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={handleReset}>Reset</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit Inspection</button>
          </div>
        </div>
      </div>
    </div>
  );
}

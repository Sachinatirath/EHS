import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import {
  FIRE_ASSETS, FIRE_ASSET_TYPES, FS_DEPARTMENTS, AUDIT_CHECKLIST, AUDIT_RESULTS, RISK_LEVELS, nextAuditNo,
} from '../../data/fireSafetyData';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function StartNewAuditPage({ pushToast, onNavigate }) {
  const [auditNo] = useState(() => nextAuditNo());
  const [info, setInfo] = useState({
    date: todayIso(), auditor: 'Safety Officer', department: FS_DEPARTMENTS[0],
    equipmentType: FIRE_ASSET_TYPES[0], assetId: FIRE_ASSETS[0].id, location: '',
  });
  const [checked, setChecked] = useState(() => AUDIT_CHECKLIST.map((_, i) => i < 2));
  const [result, setResult] = useState(AUDIT_RESULTS[0]);
  const [score, setScore] = useState(90);
  const [risk, setRisk] = useState(RISK_LEVELS[0]);
  const [finding, setFinding] = useState('');
  const [concernDept, setConcernDept] = useState(FS_DEPARTMENTS[0]);
  const [responsible, setResponsible] = useState('');
  const [closureDate, setClosureDate] = useState('');

  const setInfoField = (key) => (e) => setInfo((f) => ({ ...f, [key]: e.target.value }));
  const toggleItem = (idx) => setChecked((c) => c.map((v, i) => (i === idx ? !v : v)));

  const handleSubmit = () => {
    pushToast(`${auditNo} submitted for ${info.assetId}.`, 'success');
    onNavigate('fs-audit');
  };
  const handleDraft = () => pushToast(`${auditNo} saved as draft.`, 'info');

  return (
    <div className="page-enter">
      <PageHeader
        title="Start New Fire Equipment Audit"
        subtitle="Perform field audit from tablet / desktop and capture evidence against each asset"
        badge={<span className="pill pill-cyan">LIVE AUDIT</span>}
      />

      <div className="panel" style={{ margin: 0, borderLeft: '3px solid var(--amber-500)' }}>
        <div className="panel-body">
          <div className="form-grid form-grid-3">
            <div className="field">
              <label>Audit No.</label>
              <input value={auditNo} readOnly style={{ background: 'var(--slate-100)', color: 'var(--slate-500)', fontWeight: 700 }} />
            </div>
            <div className="field">
              <label>Audit Date</label>
              <input type="date" value={info.date} onChange={setInfoField('date')} />
            </div>
            <div className="field">
              <label>Auditor</label>
              <input value={info.auditor} onChange={setInfoField('auditor')} />
            </div>
            <div className="field">
              <label>Department / Area</label>
              <select value={info.department} onChange={setInfoField('department')}>
                {FS_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Equipment Type</label>
              <select value={info.equipmentType} onChange={setInfoField('equipmentType')}>
                {FIRE_ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Asset ID</label>
              <select value={info.assetId} onChange={setInfoField('assetId')}>
                {FIRE_ASSETS.map((a) => <option key={a.id} value={a.id}>{a.id}</option>)}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: 4 }}>
            <label>Location / Identification</label>
            <input value={info.location} onChange={setInfoField('location')} placeholder="Building / floor / bay / near equipment" />
          </div>

          <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: '22px 0 4px' }}>Digital Checklist</h3>
          {AUDIT_CHECKLIST.map((item, idx) => (
            <div className="check-list-row" key={item.label}>
              <label>
                <input type="checkbox" checked={checked[idx]} onChange={() => toggleItem(idx)} />
                {item.label}
              </label>
              <span style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <span style={{ color: 'var(--blue-600)', fontSize: 12.5, fontWeight: 600 }}>{item.category}</span>
                <span className="tag-text" style={{ color: checked[idx] ? 'var(--green-600)' : 'var(--slate-500)' }}>
                  {checked[idx] ? 'PASS' : 'Mandatory'}
                </span>
              </span>
            </div>
          ))}

          <div className="form-grid form-grid-3" style={{ marginTop: 20 }}>
            <div className="field">
              <label>Audit Result</label>
              <select value={result} onChange={(e) => setResult(e.target.value)}>
                {AUDIT_RESULTS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Score</label>
              <input type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} />
            </div>
            <div className="field">
              <label>Risk Level</label>
              <select value={risk} onChange={(e) => setRisk(e.target.value)}>
                {RISK_LEVELS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: 4 }}>
            <label>Observation / Finding</label>
            <textarea value={finding} onChange={(e) => setFinding(e.target.value)} placeholder="Describe exact condition, location and requirement..." />
          </div>

          <div className="form-grid form-grid-3" style={{ marginTop: 16 }}>
            <div className="field">
              <label>Concern Department</label>
              <select value={concernDept} onChange={(e) => setConcernDept(e.target.value)}>
                {FS_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Responsible Person</label>
              <input value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="Name / employee ID" />
            </div>
            <div className="field">
              <label>Target Closure Date</label>
              <input type="date" value={closureDate} onChange={(e) => setClosureDate(e.target.value)} />
            </div>
          </div>

          <div className="field" style={{ marginTop: 4 }}>
            <label>Photo / Evidence</label>
            <input type="file" multiple />
          </div>

          <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={handleDraft}>Save Draft</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit Audit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { IconClipboard, IconCalendarCheck, IconCap, IconPrinter } from '../../components/icons';
import { nextPlanId, AUDIT_SCHEDULE_STATUSES } from '../../data/formOptions';

const INITIAL_AUDITS = [
  { type: 'Machine Safety', area: 'Production Hall A', date: '', status: 'Planned' },
  { type: 'Fire Safety', area: 'Warehouse', date: '', status: 'Planned' },
  { type: 'Electrical Safety', area: 'Sub Station', date: '', status: 'Planned' },
];

const INITIAL_TRAININGS = [
  { topic: 'Fire Extinguisher Handling', group: 'All Staff', date: '', status: 'Planned' },
  { topic: 'First Aid Awareness', group: 'Safety Team', date: '', status: 'Planned' },
  { topic: 'Work at Height Safety', group: 'Maintenance', date: '', status: 'Planned' },
];

export default function AuditTrainingPlanPage({ pushToast }) {
  const [planNo] = useState(() => nextPlanId());
  const [info, setInfo] = useState({});
  const [audits, setAudits] = useState(INITIAL_AUDITS);
  const [trainings, setTrainings] = useState(INITIAL_TRAININGS);

  const setInfoField = (key) => (e) => setInfo((f) => ({ ...f, [key]: e.target.value }));
  const setAuditField = (idx, key) => (e) => {
    const value = e.target.value;
    setAudits((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  };
  const setTrainingField = (idx, key) => (e) => {
    const value = e.target.value;
    setTrainings((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  };

  const handleSave = () => pushToast(`Audit & Training Plan ${planNo} saved.`, 'success');
  const handlePrint = () => window.print();

  return (
    <div className="page-enter">
      <h1 className="page-title">Audit & Training Plan</h1>

      <div className="panel">
        <div className="panel-header"><IconClipboard size={17} /> Plan Information</div>
        <div className="panel-body form-grid">
          <div className="field">
            <label>Plan No</label>
            <input value={planNo} readOnly style={{ background: 'var(--slate-100)', color: 'var(--slate-500)', fontWeight: 700 }} />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={info.date || ''} onChange={setInfoField('date')} />
          </div>
          <div className="field">
            <label>Department</label>
            <input value={info.department || ''} onChange={setInfoField('department')} placeholder="Department" />
          </div>
          <div className="field">
            <label>Prepared By</label>
            <input value={info.preparedBy || ''} onChange={setInfoField('preparedBy')} />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><IconCalendarCheck size={17} /> Audit Schedule</div>
        <div className="panel-body" style={{ paddingTop: 16 }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th style={{ width: 48 }}>No</th><th>Audit Type</th><th>Area</th><th>Scheduled Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {audits.map((row, idx) => (
                  <tr key={row.type}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{row.type}</td>
                    <td>{row.area}</td>
                    <td><input type="date" value={row.date} onChange={setAuditField(idx, 'date')} /></td>
                    <td>
                      <select value={row.status} onChange={setAuditField(idx, 'status')}>
                        {AUDIT_SCHEDULE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><IconCap size={17} /> Training Plan</div>
        <div className="panel-body" style={{ paddingTop: 16 }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th style={{ width: 48 }}>No</th><th>Training Topic</th><th>Target Group</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {trainings.map((row, idx) => (
                  <tr key={row.topic}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{row.topic}</td>
                    <td>{row.group}</td>
                    <td><input type="date" value={row.date} onChange={setTrainingField(idx, 'date')} /></td>
                    <td>
                      <select value={row.status} onChange={setTrainingField(idx, 'status')}>
                        {AUDIT_SCHEDULE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={handleSave}>Save Plan</button>
        <button type="button" className="btn btn-outline" onClick={handlePrint}><IconPrinter size={15} /> Print</button>
      </div>
    </div>
  );
}

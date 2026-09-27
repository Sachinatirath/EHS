import { useState } from 'react';
import Panel from '../../components/Panel';
import { IconClipboard, IconCalendarCheck, IconCap, IconPrinter, IconUser, IconSend } from '../../components/icons';
import { nextPlanId, AUDIT_SCHEDULE_STATUSES } from '../../data/formOptions';
import { EMPLOYEES, EMPLOYEE_DETAILS } from '../../data/trainingData';

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

const READ_ONLY = { background: 'var(--slate-50)', color: 'var(--slate-700)', cursor: 'default' };

/** Employee master record (plus extra details) for an Employee ID, matched case-insensitively. */
function findEmployee(empId) {
  const id = empId.trim().toUpperCase();
  const emp = EMPLOYEES.find((e) => e.id.toUpperCase() === id);
  return emp ? { ...emp, ...EMPLOYEE_DETAILS[emp.id] } : null;
}

export default function AuditTrainingPlanPage({ pushToast }) {
  const [planNo] = useState(() => nextPlanId());
  const [info, setInfo] = useState({});
  const [audits, setAudits] = useState(INITIAL_AUDITS);
  const [trainings, setTrainings] = useState(INITIAL_TRAININGS);
  const [requesterId, setRequesterId] = useState('');
  const requester = findEmployee(requesterId);

  const setInfoField = (key) => (e) => setInfo((f) => ({ ...f, [key]: e.target.value }));
  const setTrainingField = (idx, key) => (e) => {
    const value = e.target.value;
    setTrainings((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  };
  const setAuditField = (idx, key) => (e) => {
    const value = e.target.value;
    setAudits((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  };

  // Audit Schedule and Training Plan are submitted separately; both need a valid requester
  // and at least one row with a date.
  const submitSection = (label, rows) => {
    if (!requester) {
      pushToast('Enter a valid Employee ID under Requested By before submitting.', 'error');
      return;
    }
    const scheduled = rows.filter((r) => r.date).length;
    if (!scheduled) {
      pushToast(`Set a date for at least one row in the ${label}.`, 'error');
      return;
    }
    pushToast(`${label} (${scheduled} item${scheduled === 1 ? '' : 's'}) for plan ${planNo} submitted by ${requester.name} (${requester.id}).`, 'success');
  };
  const handlePrint = () => window.print();

  return (
    <div className="page-enter">
      <h1 className="page-title">Audit & Training Plan</h1>

      <Panel title="Plan Information" icon={<IconClipboard size={17} />}>
        <div className="form-grid">
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
      </Panel>

      <Panel title="Requested By" icon={<IconUser size={17} />}>
        <div className="form-grid">
          <div className="field">
            <label>Employee ID</label>
            <input
              value={requesterId}
              onChange={(e) => setRequesterId(e.target.value)}
              placeholder="e.g. EMP-1001"
              list="atp-employee-ids"
            />
            <datalist id="atp-employee-ids">
              {EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </datalist>
            {requesterId.trim() && !requester ? (
              <div style={{ fontSize: 12, color: 'var(--red-600)', marginTop: 4 }}>No employee found with this ID.</div>
            ) : null}
          </div>
          <div className="field">
            <label>Name</label>
            <input value={requester?.name || ''} readOnly placeholder="Auto-filled" style={READ_ONLY} />
          </div>
          <div className="field">
            <label>Department</label>
            <input value={requester?.department || ''} readOnly placeholder="Auto-filled" style={READ_ONLY} />
          </div>
          <div className="field">
            <label>Designation</label>
            <input value={requester?.role || ''} readOnly placeholder="Auto-filled" style={READ_ONLY} />
          </div>
          <div className="field">
            <label>Employee Type</label>
            <input value={requester?.type || ''} readOnly placeholder="Auto-filled" style={READ_ONLY} />
          </div>
          <div className="field">
            <label>Reporting HOD</label>
            <input value={requester?.hod || ''} readOnly placeholder="Auto-filled" style={READ_ONLY} />
          </div>
        </div>
      </Panel>

      <Panel title="Audit Schedule" icon={<IconCalendarCheck size={17} />} bodyStyle={{ paddingTop: 16 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th style={{ width: 48 }}>No</th><th>Scheduled Date</th><th>Audit Type</th><th>Area</th><th>Status</th></tr>
            </thead>
            <tbody>
              {audits.map((row, idx) => (
                <tr key={row.type}>
                  <td>{idx + 1}</td>
                  <td><input type="date" value={row.date} onChange={setAuditField(idx, 'date')} /></td>
                  <td style={{ fontWeight: 600 }}>{row.type}</td>
                  <td>{row.area}</td>
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
        <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <button type="button" className="btn btn-primary" onClick={() => submitSection('Audit Schedule', audits)}>
            <IconSend size={15} /> Submit Audit Schedule
          </button>
        </div>
      </Panel>

      <Panel title="Training Plan" icon={<IconCap size={17} />} bodyStyle={{ paddingTop: 16 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th style={{ width: 48 }}>No</th><th>Date</th><th>Training Topic</th><th>Target Group</th><th>Status</th></tr>
            </thead>
            <tbody>
              {trainings.map((row, idx) => (
                <tr key={row.topic}>
                  <td>{idx + 1}</td>
                  <td><input type="date" value={row.date} onChange={setTrainingField(idx, 'date')} /></td>
                  <td style={{ fontWeight: 600 }}>{row.topic}</td>
                  <td>{row.group}</td>
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
        <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <button type="button" className="btn btn-primary" onClick={() => submitSection('Training Plan', trainings)}>
            <IconSend size={15} /> Submit Training Plan
          </button>
        </div>
      </Panel>

      <div className="btn-row">
        <button type="button" className="btn btn-outline" onClick={handlePrint}><IconPrinter size={15} /> Print</button>
      </div>
    </div>
  );
}

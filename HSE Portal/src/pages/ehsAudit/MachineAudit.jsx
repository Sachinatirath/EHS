import { useState } from 'react';
import { IconTool, IconCheckSquare, IconFileText } from '../../components/icons';

const CHECKLIST_ITEMS = [
  'Machine Guard Installed',
  'Emergency Stop Working',
  'Electrical Panel Locked',
  'Warning Labels Available',
  'PPE Used by Operator',
];

const INFO_FIELDS = [
  { key: 'machineName', label: 'Machine Name', placeholder: 'Enter Machine Name' },
  { key: 'machineId', label: 'Machine ID', placeholder: 'Machine ID' },
  { key: 'department', label: 'Department', placeholder: 'Department' },
  { key: 'auditDate', label: 'Audit Date', type: 'date' },
  { key: 'auditorName', label: 'Auditor Name', placeholder: 'Auditor Name' },
  { key: 'location', label: 'Location', placeholder: 'Location' },
];

export default function MachineAudit({ pushToast }) {
  const [info, setInfo] = useState({});
  const [rows, setRows] = useState(CHECKLIST_ITEMS.map(() => ({ status: 'Yes', remarks: '' })));
  const [observation, setObservation] = useState('');

  const setInfoField = (key) => (e) => setInfo((f) => ({ ...f, [key]: e.target.value }));
  const setRow = (idx, key) => (e) => {
    const value = e.target.value;
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
  };

  const statusClass = (status) => (status === 'Yes' ? 'status-yes' : status === 'No' ? 'status-no' : 'status-na');

  const handleSubmit = () => pushToast('Machine audit submitted.', 'success');
  const handleDraft = () => pushToast('Draft saved.', 'info');
  const handlePrint = () => window.print();

  return (
    <div className="page-enter">
      <h1 className="page-title">Online Audit — Machine</h1>

      <div className="panel">
        <div className="panel-header"><IconTool size={17} /> Machine Information</div>
        <div className="panel-body form-grid">
          {INFO_FIELDS.map((f) => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              <input
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={info[f.key] || ''}
                onChange={setInfoField(f.key)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><IconCheckSquare size={17} /> Safety Checklist</div>
        <div className="panel-body" style={{ paddingTop: 16 }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th style={{ width: 48 }}>No</th><th>Checklist Item</th><th style={{ width: 130 }}>Status</th><th>Remarks</th></tr>
              </thead>
              <tbody>
                {CHECKLIST_ITEMS.map((item, idx) => (
                  <tr key={item}>
                    <td>{idx + 1}</td>
                    <td>{item}</td>
                    <td>
                      <select
                        className={`checklist-select ${statusClass(rows[idx].status)}`}
                        value={rows[idx].status}
                        onChange={setRow(idx, 'status')}
                      >
                        <option>Yes</option>
                        <option>No</option>
                        <option>N/A</option>
                      </select>
                    </td>
                    <td>
                      <textarea rows={1} value={rows[idx].remarks} onChange={setRow(idx, 'remarks')} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><IconFileText size={17} /> Overall Observation</div>
        <div className="panel-body">
          <textarea
            style={{ width: '100%', minHeight: 110, border: '1.5px solid var(--slate-200)', borderRadius: 8, padding: 12, fontSize: 14 }}
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Enter overall observation notes..."
          />
        </div>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>Submit Audit</button>
        <button type="button" className="btn btn-outline" onClick={handleDraft}>Save Draft</button>
        <button type="button" className="btn btn-ghost" onClick={handlePrint}>Print Report</button>
      </div>
    </div>
  );
}

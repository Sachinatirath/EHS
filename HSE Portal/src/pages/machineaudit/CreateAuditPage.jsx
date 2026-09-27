import { useState } from 'react';
import Panel from '../../components/Panel';
import PhotoPreview from '../../components/PhotoPreview';
import { IconTool, IconCheckSquare, IconFileText, IconUsers, IconClipboard, IconClock } from '../../components/icons';
import SignaturePad from '../safetyviolation/SignaturePad';
import { readImageAsDataUrl } from '../fastaid/imageUtil';
import {
  CHECKLIST_ITEMS, INCHARGE_ROLES, MACHINE_DEPARTMENTS, createAudit, inchargeFor, knownMachines, machineHistory, useMachineAuditAuth,
} from './store';
import { ObservationList } from './AuditDetail';
import { LastInspection, AuditHistoryTable } from './MachineHistory';

const INFO_FIELDS = [
  { key: 'machine_id', label: 'Machine ID', placeholder: 'Pick or enter Machine ID', list: 'ma-known-machines' },
  { key: 'machine_name', label: 'Machine Name *', placeholder: 'Enter Machine Name' },
  { key: 'audit_date', label: 'Audit Date', type: 'date' },
  { key: 'location', label: 'Location', placeholder: 'Location' },
];

const statusClass = (status) => (status === 'Yes' ? 'status-yes' : status === 'No' ? 'status-no' : 'status-na');

export default function CreateAuditPage({ onNavigate, pushToast }) {
  const { user } = useMachineAuditAuth();
  const [info, setInfo] = useState(() => ({ department: MACHINE_DEPARTMENTS[0], audit_date: new Date().toISOString().slice(0, 10) }));
  const [checklist, setChecklist] = useState(() => CHECKLIST_ITEMS.map((item) => ({ item, status: 'Yes', remarks: '', photo_url: null })));
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [machines] = useState(knownMachines);

  // Picking an already-audited Machine ID fills in that machine's details.
  const setInfoField = (key) => (e) => {
    const value = e.target.value;
    const known = key === 'machine_id' && machines.find((m) => m.machine_id?.toLowerCase() === value.trim().toLowerCase());
    setInfo((f) => (known ? { ...f, ...known, machine_id: value } : { ...f, [key]: value }));
  };
  const hasMachine = Boolean(info.machine_id?.trim() || info.machine_name?.trim());
  const history = machineHistory(info);
  const updateRow = (idx, patch) => setChecklist((rows) => rows.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  // Only a "No" answer carries a photo, so drop it when the answer changes back.
  const setStatus = (idx) => (e) => {
    const status = e.target.value;
    updateRow(idx, status === 'No' ? { status } : { status, photo_url: null });
  };

  const setPhoto = (idx) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      updateRow(idx, { photo_url: await readImageAsDataUrl(file) });
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const validate = () => {
    if (!info.machine_name?.trim()) return 'Enter the machine name.';
    const missing = checklist.find((row) => row.status === 'No' && (!row.photo_url || !row.remarks.trim()));
    if (missing) return `"${missing.item}" is marked No — add remarks and attach a photo.`;
    if (!signature) return 'Safety Officer signature is required to submit.';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      pushToast(error, 'error');
      return;
    }
    setSubmitting(true);
    try {
      const audit = await createAudit({
        machine_name: info.machine_name.trim(),
        machine_id: info.machine_id || null,
        department: info.department,
        audit_date: info.audit_date || null,
        location: info.location || null,
        checklist,
        notes: notes.trim(),
        officer_signature: signature,
      });
      pushToast(`Machine audit ${audit.audit_no} submitted and assigned to Shift, Mech & Ele in-charges.`, 'success');
      onNavigate('ma-officer-home');
    } catch (err) {
      pushToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      <h1 className="page-title">Online Audit — Machine</h1>

      <Panel title="Machine Information" icon={<IconTool size={17} />}>
        <div className="form-grid">
          {INFO_FIELDS.map((f) => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              <input type={f.type || 'text'} placeholder={f.placeholder} list={f.list} value={info[f.key] || ''} onChange={setInfoField(f.key)} />
            </div>
          ))}
          <div className="field">
            <label>Department</label>
            <select value={info.department} onChange={setInfoField('department')}>
              {MACHINE_DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Safety Officer</label>
            <input value={user ? `${user.name} (${user.employee_id})` : ''} disabled />
          </div>
        </div>
        <datalist id="ma-known-machines">
          {machines.map((m) => <option key={m.machine_id || m.machine_name} value={m.machine_id}>{m.machine_name}</option>)}
        </datalist>
      </Panel>

      <Panel title="Last Inspection" icon={<IconClipboard size={17} />}>
        {hasMachine ? (
          <LastInspection key={history[0]?.id} last={history[0]} />
        ) : (
          <div style={{ fontSize: 14, color: 'var(--slate-500)' }}>Pick or enter a Machine ID to see its last inspection.</div>
        )}
      </Panel>

      {history.length ? (
        <Panel title={`Audit History — ${history[0].machine_name}`} icon={<IconClock size={17} />}>
          <AuditHistoryTable history={history} />
        </Panel>
      ) : null}

      <Panel title="Safety Checklist" icon={<IconCheckSquare size={17} />} bodyStyle={{ paddingTop: 16 }}>
        <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--slate-500)' }}>
          For every item marked <strong>No</strong>, add remarks and attach a photo — it is added to the Overall Observation automatically.
        </p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th style={{ width: 48 }}>No</th><th>Checklist Item</th><th style={{ width: 130 }}>Status</th><th>Remarks</th><th style={{ width: 220 }}>Photo</th></tr>
            </thead>
            <tbody>
              {checklist.map((row, idx) => {
                const isNo = row.status === 'No';
                return (
                  <tr key={row.item} style={isNo ? { background: '#fef2f2' } : undefined}>
                    <td>{idx + 1}</td>
                    <td>{row.item}</td>
                    <td>
                      <select className={`checklist-select ${statusClass(row.status)}`} value={row.status} onChange={setStatus(idx)}>
                        <option>Yes</option>
                        <option>No</option>
                        <option>N/A</option>
                      </select>
                    </td>
                    <td>
                      <textarea
                        rows={1}
                        value={row.remarks}
                        placeholder={isNo ? 'Remarks (required)' : ''}
                        onChange={(e) => updateRow(idx, { remarks: e.target.value })}
                      />
                    </td>
                    <td>
                      {isNo ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <input type="file" accept="image/*" onChange={setPhoto(idx)} style={{ fontSize: 12 }} />
                          {row.photo_url ? (
                            <PhotoPreview src={row.photo_url} alt={`${row.item} photo`} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--slate-200)' }} />
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--red-600)' }}>Photo required</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--slate-400)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Overall Observation" icon={<IconFileText size={17} />}>
        <ObservationList checklist={checklist} />
        <div className="field" style={{ marginTop: 14 }}>
          <label>Additional notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any other observation…" />
        </div>
      </Panel>

      <Panel title="Sign-off" icon={<IconUsers size={17} />}>
        <div className="field">
          <label>Name &amp; Sign of Safety Officer — {user?.name} (Audit Submit + Closed)</label>
          <SignaturePad onChange={setSignature} />
        </div>
        <p style={{ margin: '16px 0 8px', fontSize: 12.5, color: 'var(--slate-500)' }}>
          On submit this audit is assigned to the in-charges below. Each must complete and sign it (note and photo optional)
          before you can close it.
        </p>
        {INCHARGE_ROLES.map(({ key, label }) => (
          <div className="split-row" key={key}>
            <span>Name &amp; Sign of {label}</span>
            <span style={{ color: 'var(--slate-900)', fontWeight: 700 }}>{inchargeFor(key).name}</span>
          </div>
        ))}
      </Panel>

      <div className="btn-row">
        <button type="button" className="btn btn-outline" onClick={() => onNavigate('ma-officer-home')} disabled={submitting}>Cancel</button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Audit'}
        </button>
      </div>
    </div>
  );
}

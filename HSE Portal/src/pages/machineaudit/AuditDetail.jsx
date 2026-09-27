import { useState } from 'react';
import { PhotoButton } from '../../components/PhotoPreview';
import { IconDownload } from '../../components/icons';
import { downloadMachineAuditPdf } from '../../utils/machineAuditPdf';
import { INCHARGE_ROLES, inchargeFor, machineHistory, observationPoints } from './store';
import { AuditHistoryTable } from './MachineHistory';
import { STATUS_META, formatDate, formatDateTime } from './statusMeta';

const strong = { color: 'var(--slate-900)', fontWeight: 700, textAlign: 'right' };
const text = { margin: 0, fontSize: 13.5, color: 'var(--slate-700)', whiteSpace: 'pre-wrap' };

function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return <div className="split-row"><span>{label}</span><span style={strong}>{value}</span></div>;
}

function Block({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function Step({ done, active, title, meta, note, photo, signature }) {
  const color = done ? 'var(--ma-primary)' : 'var(--slate-300)';
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{
          width: 14, height: 14, borderRadius: '50%', background: done ? color : '#fff',
          border: `2px solid ${color}`, boxShadow: active ? '0 0 0 4px var(--ma-primary-light)' : 'none',
        }}
        />
        <span style={{ flex: 1, width: 2, background: 'var(--slate-200)', marginTop: 2 }} />
      </div>
      <div style={{ paddingBottom: 14, flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: done || active ? 'var(--slate-900)' : 'var(--slate-400)' }}>{title}</div>
        {meta ? <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{meta}</div> : null}
        {note ? <p style={{ ...text, marginTop: 4 }}>{note}</p> : null}
        {photo || signature ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <PhotoButton src={photo} alt="Action photo" />
            {signature ? (
              <img src={signature} alt="Signature" style={{ height: 44, background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 8 }} />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Numbered list of every checklist item marked "No", with its remarks and photo. */
export function ObservationList({ checklist }) {
  const points = observationPoints(checklist);
  if (!points.length) {
    return <p style={{ ...text, color: 'var(--slate-500)' }}>No non-compliance — every checklist item is Yes or N/A.</p>;
  }
  return (
    <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {points.map((p) => (
        <li key={p.item} style={{ fontSize: 13.5, color: 'var(--slate-700)' }}>
          <strong style={{ color: 'var(--red-600)' }}>{p.item}</strong> — Not complied.
          {p.remarks ? <> Remarks: {p.remarks}</> : null}
        </li>
      ))}
    </ol>
  );
}

/** Read-only view of a machine audit, plus the submit → in-charges → close trail. */
export default function AuditDetail({ audit: a }) {
  const meta = STATUS_META[a.status];
  const closed = a.status === 'closed';
  const [exporting, setExporting] = useState(false);

  const exportPdf = async () => {
    setExporting(true);
    try {
      await downloadMachineAuditPdf(a, { roles: INCHARGE_ROLES, nameOf: (key) => inchargeFor(key).name, history: machineHistory(a) });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span className={`pill ${meta.pill}`}>{meta.label}</span>
        <button type="button" className="btn btn-primary" style={{ padding: '6px 14px' }} disabled={exporting} onClick={exportPdf}>
          <IconDownload size={14} /> {exporting ? 'Preparing…' : 'Download'}
        </button>
      </div>

      <div style={{ borderBottom: '1px solid var(--slate-200)', paddingBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', marginBottom: 10 }}>Sign-off Progress</div>
        <Step done title={`Submitted by Safety Officer — ${a.officer.name}`} meta={formatDateTime(a.created_at)} signature={a.officer_signature} />
        {INCHARGE_ROLES.map(({ key, label }) => {
          const s = a.signoffs[key];
          const done = s.status === 'completed';
          return (
            <Step
              key={key}
              done={done}
              active={!done && !closed}
              title={`${label} — ${inchargeFor(key).name}`}
              meta={done ? `Completed ${formatDateTime(s.completed_at)}` : 'Pending'}
              note={s.note}
              photo={s.photo_url}
              signature={s.signature_data}
            />
          );
        })}
        <Step
          done={closed}
          active={a.status === 'ready_to_close'}
          title={`Closed by Safety Officer — ${a.officer.name}`}
          meta={closed ? formatDateTime(a.closed_at) : (a.status === 'ready_to_close' ? 'Waiting for Safety Officer to close' : 'Opens once all three in-charges complete')}
          note={a.closure_note}
        />
      </div>

      <Row label="Machine" value={`${a.machine_name}${a.machine_id ? ` (${a.machine_id})` : ''}`} />
      <Row label="Department" value={a.department} />
      <Row label="Location" value={a.location} />
      <Row label="Audit date" value={a.audit_date ? formatDate(a.audit_date) : null} />
      <Row label="Safety Officer" value={`${a.officer.name} (${a.officer.employee_id})`} />

      <Block label="Safety Checklist">
        <div className="table-wrap">
          <table className="data-table compact">
            <thead><tr><th>No</th><th>Checklist Item</th><th>Status</th><th>Remarks</th><th>Photo</th></tr></thead>
            <tbody>
              {a.checklist.map((row, idx) => (
                <tr key={row.item}>
                  <td>{idx + 1}</td>
                  <td>{row.item}</td>
                  <td><span className={`pill ${row.status === 'Yes' ? 'pill-green' : row.status === 'No' ? 'pill-red' : 'pill-slate'}`}>{row.status}</span></td>
                  <td>{row.remarks || '—'}</td>
                  <td><PhotoButton src={row.photo_url} alt={`${row.item} photo`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      <Block label="Overall Observation">
        <ObservationList checklist={a.checklist} />
        {a.notes ? <p style={{ ...text, marginTop: 10 }}>{a.notes}</p> : null}
      </Block>

      <Block label={`Audit History — ${a.machine_name}`}>
        <AuditHistoryTable history={machineHistory(a)} currentId={a.id} />
      </Block>
    </div>
  );
}

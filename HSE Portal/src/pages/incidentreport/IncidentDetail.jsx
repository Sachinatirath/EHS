import { STATUS_META, SEVERITY_META, formatDate, formatDateTime } from './statusMeta';
import { useState } from 'react';
import { assignedHod } from './store';
import PhotoPreview from '../../components/PhotoPreview';
import { IconDownload } from '../../components/icons';
import { downloadIncidentPdf } from '../../utils/incidentPdf';

const strong = { color: 'var(--slate-900)', fontWeight: 700, textAlign: 'right' };

function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return <div className="split-row"><span>{label}</span><span style={strong}>{value}</span></div>;
}

const text = { margin: 0, fontSize: 13.5, color: 'var(--slate-700)', whiteSpace: 'pre-wrap' };

function Block({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', marginBottom: 4 }}>{label}</div>
      <p style={text}>{value}</p>
    </div>
  );
}

function Step({ done, active, title, meta, note }) {
  const color = done ? 'var(--ir-primary)' : 'var(--slate-300)';
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{
          width: 14, height: 14, borderRadius: '50%', background: done ? color : '#fff',
          border: `2px solid ${color}`, boxShadow: active ? '0 0 0 4px var(--ir-primary-light)' : 'none',
        }}
        />
        <span style={{ flex: 1, width: 2, background: 'var(--slate-200)', marginTop: 2 }} />
      </div>
      <div style={{ paddingBottom: 14 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: done || active ? 'var(--slate-900)' : 'var(--slate-400)' }}>{title}</div>
        {meta ? <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{meta}</div> : null}
        {note ? <p style={{ ...text, marginTop: 4 }}>{note}</p> : null}
      </div>
    </div>
  );
}

/** Read-only view of everything an agent submitted, plus the HOD investigation → close trail. */
export default function IncidentDetail({ incident: i }) {
  const [exporting, setExporting] = useState(false);
  const meta = STATUS_META[i.status];
  const sev = SEVERITY_META[i.severity];
  const investigating = i.status !== 'open';
  const closed = i.status === 'closed';

  const exportPdf = async () => {
    setExporting(true);
    try {
      await downloadIncidentPdf(i, assignedHod().name);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className={`pill ${meta.pill}`}>{meta.label}</span>
          {i.severity ? <span className={`pill ${sev ? sev.pill : 'pill-slate'}`}>{i.severity}</span> : null}
        </div>
        <button type="button" className="btn btn-primary" style={{ padding: '6px 14px' }} disabled={exporting} onClick={exportPdf}>
          <IconDownload size={14} /> {exporting ? 'Preparing…' : 'Download'}
        </button>
      </div>

      <div style={{ borderBottom: '1px solid var(--slate-200)', paddingBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', marginBottom: 10 }}>Progress</div>
        <Step done title="Reported by agent" meta={formatDateTime(i.created_at)} />
        <Step
          done={investigating}
          active={i.status === 'open'}
          title="Picked up by HOD"
          meta={i.reviewed_at ? formatDateTime(i.reviewed_at) : 'Waiting for HOD'}
          note={i.status === 'under_investigation' ? i.resolution_note : null}
        />
        <Step
          done={closed}
          active={i.status === 'under_investigation'}
          title="Closed by HOD"
          meta={closed ? (i.closed_at ? formatDateTime(i.closed_at) : null) : 'Only the HOD can close this incident'}
          note={closed ? i.resolution_note : null}
        />
      </div>

      <Row label="Reported by" value={i.agent ? `${i.agent.name} (${i.agent.employee_id})` : null} />
      <Row label="Filed on" value={formatDateTime(i.created_at)} />
      <Row label="Incident date / time" value={i.incident_date ? `${formatDate(i.incident_date)} ${i.incident_time || ''}`.trim() : null} />
      <Row label="Reported by (name)" value={i.reported_by} />
      <Row label="Department" value={i.department} />
      <Row label="Location" value={i.location} />
      <Row label="Incident type" value={i.incident_type} />
      <Row label="Assigned HOD" value={assignedHod().name} />

      <Block label="Description" value={i.description} />
      <Block label="Immediate corrective action" value={i.corrective_action} />
      <Block label="Root cause" value={i.root_cause} />
      <Block label="Corrective & preventive action" value={i.preventive_action} />
      {i.photo_url ? (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', marginBottom: 4 }}>Attachment (click to enlarge)</div>
          <PhotoPreview
            src={i.photo_url}
            alt="Incident attachment"
            style={{ width: '100%', maxHeight: 320, objectFit: 'contain', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 10 }}
          />
        </div>
      ) : null}
    </div>
  );
}

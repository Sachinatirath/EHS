import { useState } from 'react';
import { hodForDepartment } from './store';
import PhotoPreview from '../../components/PhotoPreview';
import { downloadViolationPdf } from '../../utils/violationPdf';
import { IconDownload } from '../../components/icons';
import { STATUS_META, formatDate, formatDateTime } from './statusMeta';

const strong = { color: 'var(--slate-900)', fontWeight: 700, textAlign: 'right' };

function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return <div className="split-row"><span>{label}</span><span style={strong}>{value}</span></div>;
}

function Block({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

const text = { margin: 0, fontSize: 13.5, color: 'var(--slate-700)', whiteSpace: 'pre-wrap' };

function Step({ done, active, title, meta, note }) {
  const color = done ? 'var(--sv-primary)' : 'var(--slate-300)';
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{
          width: 14, height: 14, borderRadius: '50%', background: done ? color : '#fff',
          border: `2px solid ${color}`, boxShadow: active ? '0 0 0 4px var(--sv-primary-light)' : 'none',
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

/** Read-only view of everything an agent submitted, plus the review → reassign → close trail. */
export default function ViolationDetail({ violation: v }) {
  const meta = STATUS_META[v.status];
  const [exporting, setExporting] = useState(false);
  const reviewed = v.status !== 'open';

  const exportPdf = async () => {
    setExporting(true);
    try {
      await downloadViolationPdf(v, hodForDepartment(v.department)?.name);
    } finally {
      setExporting(false);
    }
  };
  const closed = v.status === 'closed';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span className={`pill ${meta.pill}`}>{meta.label}</span>
        <button type="button" className="btn btn-primary" style={{ padding: '6px 14px' }} disabled={exporting} onClick={exportPdf}>
          <IconDownload size={14} /> {exporting ? 'Preparing…' : 'Download'}
        </button>
      </div>

      <div style={{ borderBottom: '1px solid var(--slate-200)', paddingBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', marginBottom: 10 }}>Progress</div>
        <Step done title="Submitted by agent" meta={formatDateTime(v.created_at)} />
        <Step
          done={reviewed}
          active={v.status === 'open'}
          title={v.status === 'rejected' ? 'Rejected by HOD' : 'Reviewed by HOD & reassigned to agent'}
          meta={v.reviewed_at ? formatDateTime(v.reviewed_at) : (reviewed ? null : 'Waiting for HOD review')}
          note={reviewed ? v.resolution_note : null}
        />
        {v.status !== 'rejected' ? (
          <Step
            done={closed}
            active={v.status === 'under_review'}
            title="Closed by agent"
            meta={closed ? (v.closed_at ? formatDateTime(v.closed_at) : null) : (v.status === 'under_review' ? 'Waiting for agent to close' : null)}
            note={closed ? v.closure_note : null}
          />
        ) : null}
      </div>

      <Row label="Reported by" value={`${v.agent.name} (${v.agent.employee_id})`} />
      <Row label="Filed on" value={formatDateTime(v.created_at)} />
      <Row label="Violation date" value={v.violation_date ? formatDate(v.violation_date) : null} />
      <Row label="Company / Contractor" value={v.company} />
      <Row label="Department" value={v.department} />
      <Row label="Assigned HOD" value={hodForDepartment(v.department)?.name} />
      <Row label="Supervisor" value={v.supervisor} />
      <Row label="Employee" value={v.employee_name ? `${v.employee_name} (${v.employee_code || '—'})` : null} />
      <Row label="Job title" value={v.job_title} />
      <Row label="Violation type" value={v.violation_type} />
      <Row label="Offence" value={v.offence} />

      {v.corrective_actions?.length ? (
        <Block label="Corrective actions">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {v.corrective_actions.map((a) => <span key={a} className="pill pill-blue">{a}</span>)}
          </div>
        </Block>
      ) : null}
      {v.description ? <Block label="Description"><p style={text}>{v.description}</p></Block> : null}
      {v.explanation ? <Block label="Employee explanation"><p style={text}>{v.explanation}</p></Block> : null}
      {v.photo_url ? (
        <Block label="Photo / Evidence (click to enlarge)">
          <PhotoPreview src={v.photo_url} alt="Evidence" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--slate-200)' }} />
        </Block>
      ) : null}
      {v.employee_signature_data ? (
        <Block label="Employee signature">
          <img
            src={v.employee_signature_data}
            alt="Employee signature"
            style={{ width: 240, background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 10 }}
          />
          {v.employee_name ? <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 4 }}>{v.employee_name}</div> : null}
        </Block>
      ) : null}
    </div>
  );
}

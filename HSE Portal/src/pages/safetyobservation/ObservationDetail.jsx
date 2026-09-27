import { useState } from 'react';
import { hodsForDepartment, assigneeFor } from './store';
import PhotoPreview from '../../components/PhotoPreview';
import { IconDownload } from '../../components/icons';
import { downloadObservationPdf } from '../../utils/observationPdf';
import { STATUS_META, SLA_COLORS, formatDate, formatDateTime, formatCountdown, slaInfo } from './statusMeta';

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
  const color = done ? 'var(--so-primary)' : 'var(--slate-300)';
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{
          width: 14, height: 14, borderRadius: '50%', background: done ? color : '#fff',
          border: `2px solid ${color}`, boxShadow: active ? '0 0 0 4px var(--so-primary-light)' : 'none',
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
export default function ObservationDetail({ observation: o, now = Date.now() }) {
  const [exporting, setExporting] = useState(false);
  const meta = STATUS_META[o.status];
  const reviewed = o.status !== 'open' && o.status !== 'escalated_manager';
  const closed = o.status === 'closed';
  const escalated = o.status === 'escalated' || !!o.escalated_at;
  const sla = slaInfo(o, now);
  const closedBy = o.closed_by === 'hod' ? 'HOD' : (o.closed_by === 'manager' ? 'Manager' : 'agent');
  const assignee = assigneeFor(o);
  const reviewerLabel = o.reviewed_by_role ? (o.reviewed_by_role === 'manager' ? 'Manager' : 'HOD') : assignee.role;

  const exportPdf = async () => {
    setExporting(true);
    try {
      await downloadObservationPdf(o, assigneeFor(o));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className={`pill ${meta.pill}`}>{meta.label}</span>
          {sla ? <span style={{ fontSize: 12.5, fontWeight: 700, color: SLA_COLORS[sla.tone] }}>{sla.text}</span> : null}
        </div>
        <button type="button" className="btn btn-primary" style={{ padding: '6px 14px' }} disabled={exporting} onClick={exportPdf}>
          <IconDownload size={14} /> {exporting ? 'Preparing…' : 'Download'}
        </button>
      </div>

      {o.status === 'open' && o.hod_due_at && sla ? (
        <div
          style={{
            textAlign: 'center', padding: '14px 12px', borderRadius: 12,
            background: sla.tone === 'ok' ? 'var(--green-50)' : (sla.tone === 'warn' ? 'var(--amber-50)' : 'var(--red-50)'),
            border: `1px solid ${SLA_COLORS[sla.tone]}`,
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--slate-500)' }}>
            Time left for the {o.department} HOD to act
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: SLA_COLORS[sla.tone], margin: '2px 0' }}>
            {formatCountdown(Date.parse(o.hod_due_at) - now)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>
            Not reviewed by {formatDateTime(o.hod_due_at)}? It moves to the Manager profile.
          </div>
        </div>
      ) : null}

      {o.status === 'under_review' && o.due_at ? (
        <div
          style={{
            textAlign: 'center', padding: '14px 12px', borderRadius: 12,
            background: sla.tone === 'ok' ? 'var(--green-50)' : (sla.tone === 'warn' ? 'var(--amber-50)' : 'var(--red-50)'),
            border: `1px solid ${SLA_COLORS[sla.tone]}`,
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--slate-500)' }}>
            Time left for agent to close
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: SLA_COLORS[sla.tone], margin: '2px 0' }}>
            {formatCountdown(Date.parse(o.due_at) - now)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>
            Not closed by {formatDateTime(o.due_at)}? It is automatically assigned to the {assignee.role}.
          </div>
        </div>
      ) : null}

      <div style={{ borderBottom: '1px solid var(--slate-200)', paddingBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', marginBottom: 10 }}>Progress</div>
        <Step done title="Submitted by agent" meta={formatDateTime(o.created_at)} />
        {o.hod_escalated_at ? (
          <Step
            done
            active={o.status === 'escalated_manager'}
            title="HOD did not act by the closing time — moved to Manager"
            meta={formatDateTime(o.hod_escalated_at)}
          />
        ) : null}
        <Step
          done={reviewed}
          active={o.status === 'open' || o.status === 'escalated_manager'}
          title={o.status === 'rejected' ? `Rejected by ${reviewerLabel}` : `Reviewed by ${reviewerLabel} & assigned to agent with SLA`}
          meta={o.reviewed_at ? formatDateTime(o.reviewed_at) : (reviewed ? null : `Waiting for ${assignee.role} review`)}
          note={reviewed ? o.resolution_note : null}
        />
        {o.status !== 'rejected' ? (
          <>
            {escalated ? (
              <Step
                done
                active={o.status === 'escalated'}
                title={`SLA missed — escalated to ${assignee.role}`}
                meta={o.escalated_at ? formatDateTime(o.escalated_at) : null}
              />
            ) : null}
            <Step
              done={closed}
              active={o.status === 'under_review' || o.status === 'escalated'}
              title={`Closed by ${closedBy}`}
              meta={closed
                ? (o.closed_at ? formatDateTime(o.closed_at) : null)
                : (o.status === 'under_review' ? `Waiting for agent — ${sla?.text || ''}` : (o.status === 'escalated' ? `Waiting for ${assignee.role} to close` : null))}
              note={closed ? o.closure_note : null}
            />
          </>
        ) : null}
      </div>

      <Row label="Reported by" value={`${o.agent.name} (${o.agent.employee_id})`} />
      <Row label="Observer" value={o.observer_name ? `${o.observer_name} (${o.observer_employee_code || '—'})` : null} />
      <Row label="Filed on" value={formatDateTime(o.created_at)} />
      <Row label="Observation date" value={o.observation_date ? formatDate(o.observation_date) : null} />
      <Row label="Observation time" value={o.observation_time} />
      <Row label="Closing time" value={o.closing_at ? formatDateTime(o.closing_at) : null} />
      <Row label="Assigned to agent on" value={o.assigned_at ? formatDateTime(o.assigned_at) : null} />
      <Row label="SLA – close by" value={o.due_at ? formatDateTime(o.due_at) : null} />
      <Row label="Department" value={o.department} />
      <Row label={assignee.role === 'Manager' ? 'Assigned to (Manager)' : 'Assigned Shift HODs'} value={assignee.name} />
      <Row label="Department HODs" value={hodsForDepartment(o.department).map((h) => `${h.name} (Shift ${h.shift})`).join(', ') || null} />
      <Row label="Reviewed by" value={o.reviewed_by_user ? `${o.reviewed_by_user.name} (${o.reviewed_by_user.role})` : null} />
      <Row label="Closed by" value={o.closed_by_user ? `${o.closed_by_user.name} (${o.closed_by_user.role})` : null} />
      <Row label="Plant / Site" value={o.plant} />
      <Row label="Area" value={o.area} />
      <Row label="Location" value={o.location} />
      <Row label="Category" value={o.category} />
      <Row label="Severity" value={o.severity} />

      {o.description ? <Block label="Description"><p style={text}>{o.description}</p></Block> : null}
      {o.corrective_action ? <Block label="Immediate corrective action"><p style={text}>{o.corrective_action}</p></Block> : null}
      {o.review_photo_url ? (
        <Block label={`Photo attached by ${reviewerLabel} (click to enlarge)`}>
          <PhotoPreview
            src={o.review_photo_url}
            alt="Review photo"
            style={{ width: '100%', maxHeight: 320, objectFit: 'contain', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 10 }}
          />
        </Block>
      ) : null}
      {o.closure_photo_url ? (
        <Block label="Rectification image (click to enlarge)">
          <PhotoPreview
            src={o.closure_photo_url}
            alt="Rectification evidence"
            style={{ width: '100%', maxHeight: 320, objectFit: 'contain', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 10 }}
          />
        </Block>
      ) : null}
      {o.photo_url ? (
        <Block label="Attached evidence (click to enlarge)">
          <PhotoPreview
            src={o.photo_url}
            alt="Attached evidence"
            style={{ width: '100%', maxHeight: 320, objectFit: 'contain', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 10 }}
          />
        </Block>
      ) : null}
    </div>
  );
}

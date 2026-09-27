import { useCallback, useEffect, useMemo, useState } from 'react';
import Panel from '../../components/Panel';
import PageHeader from '../../components/PageHeader';
import Skeleton from './Skeleton';
import StatusPill from './StatusPill';
import { IconChevronLeft, IconClipboard, IconDownload, IconEye } from '../../components/icons';
import { apiFetch, peekPendingTarget, clearPendingTarget } from './store';
import { formatDate } from './statusMeta';
import { readImageAsDataUrl } from './imageUtil';
import PhotoPreview from '../../components/PhotoPreview';
import ListFilters from '../../components/ListFilters';
import { inDateRange } from '../../utils/dateRange';

const VIEW = 'fa-ohc-refills';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'awaiting_verification', label: 'Awaiting Verification' },
  { key: 'closed', label: 'Closed' },
  { key: 'rejected', label: 'Rejected' },
];

/* ---------- Refill detail (mobile RefillDetailScreen) ---------- */

function RefillDetail({ refillId, onBack, onChanged, onMissing, pushToast }) {
  const [refill, setRefill] = useState(null);
  const [notes, setNotes] = useState({});
  // One shared evidence photo covers the whole request (as on mobile).
  const [sharedPhoto, setSharedPhoto] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    return apiFetch(`/refills/${refillId}`)
      .then(setRefill)
      .catch((err) => {
        if (/not found/i.test(err.message)) onMissing();
        else setError(err.message);
      });
  }, [refillId, onMissing]);

  useEffect(() => { load(); }, [load]);

  if (!refill) {
    return (
      <div>
        <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px', marginBottom: 12 }} onClick={onBack}>
          <IconChevronLeft size={14} /> Back to requests
        </button>
        {error ? <div style={{ color: 'var(--red-600)', fontSize: 13.5 }}>{error}</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton height={56} radius={12} />
            <div className="two-col">
              <Skeleton height={200} radius={16} />
              <Skeleton height={200} radius={16} />
            </div>
          </div>
        )}
      </div>
    );
  }

  const box = refill.inspection.box;
  const editable = refill.status === 'pending' || refill.status === 'rejected';
  const flaggedItems = refill.inspection.items.filter((i) => i.status !== 'ok');
  const allNotesFilled = flaggedItems.every((item) => (notes[item.id] ?? '').trim().length > 0);

  const takeFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      setSharedPhoto(await readImageAsDataUrl(file));
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const handleSubmit = async () => {
    if (!editable || !allNotesFilled) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/refills/${refillId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          items: flaggedItems.map((item) => ({
            inspection_item_id: item.id,
            replacement_note: notes[item.id],
            photo_url: sharedPhoto || undefined,
          })),
        }),
      });
      pushToast('Sent to Area Incharge for re-verification', 'success');
      await load();
      onChanged();
    } catch (err) {
      if (/not found/i.test(err.message)) onMissing();
      else setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submittedPhoto = sharedPhoto ?? refill.refill_items[0]?.photo_url ?? null;

  return (
    <div>
      <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px', marginBottom: 12 }} onClick={onBack}>
        <IconChevronLeft size={14} /> Back to requests
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--slate-900)' }}>{refill.request_code} · Box {box.box_number}</div>
          <div style={{ fontSize: 14, color: 'var(--slate-500)', marginTop: 2 }}>{box.department} · {box.area} · {box.location}</div>
        </div>
        <StatusPill kind={refill.status} />
      </div>

      {refill.rejection_reason ? (
        <div className="panel" style={{ background: 'var(--red-100)', borderColor: 'var(--red-600)' }}>
          <div className="panel-body">
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red-600)', marginBottom: 2 }}>REJECTED BY AREA INCHARGE</div>
            <div style={{ fontSize: 14, color: 'var(--slate-900)' }}>{refill.rejection_reason}</div>
          </div>
        </div>
      ) : null}

      {error ? <div style={{ color: 'var(--red-600)', fontSize: 13.5, marginBottom: 12 }}>{error}</div> : null}

      <div className="two-col" style={{ alignItems: 'flex-start' }}>
        <Panel title="Flagged Items" icon={<IconClipboard size={17} />} noMargin>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {flaggedItems.map((item) => (
              <div key={item.id} style={{ border: '1px solid var(--slate-200)', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate-900)' }}>{item.item_name}</span>
                  <StatusPill kind={item.status} />
                </div>
                {item.note ? <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{item.note}</div> : null}
                {item.photo_url ? (
                  <div style={{ marginTop: 10 }}><PhotoPreview src={item.photo_url} alt="Inspector evidence" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }} /></div>
                ) : (
                  <div style={{ marginTop: 10, height: 64, borderRadius: 8, background: 'var(--blue-100)', color: 'var(--blue-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                    No inspector photo attached
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Upload Refill Details" icon={<IconDownload size={17} />} noMargin>
          {editable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {flaggedItems.map((item) => (
                <div className="field" key={item.id}>
                  <label>{item.item_name}</label>
                  <input
                    value={notes[item.id] ?? ''}
                    placeholder="Replacement detail, quantity, batch/lot no."
                    onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                  />
                </div>
              ))}

              <label
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); takeFile(e.dataTransfer.files?.[0]); }}
                style={{
                  border: `1.5px dashed ${dragging ? 'var(--blue-600)' : 'var(--slate-300)'}`,
                  borderRadius: 12,
                  padding: '20px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  background: dragging ? 'var(--blue-50)' : 'transparent',
                }}
              >
                {sharedPhoto ? (
                  <PhotoPreview src={sharedPhoto} alt="Refill evidence" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <>
                    <span style={{ color: 'var(--slate-400)', display: 'flex' }}><IconDownload size={20} /></span>
                    <span style={{ fontSize: 12, color: 'var(--slate-400)', fontWeight: 600 }}>Drag &amp; drop photo evidence, or click to browse</span>
                  </>
                )}
                <input type="file" accept="image/*" hidden onChange={(e) => takeFile(e.target.files?.[0])} />
              </label>

              <button type="button" className="btn btn-primary" disabled={!allNotesFilled || submitting} onClick={handleSubmit}>
                {submitting ? 'Submitting…' : 'Submit for Re-verification'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {flaggedItems.map((item) => {
                const submitted = refill.refill_items.find((r) => r.inspection_item.id === item.id);
                if (!submitted) return null;
                return (
                  <div key={item.id} style={{ background: 'var(--green-100)', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-600)' }}>{item.item_name.toUpperCase()} — REFILLED</div>
                    <div style={{ fontSize: 14, color: 'var(--slate-900)', marginTop: 4 }}>{submitted.replacement_note}</div>
                  </div>
                );
              })}
              {!refill.refill_items.length ? (
                <div style={{ fontSize: 13, color: 'var(--slate-500)' }}>No refill details have been submitted for this request yet.</div>
              ) : null}
              {submittedPhoto ? (
                <PhotoPreview src={submittedPhoto} alt="Refill evidence" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }} />
              ) : null}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ---------- List ---------- */

// OHC has to upload refill details while a request is pending or was rejected.
const needsAction = (r) => r.status === 'pending' || r.status === 'rejected';

export default function RefillsPage({ pushToast }) {
  const [refills, setRefills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedId, setSelectedId] = useState(() => peekPendingTarget(VIEW)?.refillId ?? null);

  const load = useCallback(() => {
    return apiFetch('/refills')
      .then(setRefills)
      .catch((err) => pushToast(err.message, 'error'));
  }, [pushToast]);

  useEffect(() => {
    clearPendingTarget(VIEW);
    let cancelled = false;
    load().finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [load]);

  const filtered = useMemo(
    () => refills.filter((r) => (filter === 'all' || r.status === filter) && inDateRange(r.created_at, from, to)),
    [refills, filter, from, to],
  );

  const handleMissing = useCallback(() => {
    setSelectedId(null);
    load();
    pushToast('That refill request is no longer available — the list has been refreshed.', 'info');
  }, [load, pushToast]);

  if (selectedId) {
    return (
      <div className="page-enter">
        <PageHeader title="Refill Request" subtitle="Request detail" />
        <RefillDetail refillId={selectedId} onBack={() => setSelectedId(null)} onChanged={load} onMissing={handleMissing} pushToast={pushToast} />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <PageHeader title="Refill Requests" subtitle={loading ? ' ' : `${filtered.length} total request${filtered.length === 1 ? '' : 's'}`} />

      <ListFilters statusOptions={FILTERS} status={filter} onStatus={setFilter} from={from} to={to} onFrom={setFrom} onTo={setTo} disabled={loading} />

      {loading ? (
        <div className="two-col">
          {[0, 1].map((i) => <Skeleton key={i} height={96} radius={16} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-body" style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>
            <div style={{ fontWeight: 700, color: 'var(--slate-700)', marginBottom: 4 }}>No refill requests</div>
            <div style={{ fontSize: 13 }}>Try a different filter.</div>
          </div>
        </div>
      ) : (
        <div className="two-col">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="panel"
              style={{ margin: 0, cursor: 'pointer' }}
              onClick={() => setSelectedId(item.id)}
            >
              <div className="panel-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate-900)' }}>{item.request_code} · {item.box.box_number}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>
                      {item.box.department} · {item.box.area} · assigned {formatDate(item.created_at)}
                    </div>
                  </div>
                  <StatusPill kind={item.status} />
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--slate-500)', marginTop: 10 }}>
                  {item.flagged_items.length > 0 ? item.flagged_items.join(', ') : 'No items flagged'}
                </div>
                <div className="btn-row" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className={`btn ${needsAction(item) ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '5px 12px' }}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }}
                  >
                    <IconEye size={14} /> {needsAction(item) ? 'View & Submit' : 'View'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import Panel from '../../components/Panel';
import PageHeader from '../../components/PageHeader';
import Skeleton from './Skeleton';
import StatusPill from './StatusPill';
import SignaturePad from './SignaturePad';
import {
  IconQrCode, IconClipboard, IconSearch, IconChevronLeft, IconChevronDown, IconCheckCircle,
  IconAlertTriangle, IconUser, IconFirstAid, IconLayers,
} from '../../components/icons';
import { useFastAidAuth, apiFetch } from './store';
import { CHECKLIST_ITEMS, formatDateTime } from './statusMeta';
import { readImageAsDataUrl } from './imageUtil';
import PhotoPreview from '../../components/PhotoPreview';

const valueStyle = { color: 'var(--slate-900)', fontWeight: 700 };

const OPTIONS = [
  { value: 'ok', label: 'OK', color: 'var(--green-600)' },
  { value: 'expired', label: 'Expired', color: 'var(--amber-600)' },
  { value: 'missing', label: 'Missing', color: 'var(--red-600)' },
];

function BackButton({ onClick, label = 'Back' }) {
  return (
    <button type="button" className="btn btn-ghost" style={{ padding: '4px 10px', marginBottom: 12 }} onClick={onClick}>
      <IconChevronLeft size={14} /> {label}
    </button>
  );
}

/* ---------- Step 1: scan or select (mobile ScanSelectScreen) ---------- */

function OptionCard({ primary, icon, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 220,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '32px 20px',
        borderRadius: 20,
        border: primary ? 'none' : '1px solid var(--slate-200)',
        background: primary ? 'var(--blue-600)' : '#fff',
        color: primary ? '#fff' : 'var(--blue-600)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
      }}
    >
      {icon}
      <span style={{ fontSize: 16, fontWeight: 800, marginTop: 4, color: primary ? '#fff' : 'var(--slate-900)' }}>{title}</span>
      <span style={{ fontSize: 12, color: primary ? 'var(--blue-100)' : 'var(--slate-500)' }}>{subtitle}</span>
    </button>
  );
}

function MenuStep({ onSelectManually, onBoxFound }) {
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [looking, setLooking] = useState(false);

  // The portal has no camera scanner, so "Scan QR Code" takes the code printed
  // on the box's QR label — the same lookup the mobile scanner does with the
  // scanned value.
  const lookup = async () => {
    const value = code.trim();
    if (!value) return;
    setLooking(true);
    setError(null);
    try {
      const list = await apiFetch(`/boxes?search=${encodeURIComponent(value)}`);
      const match = list.find((b) => b.box_number.toLowerCase() === value.toLowerCase());
      if (match) onBoxFound(match.id);
      else setError(`No first aid box found for code "${value}".`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLooking(false);
    }
  };

  return (
    <div>
      <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--slate-500)' }}>
        Scan the QR code on a first aid box, or select it manually.
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <OptionCard primary icon={<IconQrCode size={32} />} title="Scan QR Code" subtitle="Enter the code on the box label" onClick={() => setScanning(true)} />
        <OptionCard icon={<IconLayers size={32} />} title="Select Manually" subtitle="Browse by department" onClick={onSelectManually} />
      </div>

      {scanning ? (
        <div style={{ marginTop: 18 }}>
          <Panel title="Box QR Code" icon={<IconQrCode size={17} />}>
            <div className="field">
              <label>Code on the box label</label>
              <input
                value={code}
                placeholder="e.g. FAB-101"
                autoFocus
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') lookup(); }}
              />
            </div>
            {error ? <div style={{ fontSize: 13, color: 'var(--red-600)', marginTop: 10 }}>{error}</div> : null}
            <div className="btn-row" style={{ justifyContent: 'flex-start', marginTop: 14 }}>
              <button type="button" className="btn btn-outline" onClick={() => { setScanning(false); setError(null); }}>Cancel</button>
              <button type="button" className="btn btn-primary" disabled={!code.trim() || looking} onClick={lookup}>
                {looking ? 'Looking up…' : 'Find Box'}
              </button>
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}

function SelectStep({ onPick, onBack, pushToast }) {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiFetch('/boxes')
      .then((list) => { if (!cancelled) setBoxes(list); })
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pushToast]);

  const sections = useMemo(() => {
    const filtered = boxes.filter((b) => b.box_number.toLowerCase().includes(search.toLowerCase()));
    const byDept = new Map();
    filtered.forEach((b) => {
      const list = byDept.get(b.department) ?? [];
      list.push(b);
      byDept.set(b.department, list);
    });
    return Array.from(byDept.entries()).map(([title, data]) => ({ title, data }));
  }, [boxes, search]);

  return (
    <div>
      <BackButton onClick={onBack} />
      <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px' }}>Select First Aid Box</h3>

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <div className="field" style={{ marginBottom: 6 }}>
            <label><IconSearch size={13} /> Search</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search box number..." />
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={52} radius={12} />)}
            </div>
          ) : (
            <>
              {sections.map((section) => (
                <div key={section.title}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--slate-500)', margin: '18px 0 8px', letterSpacing: '0.04em' }}>
                    {section.title.toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {section.data.map((box) => (
                      <button
                        key={box.id}
                        type="button"
                        onClick={() => onPick(box.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textAlign: 'left',
                          padding: '12px 16px',
                          border: '1px solid var(--slate-200)',
                          borderRadius: 12,
                          background: '#fff',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        <span>
                          <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--slate-900)' }}>{box.box_number}</span>
                          <span style={{ display: 'block', fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{box.area} · {box.location}</span>
                        </span>
                        <span style={{ transform: 'rotate(-90deg)', color: 'var(--slate-400)', display: 'flex' }}><IconChevronDown size={16} /></span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!sections.length && (
                <p style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)', margin: 0 }}>No boxes found.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 2: box details (mobile BoxDetailsScreen) ---------- */

function DetailsStep({ boxId, onBack, onStart, pushToast }) {
  const auth = useFastAidAuth();
  const [box, setBox] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const [previousItems, setPreviousItems] = useState(null);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/boxes/${boxId}`)
      .then((b) => { if (!cancelled) setBox(b); })
      .catch((err) => pushToast(err.message, 'error'));
    return () => { cancelled = true; };
  }, [boxId, pushToast]);

  const togglePrevious = async () => {
    const next = !open;
    setOpen(next);
    if (!next || previousItems || !box?.last_inspection_at) return;
    setLoadingPrevious(true);
    try {
      const mine = await apiFetch('/inspections/mine');
      const last = mine.find((i) => i.box.id === boxId);
      if (last) {
        const full = await apiFetch(`/inspections/${last.id}`);
        setPreviousItems(full.items);
      } else {
        setPreviousItems([]);
      }
    } catch {
      setPreviousItems([]);
    } finally {
      setLoadingPrevious(false);
    }
  };

  if (!box) {
    return (
      <div>
        <BackButton onClick={onBack} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton height={150} radius={16} />
          <Skeleton height={90} radius={16} />
          <Skeleton height={52} radius={12} />
        </div>
      </div>
    );
  }

  const chip = { background: 'var(--blue-100)', color: 'var(--blue-700)', borderRadius: 999, padding: '4px 14px', fontSize: 12.5, fontWeight: 600 };

  return (
    <div>
      <BackButton onClick={onBack} />

      <Panel title={box.box_number} icon={<IconFirstAid size={17} />}>
        <div className="split-row"><span>Department</span><span style={valueStyle}>{box.department}</span></div>
        <div className="split-row"><span>Area</span><span style={valueStyle}>{box.area}</span></div>
        <div className="split-row" style={{ marginBottom: 0 }}><span>Location</span><span style={valueStyle}>{box.location}</span></div>
      </Panel>

      <Panel title="Last Inspection" icon={<IconClipboard size={17} />}>
        <div style={{ fontSize: 14, color: 'var(--slate-500)' }}>
          {box.last_inspection_at ? formatDateTime(box.last_inspection_at) : 'No previous inspection on record'}
        </div>
        {box.last_inspection_at ? (
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '6px 14px' }}
              onClick={togglePrevious}
            >
              View Previous Observations
              <span style={{ display: 'flex', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><IconChevronDown size={14} /></span>
            </button>
            {open ? (
              <div style={{ marginTop: 10 }}>
                {loadingPrevious || previousItems === null ? (
                  <Skeleton height={60} radius={10} />
                ) : previousItems.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--slate-500)' }}>No observations recorded.</div>
                ) : (
                  previousItems.map((item, idx) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderTop: idx === 0 ? 'none' : '1px solid var(--slate-100)', fontSize: 12.5 }}>
                      <span style={{ color: 'var(--slate-500)' }}>{item.item_name}</span>
                      <span style={{ fontWeight: 700, color: item.status === 'ok' ? 'var(--green-600)' : item.status === 'expired' ? 'var(--amber-600)' : 'var(--red-600)' }}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </Panel>

      <Panel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span style={chip}>Inspector: {auth.user?.name}</span>
          <span style={chip}>ID: {auth.user?.employee_id}</span>
          <span style={chip}>{now.toLocaleString()}</span>
        </div>
      </Panel>

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={() => onStart(box)}>Start Checklist</button>
      </div>
    </div>
  );
}

/* ---------- Step 3: checklist + signature (mobile ChecklistScreen) ---------- */

function ChecklistRow({ index, label, status, note, photoUrl, onStatusChange, onNoteChange, onPhoto }) {
  const flagged = status === 'expired' || status === 'missing';
  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--slate-200)' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            background: status ? 'var(--blue-100)' : 'var(--slate-50)',
            color: 'var(--blue-600)',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {index + 1}
        </span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--slate-900)' }}>{label}</span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {OPTIONS.map((option) => {
          const active = status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusChange(option.value)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: `1px solid ${active ? option.color : 'var(--slate-200)'}`,
                background: active ? option.color : 'var(--slate-50)',
                color: active ? '#fff' : 'var(--slate-500)',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {flagged ? (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="field">
            <input value={note} onChange={(e) => onNoteChange(e.target.value)} placeholder="Add a note (optional)" />
          </div>
          <label
            className="btn btn-outline"
            style={{ alignSelf: 'flex-start', padding: '5px 14px', cursor: 'pointer' }}
          >
            {photoUrl ? 'Retake Photo' : 'Add Photo (Optional)'}
            <input type="file" accept="image/*" capture="environment" hidden onChange={onPhoto} />
          </label>
          {photoUrl ? <PhotoPreview src={photoUrl} alt="Attached evidence" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function ChecklistStep({ box, onBack, onSubmitted, pushToast }) {
  const [statuses, setStatuses] = useState(() => Object.fromEntries(CHECKLIST_ITEMS.map((n) => [n, null])));
  const [notes, setNotes] = useState({});
  const [photos, setPhotos] = useState({});
  const [signature, setSignature] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const completed = Object.values(statuses).filter(Boolean).length;
  const canSubmit = completed === CHECKLIST_ITEMS.length && signature !== null;

  const handlePhoto = (name) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await readImageAsDataUrl(file);
      setPhotos((p) => ({ ...p, [name]: url }));
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const inspection = await apiFetch('/inspections', {
        method: 'POST',
        body: JSON.stringify({
          box_id: box.id,
          items: CHECKLIST_ITEMS.map((name) => ({
            item_name: name,
            status: statuses[name],
            note: notes[name] || undefined,
            photo_url: photos[name] || undefined,
          })),
          signature_data: signature,
        }),
      });
      if (inspection.outcome === 'refill_requested') {
        pushToast('Email + mobile notification sent to OHC Team', 'success');
      }
      onSubmitted(inspection);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <BackButton onClick={onBack} />

      <div className="panel" style={{ margin: '0 0 18px' }}>
        <div className="panel-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
            <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>Inspection Checklist · {box.box_number}</span>
            <span style={{ color: 'var(--slate-500)' }}>{completed} of {CHECKLIST_ITEMS.length} completed</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(completed / CHECKLIST_ITEMS.length) * 100}%` }} />
          </div>

          <div style={{ marginTop: 6 }}>
            {CHECKLIST_ITEMS.map((name, index) => (
              <ChecklistRow
                key={name}
                index={index}
                label={name}
                status={statuses[name]}
                note={notes[name] ?? ''}
                photoUrl={photos[name]}
                onStatusChange={(status) => setStatuses((s) => ({ ...s, [name]: status }))}
                onNoteChange={(note) => setNotes((n) => ({ ...n, [name]: note }))}
                onPhoto={handlePhoto(name)}
              />
            ))}
          </div>
        </div>
      </div>

      <Panel title="Digital Signature" icon={<IconUser size={17} />}>
        <SignaturePad onChange={setSignature} />
      </Panel>

      {error ? <div style={{ color: 'var(--red-600)', fontSize: 13.5, marginBottom: 10, textAlign: 'center' }}>{error}</div> : null}
      <div className="btn-row">
        <button type="button" className="btn btn-primary" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          {submitting ? 'Submitting…' : 'Submit Inspection'}
        </button>
      </div>
    </div>
  );
}

/* ---------- Step 4: result (mobile SubmitSuccess / RefillRequestCreated) ---------- */

function ResultStep({ inspection, onDone }) {
  const refilled = inspection.outcome === 'refill_requested';
  const flagged = inspection.items.filter((i) => i.status !== 'ok');

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', marginBottom: 22 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: refilled ? 'var(--amber-100)' : 'var(--green-600)',
            color: refilled ? 'var(--amber-600)' : '#fff',
            animation: 'scaleIn 0.5s var(--ease-spring) both',
          }}
        >
          {refilled ? <IconAlertTriangle size={32} /> : <IconCheckCircle size={38} />}
        </div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--slate-900)' }}>
          {refilled ? 'Refill Request Created' : 'Inspection Submitted Successfully'}
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--slate-500)' }}>
          {refilled
            ? `${flagged.length} item${flagged.length === 1 ? '' : 's'} flagged and sent to the OHC team.`
            : 'All 12 checklist items were verified OK. No further action is needed.'}
        </p>
      </div>

      {refilled ? (
        <>
          <Panel title="Flagged Items" icon={<IconClipboard size={17} />}>
            {flagged.map((item, idx) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: idx === 0 ? 'none' : '1px solid var(--slate-100)' }}>
                <span style={{ fontSize: 14, color: 'var(--slate-900)' }}>{item.item_name}</span>
                <StatusPill kind={item.status} />
              </div>
            ))}
          </Panel>

          {inspection.refill_request ? (
            <div className="panel" style={{ background: 'var(--blue-100)', borderColor: 'var(--blue-600)' }}>
              <div className="panel-body">
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--blue-700)', marginBottom: 10 }}>Assigned to OHC Department</div>
                <div className="split-row"><span>Request ID</span><span style={valueStyle}>{inspection.refill_request.request_code}</span></div>
                <div className="split-row" style={{ marginBottom: 0 }}><span>Status</span><span style={valueStyle}>Pending Review</span></div>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <Panel>
          <div className="split-row"><span>Box Number</span><span style={valueStyle}>{inspection.box.box_number}</span></div>
          <div className="split-row"><span>Department</span><span style={valueStyle}>{inspection.box.department}</span></div>
          <div className="split-row" style={{ marginBottom: 0 }}><span>Submitted</span><span style={valueStyle}>{formatDateTime(inspection.created_at)}</span></div>
        </Panel>
      )}

      <div className="btn-row">
        <button type="button" className="btn btn-primary" style={{ minWidth: 200 }} onClick={onDone}>
          {refilled ? 'Done' : 'Back to Home'}
        </button>
      </div>
    </div>
  );
}

/* ---------- Wizard ---------- */

const SUBTITLES = {
  menu: 'Pick a first aid box to inspect',
  select: 'Choose a box by department',
  details: 'Review the box before you begin',
  checklist: 'Answer every item, then sign to submit',
  result: 'Inspection complete',
};

export default function StartInspectionPage({ onNavigate, pushToast }) {
  const [step, setStep] = useState('menu');
  const [boxId, setBoxId] = useState(null);
  const [cameFrom, setCameFrom] = useState('menu');
  const [box, setBox] = useState(null);
  const [result, setResult] = useState(null);

  const openDetails = (id, from) => {
    setBoxId(id);
    setCameFrom(from);
    setStep('details');
  };

  return (
    <div className="page-enter">
      <PageHeader title="Start Inspection" subtitle={SUBTITLES[step]} />

      {step === 'menu' ? (
        <MenuStep onSelectManually={() => setStep('select')} onBoxFound={(id) => openDetails(id, 'menu')} />
      ) : null}

      {step === 'select' ? (
        <SelectStep onBack={() => setStep('menu')} onPick={(id) => openDetails(id, 'select')} pushToast={pushToast} />
      ) : null}

      {step === 'details' ? (
        <DetailsStep
          boxId={boxId}
          onBack={() => setStep(cameFrom)}
          onStart={(b) => { setBox(b); setStep('checklist'); }}
          pushToast={pushToast}
        />
      ) : null}

      {step === 'checklist' && box ? (
        <ChecklistStep
          box={box}
          onBack={() => setStep('details')}
          onSubmitted={(inspection) => { setResult(inspection); setStep('result'); }}
          pushToast={pushToast}
        />
      ) : null}

      {step === 'result' && result ? (
        <ResultStep
          inspection={result}
          onDone={() => onNavigate('fa-ai-home')}
        />
      ) : null}
    </div>
  );
}

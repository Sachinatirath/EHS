import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconClose, IconEye } from './icons';

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    // Capture phase + stopImmediatePropagation so Esc closes only this popup, not a parent modal.
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return createPortal(
    <div
      className="modal-overlay"
      style={{ zIndex: 400, background: 'rgba(15, 23, 42, 0.82)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ position: 'relative', maxWidth: '92vw', maxHeight: '90vh' }}>
        <button
          type="button"
          className="icon-btn"
          onClick={onClose}
          aria-label="Close image"
          style={{ position: 'absolute', top: -14, right: -14, background: '#fff', zIndex: 1 }}
        >
          <IconClose size={15} />
        </button>
        <img
          src={src}
          alt={alt}
          style={{ display: 'block', maxWidth: '92vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12, background: '#fff', boxShadow: '0 24px 60px rgba(0,0,0,0.45)' }}
        />
      </div>
    </div>,
    document.body,
  );
}

/** Thumbnail that opens the full-size image in a popup when clicked. */
export default function PhotoPreview({ src, alt = 'Photo', style }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;

  const show = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <span style={{ position: 'relative', display: style?.width === '100%' ? 'block' : 'inline-block', lineHeight: 0 }}>
        <img
          src={src}
          alt={alt}
          title="Click to view full image"
          onClick={show}
          style={{ cursor: 'zoom-in', ...style }}
        />
        <button
          type="button"
          className="btn btn-outline"
          onClick={show}
          style={{ position: 'absolute', right: 6, bottom: 6, padding: '3px 9px', fontSize: 11.5, background: '#fff', lineHeight: 1.2 }}
        >
          <IconEye size={12} /> View
        </button>
      </span>
      {open ? <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/** Compact "View photo" button (for table rows) that opens the image in the popup. */
export function PhotoButton({ src, alt = 'Photo', label = 'Photo' }) {
  const [open, setOpen] = useState(false);
  if (!src) return <span style={{ color: 'var(--slate-400)' }}>—</span>;
  return (
    <>
      <button
        type="button"
        className="btn btn-outline"
        style={{ padding: '5px 10px' }}
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
      >
        <IconEye size={14} /> {label}
      </button>
      {open ? <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

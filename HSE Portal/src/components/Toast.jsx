import { IconCheckCircle, IconInfo, IconClose } from './icons';

export default function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || 'info'}${t.leaving ? ' leaving' : ''}`}>
          <span className="toast-icon">
            {t.type === 'success' ? <IconCheckCircle size={18} /> : <IconInfo size={18} />}
          </span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.75, cursor: 'pointer', display: 'flex' }}
          >
            <IconClose />
          </button>
        </div>
      ))}
    </div>
  );
}

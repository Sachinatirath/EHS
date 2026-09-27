import { useEffect, useState } from 'react';
import { setFocusTarget } from '../../utils/focusTarget';
import PageHeader from '../../components/PageHeader';
import Skeleton from './Skeleton';
import { IconBell } from '../../components/icons';
import { apiFetch } from './store';
import { formatDate } from './statusMeta';

// Clicking an alert marks it read and opens its record in `targetView`,
// where the row is highlighted and its details open.
export default function NotificationsPage({ targetView, onNavigate, pushToast }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/notifications')
      .then((list) => { if (!cancelled) setNotifications(list); })
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pushToast]);

  const markRead = async (id) => {
    try {
      const updated = await apiFetch(`/notifications/${id}/read`, { method: 'POST' });
      setNotifications((list) => list.map((n) => (n.id === id ? updated : n)));
    } catch (err) {
      pushToast(err.message, 'error');
    }
  };

  return (
    <div className="page-enter">
      <PageHeader title="Alerts" subtitle={`${notifications.filter((n) => !n.is_read).length} unread`} />

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <Skeleton width={16} height={16} radius={8} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Skeleton height={14} width="70%" />
                    <Skeleton height={11} width="30%" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="finding-item"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, opacity: n.is_read ? 0.6 : 1, cursor: 'pointer' }}
                  onClick={() => {
                    if (!n.is_read) markRead(n.id);
                    if (n.violation_id && targetView && onNavigate) {
                      setFocusTarget(targetView, n.violation_id);
                      onNavigate(targetView);
                    }
                  }}
                >
                  <span style={{ color: 'var(--sv-primary)', flexShrink: 0, marginTop: 2 }}><IconBell size={16} /></span>
                  <div style={{ flex: 1 }}>
                    <div className="finding-title" style={{ fontWeight: n.is_read ? 500 : 700 }}>{n.message}</div>
                    <div className="finding-meta">{formatDate(n.created_at)}</div>
                  </div>
                  {!n.is_read ? <span className="pill pill-red">New</span> : null}
                </div>
              ))}
              {!notifications.length && (
                <p style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>No notifications yet.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

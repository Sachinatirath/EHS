import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Skeleton from './Skeleton';
import { IconBell, IconCheckCircle } from '../../components/icons';
import { apiFetch, setPendingTarget } from './store';
import { timeAgo } from './statusMeta';

// Same behaviour as the mobile NotificationsListScreen: tapping a row marks it
// read and (if it references a refill request) opens that request — the
// re-verification view for an Area Incharge, the refill detail for OHC.
export default function NotificationsPage({ role, onNavigate, pushToast }) {
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

  const unread = notifications.filter((n) => !n.is_read);

  const markRead = (id) => {
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    return apiFetch(`/notifications/${id}/read`, { method: 'POST' }).catch((err) => pushToast(err.message, 'error'));
  };

  const open = (n) => {
    if (!n.is_read) markRead(n.id);
    if (n.refill_request_id) {
      const target = role === 'ohc' ? 'fa-ohc-refills' : 'fa-ai-inspections';
      setPendingTarget(target, { refillId: n.refill_request_id });
      onNavigate(target);
    }
  };

  const markAllRead = () => {
    unread.forEach((n) => markRead(n.id));
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Notifications"
        subtitle={`${unread.length} unread`}
        actions={unread.length > 0 ? (
          <button type="button" className="btn btn-outline" style={{ padding: '6px 14px' }} onClick={markAllRead}>
            <IconCheckCircle size={14} /> Mark all read
          </button>
        ) : null}
      />

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
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', background: n.is_read ? undefined : 'var(--blue-50)' }}
                  onClick={() => open(n)}
                >
                  <span style={{ color: 'var(--blue-600)', flexShrink: 0, marginTop: 2 }}><IconBell size={16} /></span>
                  <div style={{ flex: 1 }}>
                    <div className="finding-title" style={{ fontWeight: n.is_read ? 500 : 700 }}>{n.message}</div>
                    <div className="finding-meta">{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.is_read ? <span className="pill pill-teal">New</span> : null}
                </div>
              ))}
              {!notifications.length && (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--slate-500)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--slate-700)', marginBottom: 4 }}>You&apos;re all caught up</div>
                  <div style={{ fontSize: 13 }}>New refill assignments and updates will appear here.</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

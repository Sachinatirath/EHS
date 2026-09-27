import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Skeleton from './Skeleton';
import StatusPill from './StatusPill';
import { IconFirstAid, IconCheckCircle, IconClock, IconEye, IconQrCode } from '../../components/icons';
import { useFastAidAuth, apiFetch, setPendingTarget } from './store';
import { formatDateTime } from './statusMeta';

export default function AreaInchargeHomePage({ onNavigate, pushToast }) {
  const auth = useFastAidAuth();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiFetch('/dashboard/my-summary'), apiFetch('/inspections/mine')])
      .then(([s, list]) => {
        if (cancelled) return;
        setSummary(s);
        setRecent(list.slice(0, 5));
      })
      .catch((err) => pushToast(err.message, 'error'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pushToast]);

  const firstName = auth.user?.name?.split(' ')[0] ?? 'there';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const openInspection = (id) => {
    setPendingTarget('fa-ai-inspections', { inspectionId: id });
    onNavigate('fa-ai-inspections');
  };

  return (
    <div className="page-enter">
      <PageHeader title={`Good day, ${firstName}`} subtitle={today} />

      <button
        type="button"
        onClick={() => onNavigate('fa-ai-inspect')}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '22px 26px',
          marginBottom: 22,
          border: 'none',
          borderRadius: 20,
          background: 'var(--blue-600)',
          color: '#fff',
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: 'var(--shadow-md, 0 8px 20px rgba(15,118,110,0.25))',
        }}
      >
        <span>
          <span style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>Start Inspection</span>
          <span style={{ display: 'block', fontSize: 13.5, marginTop: 4, color: 'var(--blue-100)' }}>Scan a QR code or select a box to begin</span>
        </span>
        <span style={{ width: 52, height: 52, borderRadius: 26, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IconQrCode size={26} />
        </span>
      </button>

      {loading || !summary ? (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} height={100} radius={16} />)}
        </div>
      ) : (
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          <StatCard value={summary.boxes_assigned} label="Boxes Assigned" variant="teal" icon={<IconFirstAid size={18} />} delay={0} />
          <StatCard value={summary.inspected_this_month} label="Inspected This Month" variant="green" icon={<IconCheckCircle size={18} />} delay={40} />
          <StatCard value={summary.pending_actions} label="Pending Actions" variant="amber" icon={<IconClock size={18} />} delay={80} />
        </div>
      )}

      <div className="panel" style={{ margin: 0 }}>
        <div className="panel-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Recent Inspections</h3>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0, 1].map((i) => <Skeleton key={i} height={44} radius={10} />)}
            </div>
          ) : recent.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 24, color: 'var(--slate-500)', margin: 0 }}>
              No inspections yet. Start your first inspection above.
            </p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Box</th><th>Date</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {recent.map((item) => (
                    <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => openInspection(item.id)}>
                      <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{item.box.box_number}</td>
                      <td>{formatDateTime(item.created_at)}</td>
                      <td><StatusPill kind={item.outcome === 'refill_requested' ? 'pending' : 'ok'} /></td>
                      <td>
                        <button
                          type="button"
                          className={`btn ${item.refill_request?.status === 'awaiting_verification' ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '5px 12px' }}
                          onClick={(e) => { e.stopPropagation(); openInspection(item.id); }}
                        >
                          <IconEye size={14} /> {item.refill_request?.status === 'awaiting_verification' ? 'View & Review' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

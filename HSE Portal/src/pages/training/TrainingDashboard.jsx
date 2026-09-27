import { useMemo, useState } from 'react';
import CreateTrainingSessionModal from './CreateTrainingSessionModal';
import { BarChart, PieChart } from './DashboardCharts';
import {
  IconUsers, IconCheckCircle, IconClock, IconAward, IconBell, IconPlus, IconRepeat,
  IconLayers, IconPercent, IconShieldCheck,
} from '../../components/icons';
import { DEPARTMENTS, EMPLOYEES, CERTIFICATES, HOD_TRAINING_APPROVALS } from '../../data/trainingData';
import './trainingDashboard.css';

const TRAINING_STATUS_COLORS = {
  Compliant: '#10b981',
  'Training Due': '#f59e0b',
  Expired: '#ef4444',
  'Action Required': '#6366f1',
};

const CERT_STATUS_COLORS = {
  Valid: '#10b981',
  'Expiring Soon': '#f97316',
  'Renewal Pending': '#6366f1',
  Expired: '#dc2626',
};

const countBy = (list, key) => list.reduce((acc, item) => {
  acc[item[key]] = (acc[item[key]] || 0) + 1;
  return acc;
}, {});

function KpiCard({ label, value, icon, tone, highlight }) {
  return (
    <div className={`trd-kpi trd-kpi-${tone}${highlight ? ' trd-kpi-highlight' : ''}`}>
      <div>
        <div className="trd-kpi-label">{label}</div>
        <div className="trd-kpi-value">{value}</div>
      </div>
      <span className="trd-kpi-icon">{icon}</span>
    </div>
  );
}

function ChartCard({ title, icon, tone, children }) {
  return (
    <div className="trd-card">
      <h3 className={`trd-card-title trd-tone-${tone}`}>{icon}{title}</h3>
      {children}
    </div>
  );
}

export default function TrainingDashboard({ pushToast, onNavigate }) {
  const [modalOpen, setModalOpen] = useState(false);

  const stats = useMemo(() => {
    const byStatus = countBy(EMPLOYEES, 'status');
    const byDept = countBy(EMPLOYEES, 'department');
    const byCert = countBy(CERTIFICATES, 'status');
    return {
      total: EMPLOYEES.length,
      compliant: byStatus.Compliant || 0,
      due: (byStatus['Training Due'] || 0) + (byStatus['Action Required'] || 0),
      certsAtRisk: CERTIFICATES.filter((c) => c.status !== 'Valid').length,
      hodPending: HOD_TRAINING_APPROVALS.filter((a) => a.status !== 'Approved').length,
      deptData: DEPARTMENTS.map((d) => ({ label: d, value: byDept[d] || 0 })),
      statusSlices: Object.entries(TRAINING_STATUS_COLORS).map(([label, color]) => ({ label, color, value: byStatus[label] || 0 })),
      certSlices: Object.entries(CERT_STATUS_COLORS).map(([label, color]) => ({ label, color, value: byCert[label] || 0 })),
    };
  }, []);

  const handleSave = (session) => {
    setModalOpen(false);
    pushToast(`${session.id} (${session.topic}) saved with ${session.participants.length} participant(s).`, 'success');
    onNavigate('tr-sessions');
  };

  return (
    <div className="page-enter trd">
      <div className="trd-header">
        <div>
          <h1 className="trd-title">Dashboard Overview</h1>
          <p className="trd-subtitle">Real-time training compliance, certificates, sessions and HOD approvals</p>
        </div>
        <div className="trd-actions">
          <button type="button" className="trd-btn trd-btn-ghost" onClick={() => pushToast('Sample data reloaded.', 'info')}>
            <IconRepeat size={14} /> Reload Sample Data
          </button>
          <button type="button" className="trd-btn trd-btn-outline" onClick={() => setModalOpen(true)}>
            <IconPlus size={14} /> New Training Session
          </button>
        </div>
      </div>

      <div className="trd-kpis">
        <KpiCard label="Total Employees" value={stats.total} tone="blue" icon={<IconUsers size={18} />} />
        <KpiCard label="Fully Compliant" value={stats.compliant} tone="green" icon={<IconCheckCircle size={18} />} />
        <KpiCard label="Training Due" value={stats.due} tone="amber" icon={<IconClock size={18} />} />
        <KpiCard label="Certificates At Risk" value={stats.certsAtRisk} tone="indigo" icon={<IconAward size={18} />} />
        <KpiCard label="HOD Pending Approvals" value={stats.hodPending} tone="red" highlight icon={<IconBell size={18} />} />
      </div>

      <div className="trd-charts">
        <ChartCard title="Department-wise Employees" tone="blue" icon={<IconLayers size={14} />}>
          <BarChart data={stats.deptData} />
        </ChartCard>
        <ChartCard title="Training Status Breakdown" tone="red" icon={<IconPercent size={14} />}>
          <PieChart slices={stats.statusSlices} />
        </ChartCard>
        <ChartCard title="Certificate Status" tone="green" icon={<IconShieldCheck size={14} />}>
          <PieChart slices={stats.certSlices} donut />
        </ChartCard>
      </div>

      <CreateTrainingSessionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}

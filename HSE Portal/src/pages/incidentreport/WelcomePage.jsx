import { IconAlertTriangle } from '../../components/icons';

export default function WelcomePage() {
  return (
    <div className="page-enter placeholder-wrap" style={{ padding: '90px 20px' }}>
      <div className="ph-icon" style={{ background: 'var(--ir-primary-light)', color: 'var(--ir-primary)' }}>
        <IconAlertTriangle size={32} />
      </div>
      <h3>Incident Report</h3>
      <p>Digital Safety Incident Reporting System</p>
      <p style={{ marginTop: -8 }}>Pick &ldquo;Agent UI&rdquo; or &ldquo;HOD Dashboard&rdquo; from the panel on the left to get started.</p>
    </div>
  );
}

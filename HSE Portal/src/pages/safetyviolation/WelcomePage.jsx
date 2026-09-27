import { IconAlertTriangle } from '../../components/icons';

export default function WelcomePage() {
  return (
    <div className="page-enter placeholder-wrap" style={{ padding: '90px 20px' }}>
      <div className="ph-icon" style={{ background: 'var(--red-100)', color: 'var(--red-600)' }}>
        <IconAlertTriangle size={32} />
      </div>
      <h3>Safety Violation</h3>
      <p>Digital Safety Violation Reporting System</p>
      <p style={{ marginTop: -8 }}>Pick &ldquo;Agent UI&rdquo; or &ldquo;HOD Dashboard&rdquo; from the panel on the left to get started.</p>
    </div>
  );
}

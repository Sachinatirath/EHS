import { IconEye } from '../../components/icons';

export default function WelcomePage() {
  return (
    <div className="page-enter placeholder-wrap" style={{ padding: '90px 20px' }}>
      <div className="ph-icon" style={{ background: 'var(--so-primary-light)', color: 'var(--so-primary)' }}>
        <IconEye size={32} />
      </div>
      <h3>Safety Observation</h3>
      <p>Digital Safety Observation Reporting System</p>
      <p style={{ marginTop: -8 }}>Pick &ldquo;Agent UI&rdquo; or &ldquo;HOD Dashboard&rdquo; from the panel on the left to get started.</p>
    </div>
  );
}

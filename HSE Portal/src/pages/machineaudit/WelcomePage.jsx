import { IconTool } from '../../components/icons';

export default function WelcomePage() {
  return (
    <div className="page-enter placeholder-wrap" style={{ padding: '90px 20px' }}>
      <div className="ph-icon" style={{ background: 'var(--ma-primary-light)', color: 'var(--ma-primary)' }}>
        <IconTool size={32} />
      </div>
      <h3>Machine Audit</h3>
      <p>Machine safety audit with In-charge sign-off</p>
      <p style={{ marginTop: -8 }}>Pick &ldquo;Safety Officer&rdquo;, &ldquo;In-charge&rdquo; or &ldquo;HOD&rdquo; from the panel on the left to get started.</p>
    </div>
  );
}

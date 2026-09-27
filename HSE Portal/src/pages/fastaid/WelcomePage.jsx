import { IconFirstAid } from '../../components/icons';

export default function WelcomePage() {
  return (
    <div className="page-enter placeholder-wrap" style={{ padding: '90px 20px' }}>
      <div className="ph-icon">
        <IconFirstAid size={32} />
      </div>
      <h3>FastAid</h3>
      <p>Digital First Aid Box Inspection System</p>
      <p style={{ marginTop: -8 }}>Pick &ldquo;Area Incharge&rdquo; or &ldquo;OHC Dashboard&rdquo; from the panel on the left to get started.</p>
    </div>
  );
}

import { IconShieldCheck, IconHardHat } from './icons';

// Bottom-of-app banner: a fixed "Today's Safety Message" badge on the left and
// the message itself scrolling right → left. Hover pauses the scroll.
export default function SafetyTicker() {
  return (
    <div className="safety-ticker" role="marquee" aria-label="Today's safety message: Our aim — zero accident">
      <div className="safety-ticker-badge">
        <span className="safety-ticker-icon"><IconShieldCheck size={16} /></span>
        <span className="safety-ticker-label">Today&apos;s Safety Message</span>
      </div>
      <div className="safety-ticker-viewport" aria-hidden="true">
        <div className="safety-ticker-track">
          <IconHardHat size={18} className="safety-ticker-hat" />
          <span className="safety-ticker-text">
            Our Aim <span className="safety-ticker-dash">—</span> <strong>Zero Accident</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

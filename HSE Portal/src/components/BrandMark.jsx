import helmet from '../assets/brand/helmet.png';

/** SafeNexG logo helmet + wordmark in the logo's colours: blue "SafeNex", green "G", "innovation" tagline. */
export default function BrandMark({ tone = 'dark', compact = false }) {
  return (
    <span className={`brand-mark brand-mark-${tone}`}>
      <span className="brand-mark-icon"><img src={helmet} alt="" width={compact ? 24 : 30} height={compact ? 24 : 30} /></span>
      <span className="brand-mark-text">
        <span className="brand-mark-name">SafeNex<span className="brand-mark-g">G</span></span>
        {!compact ? <span className="brand-mark-tag">innovation</span> : null}
      </span>
    </span>
  );
}

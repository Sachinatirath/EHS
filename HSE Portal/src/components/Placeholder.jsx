import { IconLayers } from './icons';

export default function Placeholder({ title }) {
  return (
    <div className="panel">
      <div className="placeholder-wrap">
        <div className="ph-icon">
          <IconLayers size={32} />
        </div>
        <h3>{title}</h3>
        <p>
          This module is coming up next. Send over the reference screens for
          &ldquo;{title}&rdquo; and it&rsquo;ll be wired into the portal with the same
          look, feel and animations as the rest of the app.
        </p>
      </div>
    </div>
  );
}

import { STATUS_META } from './statusMeta';

export default function StatusPill({ kind }) {
  const meta = STATUS_META[kind];
  return <span className={`pill ${meta.pill}`}>{meta.label}</span>;
}

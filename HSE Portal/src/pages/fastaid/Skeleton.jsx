// Loading placeholder — uses the portal's global `shimmer` keyframes, so it
// needs no extra stylesheet.
export default function Skeleton({ width = '100%', height = 16, radius = 8, style }) {
  return (
    <span
      style={{
        display: 'block',
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, var(--slate-100) 25%, var(--slate-200) 37%, var(--slate-100) 63%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

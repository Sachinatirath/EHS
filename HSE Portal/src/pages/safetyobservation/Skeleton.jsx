export default function Skeleton({ width = '100%', height = 16, radius = 8, style }) {
  return (
    <span
      className="so-skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

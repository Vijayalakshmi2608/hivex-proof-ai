export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-3 animate-pulse">
      <div className="h-3 w-1/3 bg-muted rounded" />
      <div className="h-6 w-2/3 bg-muted rounded" />
      <div className="h-3 w-full bg-muted rounded" />
      <div className="h-3 w-5/6 bg-muted rounded" />
    </div>
  );
}

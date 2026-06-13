interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={`skeleton ${className ?? ""}`} />;
}

interface SkeletonCardGridProps {
  count: number;
  columns: string;
}

export function SkeletonCardGrid({ count, columns }: SkeletonCardGridProps) {
  return (
    <ul className={`grid grid-cols-1 gap-5 ${columns}`}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <Skeleton className="h-52 w-full" />
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <Skeleton className="mt-1 h-6 w-1/3 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}

interface SkeletonRowListProps {
  count: number;
}

export function SkeletonRowList({ count }: SkeletonRowListProps) {
  return (
    <ul className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </li>
      ))}
    </ul>
  );
}

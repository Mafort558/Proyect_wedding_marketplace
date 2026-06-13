import { Skeleton, SkeletonRowList } from "@/app/skeleton";

const PLACEHOLDER_COUNT = 3;

export default function PanelLoading() {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-56 rounded-lg" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-48 rounded" />
        <SkeletonRowList count={PLACEHOLDER_COUNT} />
      </div>
    </section>
  );
}

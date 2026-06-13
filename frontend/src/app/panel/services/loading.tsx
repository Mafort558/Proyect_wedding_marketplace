import { Skeleton, SkeletonRowList } from "@/app/skeleton";

const PLACEHOLDER_COUNT = 3;

export default function PanelServicesLoading() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <SkeletonRowList count={PLACEHOLDER_COUNT} />
    </section>
  );
}

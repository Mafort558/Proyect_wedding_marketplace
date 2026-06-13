import { Skeleton, SkeletonRowList } from "@/app/skeleton";

const PLACEHOLDER_COUNT = 4;

export default function BookingsLoading() {
  return (
    <section className="flex flex-col gap-6">
      <Skeleton className="h-10 w-56 rounded-lg" />
      <SkeletonRowList count={PLACEHOLDER_COUNT} />
    </section>
  );
}

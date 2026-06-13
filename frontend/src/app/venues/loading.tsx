import { Skeleton, SkeletonCardGrid } from "@/app/skeleton";

const PLACEHOLDER_COUNT = 6;

export default function VenuesLoading() {
  return (
    <section className="flex flex-col gap-6">
      <Skeleton className="h-10 w-48 rounded-lg" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <SkeletonCardGrid count={PLACEHOLDER_COUNT} columns="sm:grid-cols-2" />
    </section>
  );
}

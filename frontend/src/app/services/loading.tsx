import { Skeleton, SkeletonCardGrid } from "@/app/skeleton";

const PLACEHOLDER_COUNT = 6;

export default function ServicesLoading() {
  return (
    <section className="flex flex-col gap-6">
      <Skeleton className="h-10 w-48 rounded-lg" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <SkeletonCardGrid count={PLACEHOLDER_COUNT} columns="sm:grid-cols-2 lg:grid-cols-3" />
    </section>
  );
}

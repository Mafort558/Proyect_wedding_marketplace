import { Skeleton } from "@/app/skeleton";

const PHOTO_COUNT = 3;

export default function VenueDetailLoading() {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-12 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: PHOTO_COUNT }, (_, index) => (
          <li key={index} className="overflow-hidden rounded-2xl shadow-sm">
            <Skeleton className="h-52 w-full" />
          </li>
        ))}
      </ul>
      <Skeleton className="h-16 w-full max-w-2xl rounded" />
      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-28 flex-1 rounded-2xl" />
        <Skeleton className="h-28 flex-1 rounded-2xl" />
      </div>
    </section>
  );
}

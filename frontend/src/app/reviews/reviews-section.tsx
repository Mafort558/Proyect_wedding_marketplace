import { ReviewForm } from "@/app/reviews/review-form";
import { ReviewStars } from "@/app/reviews/review-stars";
import { apiFetch } from "@/lib/api";
import type { ReviewList } from "@/lib/types";

interface ReviewsSectionProps {
  venueId?: number;
  serviceId?: number;
  isAuthenticated: boolean;
  revalidatePath: string;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" });

function formatDate(value: string): string {
  return DATE_FORMATTER.format(new Date(value));
}

export async function ReviewsSection({ venueId, serviceId, isAuthenticated, revalidatePath }: ReviewsSectionProps) {
  const target = venueId !== undefined ? { venue_id: String(venueId) } : { service_id: String(serviceId) };
  const reviews = await apiFetch<ReviewList>("/api/reviews", { searchParams: target });
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-strong">Reseñas</h2>
        {reviews.average !== null && (
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm">
            <ReviewStars rating={reviews.average} />
            <span className="font-medium text-strong">{reviews.average.toFixed(1)}</span>
            <span className="text-muted">
              ({reviews.total} {reviews.total === 1 ? "reseña" : "reseñas"})
            </span>
          </span>
        )}
      </div>
      {isAuthenticated && <ReviewForm venueId={venueId} serviceId={serviceId} revalidatePath={revalidatePath} />}
      {reviews.items.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay reseñas. Si lo reservaste, ¡sé el primero en opinar!</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.items.map((review) => (
            <li key={review.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-strong">{review.author_name}</p>
                <ReviewStars rating={review.rating} />
              </div>
              <p className="mt-1 text-xs text-muted">{formatDate(review.created_at)}</p>
              {review.comment !== "" && <p className="mt-2 leading-relaxed text-body">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

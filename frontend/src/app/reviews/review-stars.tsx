interface ReviewStarsProps {
  rating: number;
  className?: string;
}

const STAR_POSITIONS = [1, 2, 3, 4, 5];

export function ReviewStars({ rating, className }: ReviewStarsProps) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className ?? ""}`} aria-label={`${rating} de 5`}>
      {STAR_POSITIONS.map((position) => (
        <svg
          key={position}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${position <= Math.round(rating) ? "text-gold" : "text-border"}`}
          fill="currentColor"
          aria-hidden
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.77l-5.2 2.73.99-5.79L1.58 7.62l5.82-.85L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

import type { SourceRating } from "@/lib/testimonials/ratings";
import "@/styles/source-ratings.css";

type Props = {
  rating: SourceRating | null | undefined;
  accentColor?: string;
  className?: string;
};

export function SourceRatingBadge({ rating, accentColor = "#FBBF24", className = "" }: Props) {
  if (!rating || rating.count < 1) return null;

  const label = rating.count === 1 ? "1 review" : `${rating.count} reviews`;

  return (
    <span
      className={`source-rating-badge${className ? ` ${className}` : ""}`}
      style={{ color: accentColor }}
      title={`${rating.average} out of 5 from ${label}`}
    >
      ★ {rating.average.toFixed(1)} · {label}
    </span>
  );
}

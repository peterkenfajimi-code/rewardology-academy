export type TestimonialSourceType = "course" | "quiz" | "comic";

export type TestimonialStatus = "pending" | "approved" | "rejected";

export type TestimonialRow = {
  id: string;
  user_id: string;
  source_type: TestimonialSourceType;
  source_id: string;
  source_label: string;
  rating: number;
  quote: string | null;
  display_name: string;
  role_title: string | null;
  location: string | null;
  consent: boolean;
  status: TestimonialStatus;
  created_at: string;
  reviewed_at: string | null;
};

export type PublicTestimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  sourceLabel: string;
};

export type SubmitTestimonialPayload = {
  sourceType: TestimonialSourceType;
  sourceId: string;
  sourceLabel: string;
  rating: number;
  quote?: string;
  displayName: string;
  roleTitle?: string;
  location?: string;
  consent: boolean;
};

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function rowToPublic(row: TestimonialRow): PublicTestimonial | null {
  const quote = row.quote?.trim();
  if (!quote || quote.length < 20) return null;
  const role = row.role_title?.trim() || "HR Professional";
  const location = row.location?.trim() || "";
  return {
    id: row.id,
    quote,
    name: row.display_name.trim(),
    role,
    location,
    avatar: initialsFromName(row.display_name),
    rating: row.rating,
    sourceLabel: row.source_label,
  };
}

export function starsForRating(rating: number): string {
  const n = Math.max(1, Math.min(5, Math.round(rating)));
  return "★".repeat(n);
}

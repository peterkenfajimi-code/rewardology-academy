/** URL-safe slug from company name + country code (avoids cross-market collisions). */
export function companySlug(name: string, country: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base}-${country.toLowerCase()}`;
}

export function resolveCompanySlug(
  storedSlug: string | null | undefined,
  name: string,
  country: string
): string {
  return storedSlug?.trim() || companySlug(name, country);
}

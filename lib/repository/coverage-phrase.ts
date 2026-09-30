export function marketCountPhrase(count: number): string {
  return `${count} African ${count === 1 ? "market" : "markets"}`;
}

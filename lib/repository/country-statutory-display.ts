export function formatStatutoryEmployerPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return "No statutory minimum";
  return `${value}% employer contribution`;
}

export function formatStatutoryEmployeePct(value: number | null | undefined): string {
  if (value === null || value === undefined) return "No statutory employee rate on file";
  return `${value}% employee contribution`;
}

export const MARKET_OPTIONS = [
  { code: "NG", label: "Nigeria" },
  { code: "GH", label: "Ghana" },
  { code: "KE", label: "Kenya" },
  { code: "ZA", label: "South Africa" },
  { code: "EG", label: "Egypt" },
  { code: "RW", label: "Rwanda" },
] as const;

export function marketLabel(code: string): string {
  return MARKET_OPTIONS.find((m) => m.code === code)?.label ?? code;
}

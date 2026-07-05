import { getPublicSiteUrl } from "@/lib/site";

export function certificateVerifyPath(id: string): string {
  return `/verify/${encodeURIComponent(id.toUpperCase())}`;
}

export function certificateVerifyUrl(id: string): string {
  return `${getPublicSiteUrl()}${certificateVerifyPath(id)}`;
}

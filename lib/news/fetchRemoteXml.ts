const ALLORIGINS_RAW = "https://api.allorigins.win/raw?url=";

const DEFAULT_HEADERS = {
  Accept: "application/rss+xml, application/xml, text/xml, text/html, */*",
  "User-Agent": "RewardologyAcademy/1.0",
};

type FetchRemoteXmlOptions = {
  timeoutMs?: number;
  useProxyFallback?: boolean;
};

/** Fetch RSS/XML — direct first, then allorigins.win when blocked or empty. */
export async function fetchRemoteXml(
  url: string,
  { timeoutMs = 12_000, useProxyFallback = true }: FetchRemoteXmlOptions = {}
): Promise<string> {
  const direct = await fetch(url, {
    headers: DEFAULT_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
    next: { revalidate: 1800 },
  }).catch(() => null);

  if (direct?.ok) {
    const xml = await direct.text();
    if (xml.trim()) return xml;
  }

  if (!useProxyFallback) {
    throw new Error(`HTTP ${direct?.status ?? "failed"}`);
  }

  const proxyUrl = `${ALLORIGINS_RAW}${encodeURIComponent(url)}`;
  const proxy = await fetch(proxyUrl, {
    headers: { Accept: "text/plain, */*" },
    signal: AbortSignal.timeout(timeoutMs + 4_000),
    next: { revalidate: 1800 },
  });

  if (!proxy.ok) throw new Error(`Proxy HTTP ${proxy.status}`);

  const xml = await proxy.text();
  if (!xml.trim()) throw new Error("Empty feed response");
  return xml;
}

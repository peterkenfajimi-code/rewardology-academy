export const GEO_RECORD_SESSION_KEY = "ra_geo_recorded";

export type GeoRecordResult = {
  ok: boolean;
  recorded?: boolean;
  location?: {
    countryCode: string;
    countryName: string | null;
    region: string | null;
    city: string | null;
  };
  error?: string;
};

/** Ask the server to store approximate location for the signed-in user. */
export async function recordUserLocation(options?: { force?: boolean }): Promise<GeoRecordResult> {
  if (options?.force && typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(GEO_RECORD_SESSION_KEY);
  }

  const res = await fetch("/api/geo/record", { method: "POST" });
  const data = (await res.json()) as GeoRecordResult;

  if (res.ok && data.recorded && typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(GEO_RECORD_SESSION_KEY, "1");
  }

  return data;
}

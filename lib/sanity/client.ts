import { createClient } from "next-sanity";
import { isSanityConfigured as sanityConfigured } from "@/lib/env";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const isSanityConfigured = sanityConfigured();

export const sanity = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-01-01",
  useCdn: true,
});

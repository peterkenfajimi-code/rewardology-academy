import path from "path";
import {
  disclosureCompanyPaths,
  loadDisclosureCompanies,
  syncDisclosureCompaniesToFiles,
} from "@/lib/repository/disclosure-companies";

export {
  disclosureCompanyPaths,
  loadDisclosureCompanies,
  loadNgxCompanies,
  syncDisclosureCompaniesToFiles,
} from "@/lib/repository/disclosure-companies";

/** @deprecated use syncDisclosureCompaniesToFiles */
export async function syncNgxCompaniesToFile(apiKey?: string) {
  const all = await syncDisclosureCompaniesToFiles(apiKey);
  return all.filter((c) => c.exchange === "NGX");
}

/** @deprecated use disclosureCompanyPaths */
export function ngxCompanyPaths() {
  const paths = disclosureCompanyPaths();
  return {
    seedPath: path.join(paths.dataDir, paths.exchangeFiles.NGX.seed),
    outputPath: path.join(paths.dataDir, paths.exchangeFiles.NGX.cache),
  };
}

import { describe, expect, it } from "vitest";
import {
  isExtractionOverdue,
  latestAvailableFiscalYear,
  parseFiscalYear,
  reportAvailableOn,
} from "@/lib/repository/review-schedule";

const asOf = new Date("2026-11-05T12:00:00Z");

describe("extraction overdue = a newer AR than last extracted FY is available", () => {
  it("parses FY labels", () => {
    expect(parseFiscalYear("FY2024")).toBe(2024);
    expect(parseFiscalYear("FY2025")).toBe(2025);
    expect(parseFiscalYear("2026")).toBe(2026);
  });

  it("places a December FYE / March report in the following calendar year", () => {
    expect(reportAvailableOn(2025, "31 December", "March")?.toISOString()).toBe(
      "2026-03-01T00:00:00.000Z"
    );
  });

  it("places a March FYE / June report in the same calendar year as the FYE", () => {
    expect(reportAvailableOn(2026, "31 March", "June")?.toISOString()).toBe(
      "2026-06-01T00:00:00.000Z"
    );
  });

  it("treats FY2025 as the latest available December-year report on 5 Nov 2026", () => {
    expect(latestAvailableFiscalYear("31 December", "March", asOf)).toBe(2025);
  });

  it("flags GTCO and Scancom (last FY2024) as overdue", () => {
    expect(
      isExtractionOverdue({
        last_fy_extracted: "FY2024",
        fiscal_year_end: "31 December",
        report_usually_published_month: "March",
        asOf,
      })
    ).toBe(true);
  });

  it("does not flag Unilever / NB (last FY2025) as overdue", () => {
    expect(
      isExtractionOverdue({
        last_fy_extracted: "FY2025",
        fiscal_year_end: "31 December",
        report_usually_published_month: "March",
        asOf,
      })
    ).toBe(false);
  });

  it("does not flag Safaricom (last FY2026, March year-end) as overdue", () => {
    expect(latestAvailableFiscalYear("31 March", "June", asOf)).toBe(2026);
    expect(
      isExtractionOverdue({
        last_fy_extracted: "FY2026",
        fiscal_year_end: "31 March",
        report_usually_published_month: "June",
        asOf,
      })
    ).toBe(false);
  });
});

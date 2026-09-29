import { describe, expect, it } from "vitest";
import { companySlug } from "@/lib/repository/company-slug";

describe("companySlug identity", () => {
  it("keeps MTN Ghana distinct from MTN Group South Africa", () => {
    const ghana = companySlug("Scancom PLC (MTN Ghana)", "GH");
    const ghanaSeed = companySlug("MTN Ghana PLC", "GH");
    const za = companySlug("MTN Group Ltd", "ZA");
    expect(ghana).toBe("scancom-plc-mtn-ghana-gh");
    expect(za).toBe("mtn-group-ltd-za");
    expect(ghana).not.toBe(za);
    expect(ghanaSeed).not.toBe(za);
  });
});

import { describe, expect, it } from "vitest";
import { linkedInCertificationUrl } from "@/lib/certificates/linkedin";
import { certificateVerifyPath } from "@/lib/certificates/urls";

describe("certificateVerifyPath", () => {
  it("builds encoded verify path", () => {
    expect(certificateVerifyPath("RA-ABC12345")).toBe("/verify/RA-ABC12345");
  });
});

describe("linkedInCertificationUrl", () => {
  it("includes credential name and cert URL params", () => {
    const url = linkedInCertificationUrl({
      credentialName: "Total Rewards Foundations",
      certId: "RA-ABC12345",
      issuedAt: new Date("2026-04-15"),
    });
    expect(url).toContain("linkedin.com/profile/add");
    expect(url).toContain("name=Total+Rewards+Foundations");
    expect(url).toContain("organizationName=Rewardology+Academy");
    expect(url).toContain("issueYear=2026");
    expect(url).toContain("issueMonth=4");
    expect(url).toContain("certId=RA-ABC12345");
    expect(url).toContain(encodeURIComponent("/verify/RA-ABC12345"));
  });
});

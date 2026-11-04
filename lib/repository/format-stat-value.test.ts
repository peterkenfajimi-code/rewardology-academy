import { describe, expect, it } from "vitest";
import { formatStatValue, isSimpleQuantifiedValue } from "@/lib/repository/format-stat-value";
import { renderDisplayText } from "@/lib/repository/field-registry";

const EMPLOYER_TEMPLATE = "{company} contributes {value}% of salary to the employee pension scheme.";
const EMPLOYEE_TEMPLATE = "Employees contribute {value}% of salary to the pension scheme.";

describe("split contribution rates must show both figures and the base", () => {
  const employerSplit =
    "12% (non-management) / 10% (management) of Basic, Transport and Housing Allowances (Company)";
  const employeeSplit =
    "7% (non-management) / 8% (management) of Basic, Transport and Housing Allowances (Company)";

  it("does not treat a split rate as a single hero number", () => {
    expect(isSimpleQuantifiedValue(employerSplit)).toBe(false);
    expect(isSimpleQuantifiedValue("10")).toBe(true);
    expect(isSimpleQuantifiedValue("12.5 (Group)")).toBe(true);
    expect(formatStatValue(employerSplit, "Employer pension contribution %").number).toBe(
      employerSplit
    );
  });

  it("interpolates the full split into the sentence and does not append % of salary", () => {
    expect(renderDisplayText(EMPLOYER_TEMPLATE, "Nigerian Breweries Plc", employerSplit)).toBe(
      "Nigerian Breweries Plc contributes 12% (non-management) / 10% (management) of Basic, Transport and Housing Allowances (Company) to the employee pension scheme."
    );
    expect(renderDisplayText(EMPLOYEE_TEMPLATE, "Nigerian Breweries Plc", employeeSplit)).toBe(
      "Employees contribute 7% (non-management) / 8% (management) of Basic, Transport and Housing Allowances (Company) to the pension scheme."
    );
  });

  it("keeps % of salary for a single disclosed number", () => {
    expect(renderDisplayText(EMPLOYER_TEMPLATE, "GTCO", "10")).toBe(
      "GTCO contributes 10% of salary to the employee pension scheme."
    );
    expect(renderDisplayText(EMPLOYER_TEMPLATE, "GCB Bank PLC", "12.5 (Group)")).toBe(
      "GCB Bank PLC contributes 12.5 (Group)% of salary to the employee pension scheme."
    );
  });

  it("keeps 'as stated in the report' on a non-simple rate and does not append % of salary", () => {
    const employee = "5% of basic salary, as stated in the report";
    const employer = "13.5% of basic salary, as stated in the report";
    expect(isSimpleQuantifiedValue(employee)).toBe(false);
    expect(
      renderDisplayText(EMPLOYEE_TEMPLATE, "Stanbic Bank Ghana Ltd", employee)
    ).toBe(
      "Employees contribute 5% of basic salary, as stated in the report to the pension scheme."
    );
    expect(
      renderDisplayText(EMPLOYER_TEMPLATE, "Stanbic Bank Ghana Ltd", employer)
    ).toBe(
      "Stanbic Bank Ghana Ltd contributes 13.5% of basic salary, as stated in the report to the employee pension scheme."
    );
  });
});

describe("defined_benefit_plan_status labels", () => {
  const template = "{company} company-sponsored defined benefit plan status: {value}.";

  it("maps closed_to_new_entrants and keeps a (Group) scope tag", () => {
    expect(renderDisplayText(template, "KCB Group Plc", "closed_to_new_entrants (Group)")).toBe(
      "KCB Group Plc company-sponsored defined benefit plan status: closed to new entrants, still accruing (Group)."
    );
  });

  it("keeps closed_legacy as frozen / not accruing", () => {
    expect(renderDisplayText(template, "GCB Bank PLC", "closed_legacy")).toBe(
      "GCB Bank PLC company-sponsored defined benefit plan status: closed (legacy, not accruing for current employees)."
    );
  });
});

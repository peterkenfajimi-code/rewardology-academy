# Repository cleanup backlog

Prioritized follow-up items. Smallest concrete fixes first.

## Small, concrete fixes (code / schema alignment)

1. ~~**Safaricom Kenya tier2 retrofit**~~ — **Done (Aug 2026).** Published `pension_administrator_type` scoped to `NSSF (Tier 1)` only; FY2024 duplicate administrator row superseded; `employer_contribution_pct=6` annotated as Tier 1 NSSF (still held pending cap review). `tier2_*` contribution fields remain empty until source confirms occupational scheme rates (`reconcile-safaricom-tier2-retrofit.ts`).

2. **`uq_one_published_fact` UX toast** — Reviewer publishing a new entry can silently supersede an existing published row with no on-screen confirmation. Cheap fix, real risk to reviewer confidence.

3. **Historical-duplicate status decision** — Rows that lose to a newer source sit in `pending_verification` forever, conflating "needs review" with "permanently superseded." Needs a real status value or explicit decision to leave as-is.

## Content review (no code urgency)

4. **Safaricom 6% Kenya NSSF cap language** — Read the actual pension note for cap mechanics and employee-side figure before `employer_contribution_pct` can publish. Tier 2 occupational rates (for `tier2_employer_contribution_pct` / `tier2_employee_contribution_pct`) also need source confirmation when disclosed.

5. **GCB `defined_benefit_plan_exists`** — Interim string patch held pending (`Yes (closed legacy scheme, discontinued 1985)`). Proper `defined_benefit_plan_status` field would be cleaner but not blocking.

## Deliberate next sessions (do not fold into current work)

6. **Guide 2 (careers page) for GCB** — Parked with its own validation target; same pattern as GTCO careers reconciliation. Thin GCB profile is Guide-1-only by design, not a bug.

7. **Fifth company — MTN Ghana (Scancom PLC)** — Tests two companies in the same country/regime (company-identity / dedup handling). Natural pick after GCB Guide 1 proof point.

## Reference

- **GCB Guide-1-only scope:** GCB was collected from a single Guide 1 source to validate Ghana three-tier structure. Empty Health/Risk/Leave sections = not yet collected from Guides 2–6.

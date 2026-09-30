# Repository cleanup backlog

Prioritized follow-up items. Smallest concrete fixes first.

## Small, concrete fixes (code / schema alignment)

1. ~~**Safaricom Kenya tier2 retrofit**~~ — **Done (Aug 2026).** Published `pension_administrator_type` scoped to `NSSF (Tier 1)` only; FY2024 duplicate administrator row superseded. `employer_contribution_pct=6` later rejected after AR source-read (item 4). `tier2_*` contribution fields remain empty — source does not disclose occupational scheme rates.

2. ~~**`uq_one_published_fact` UX toast**~~ — **Done (Sep 2026).** Entry-tool save with Publish checked previews existing published facts and asks for confirmation (old value → new value) before replacing the unique published row. After save, the status line reports how many facts were replaced. Batch publish still uses a coarser confirm because it has no per-field review list.

3. ~~**Historical-duplicate status decision**~~ — **Done (Sep 2026).** No fifth `publish_status`. Outranked pending rows are marked `superseded` (already in the enum) when a newer, higher-trust source wins. `pending_verification` is reserved for rows that still need a human decision — lower-trust conflicts that did not win. Saving as pending no longer unpublishes the live fact; publishing still replaces it (after confirmation).

## Content review (no code urgency)

4. ~~**Safaricom 6% Kenya NSSF cap language**~~ — **Done (Sep 2026).** FY26 AR note 2(s) (p.172) and FY25 note 2(s) confirm NSSF + a Group defined-contribution plan; they do not state 6%, a cap, an employee-side %, or a Tier 2 occupational rate. Note 10 splits expense only (FY26 Group NSSF KShs 295.8m vs DC plan KShs 1,229.3m). `employer_contribution_pct=6` was country-module leakage — rejected, not published. `tier2_*` rates stay empty (`reconcile-safaricom-nssf-cap-review.ts`).

4b. ~~**GTCO 10%/8% provenance**~~ — **Done (Sep 2026).** Published rates retargeted to 2024 Annual Report p.155, "Defined contribution plans" (`The rate of contribution by the Bank and its employee is 10% and 8% respectively of basic salary, housing and transport allowance.`). Old "extracted from metadata notes" provenance replaced, not silently overwritten (`reconcile-gtco-pra-citation.ts`). Equals PRA minimum; that match is not leakage.

4c. ~~**Statutory vs company-disclosed rate (extraction guidance)**~~ — **Done (Sep 2026).** One canonical test in `lib/repository/statutory-vs-disclosure.ts`, used by the extraction prompt, field-registry descriptions (migration 012), and `formatRegistryForPrompt`. Lockstep covered by `statutory-vs-disclosure.test.ts`.

5. ~~**GCB `defined_benefit_plan_exists`**~~ — **Done (Sep 2026).** Split onto `defined_benefit_plan_status=closed_legacy` (migration 013). `exists=Yes` is now a real Yes/No; the closed-1985 story no longer lives on a field that collapses narrative to Yes.

## Deliberate next sessions (do not fold into current work)

6. ~~**Guide 2 (careers page) for GCB**~~ — **Done (Sep 2026).** `https://www.gcbbank.com.gh/careers` is a 404 and is not in the public nav (zero career/job links on the homepage). No benefits-bearing careers page to extract. Source-discovery no longer guesses `/careers` for GCB. Thin Health/Risk/Leave remains Guide 1-only by absence of Guide 2, not a collection bug.

6b. ~~**Safaricom Guide 2 close-out**~~ — **Done (Sep 2026).** Live `/careers/` is CloudFront 403; indexed excerpt of the same URL saved. Published wellness programme (narrative/low), crèche facilities (named_program/medium), subsidized gym (named_program/medium). Did not publish “competitive salaries”. FY2024 AR “medical aid contributions” row remains pending on `wellness_program_narrative` (wrong field — not this sitting).

6c. ~~**Safaricom pending queue**~~ — **Done (Sep 2026).** All 14 rows resolved (`scripts/reconcile-safaricom-gcb-pending.ts`). Published: long-term incentive plan (2026 AR remuneration report), equal-opportunity non-discrimination policy (careers page). Rejected with reasons: "competitive salaries" ×2 (recruitment copy), accrued-leave ×2 (balance-sheet provision), training spend ×2 (no figure broken out), medical aid ×2 (IAS 19 short-term-benefits definition, same boilerplate every year — not moved to `hmo_scope`), three HR Committee terms-of-reference inferences (hmo_scope, exit scheme, tuition), "work-life balance" (no arrangement described).

6d. **GCB depth — Guides 3 and 5 (Sep 2026): nothing citable.** Press releases on gcbbank.com.gh and news coverage: health items are all CSR (public screenings, hospital donations); Child Education Plan and Digital Salary Advance are customer products. LinkedIn company page: CSR/marketing only. Not recorded: MD keynote (CIHRM, Jun 2025) "promoted flexible work models" — same vagueness bar as Safaricom's rejected work-life-balance row. GCB's pending termination row rejected (IAS 19 recognition rule, not an entitlement). Next GCB options: Guide 4 (Bank of Ghana / GSE filings) or Guide 7 (direct outreach).

6e. **MTN Ghana termination row — inconsistent with 6c/6d.** `termination_benefits_policy` was published from AR 2.8.4, the same IAS 19 recognition wording rejected for GCB. Review in the MTN Ghana pass.

6f. **verification_log was dropping publish/reject reasons.** The action check only allowed extraction-time actions, so every `published`/`rejected` log and the pipeline's `pending_conflict`/`confidence_clamped`/`value_type_mismatch` flags failed the constraint, and the unchecked inserts hid it. Migration 015 widens the check (applied Sep 2026). Earlier decisions' reasons survive only in entry notes. Still open: `reconciliation.ts` and older review scripts don't check the insert error.

7. ~~**Fifth company — MTN Ghana (Scancom PLC)**~~ — **Done (Sep 2026).** Separate row `GSE:MTNGH` / slug `scancom-plc-mtn-ghana-gh` vs `JSE:MTN` / `mtn-group-ltd-za`. Guide 1 from 2024 AR: DC scheme disclosed with no rate (statutory 5% not copied); ESOP/PSP published; workforce 42.8% / 29.3% women. Empty quantified rows dropped going forward.

## Reference

- **Guide numbering (seven-source framework):** 1 annual/sustainability report, 2 careers page, 3 press releases, 4 regulatory filings, 5 LinkedIn, 6 award submissions, 7 direct outreach. Canonical copy: the `SourceType` comment in `lib/repository/types.ts`.

- **GCB Guide-1-only scope:** GCB was collected from a single Guide 1 source to validate Ghana three-tier structure. Empty Health/Risk/Leave sections = not yet collected from Guides 2–6.
- **GCB careers URL:** `https://www.gcbbank.com.gh/careers` is a 404 and is not in the public nav — do not re-probe it as a Guide 2 source.

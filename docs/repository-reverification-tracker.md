# Re-verification tracker

Private schedule of when the next annual report is expected. The live copy is `company_review_schedule` (migration 026). This file is the human-readable seed.

Empty seed companies (11 Plc, Absa, Access Holdings, Anglo American) are **not** on this list until they have a published fact.

Overdue means a newer annual report than `last_fy_extracted` is already expected to be out (December FYE / March report → FY2025 is out by November 2026). It is not `next_due` in the future.

| Company | FYE | Report usually out | Last FY extracted | Latest available | Overdue |
|---|---|---|---|---|---|
| GTCO (NGX) | 31 December | March | FY2024 | FY2025 | yes |
| Scancom / MTN Ghana (GSE) | 31 December | March | FY2024 | FY2025 | yes |
| Safaricom (NSE) | 31 March | June | FY2026 | FY2026 | no |
| GCB Bank (GSE) | 31 December | March | FY2025 | FY2025 | no |
| MTN Group (JSE) | 31 December | March | FY2025 | FY2025 | no |
| Zenith Bank (NGX) | 31 December | March | FY2025 | FY2025 | no |
| MTN Nigeria (FMDQ) | 31 December | March | FY2025 | FY2025 | no |
| Nigerian Breweries Plc (NGX) | 31 December | March | FY2025 | FY2025 | no |
| Stanbic Bank Ghana Ltd | 31 December | March | FY2025 | FY2025 | no |
| KCB Group Plc (NSE) | 31 December | April | FY2025 | FY2025 | no |
| Unilever Nigeria Plc (NGX) | 31 December | March | FY2025 | FY2025 | no |

MTN Group is a multi-country row, not a South Africa entity. Group-scope is now the standing rule in `lib/repository/group-scope.ts` (backlog 6u). Standard Bank Group, EABL and Shoprite stay off this list until they have a published fact.

Stanbic Bank Ghana Ltd is unlisted (`multinational_subsidiary`). Bank-only facts — no Standard Bank Group Limited row. Pension 5% / 13.5% of basic salary published as stated in the report (Medium); the Act 766 payer-vs-tier discrepancy is internal plus a Guide 7 question. FY2025 year-end headcount is not stated (Bank Snapshot 916 is 2024).

KCB Group Plc is the listed holding company (`NSE:KCB`), not KCB Bank Kenya. Group-labelled facts. `defined_benefit_plan_status` published as `closed_to_new_entrants (Group)` (migration 030). Board 22.2% at 31 December 2025 (2 of 9); Lyn Mengich appointed 4 February 2026. Housing 491-employees passage dropped: customer lending through employer-supported mortgage schemes, not a KCB staff benefit; `staff_housing_loan` not added.

Unilever Nigeria Plc is the listed NGX entity, not Unilever PLC. FY2025 Guide 1 published: PRA 2014 DC rates as stated (employee 7% management / 10% non-management; employer 10%/10%; contribution base unnamed in the report); funded DB `closed_legacy`; unfunded service gratuity separate; post-retirement medical and product packs to retired employees; long-service awards; average 607 excluding executive directors. Immediate parent Unilever Overseas Holdings B.V. (85.98%). No text taken from Unilever PLC.

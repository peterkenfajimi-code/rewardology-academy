-- Multi-market disclosure exchanges + collection rollout priority

alter table country_modules add column if not exists collection_priority int;

alter table companies drop constraint if exists companies_listing_exchange_check;
alter table companies add constraint companies_listing_exchange_check check (
  listing_exchange is null or listing_exchange in (
    'NGX', 'FMDQ', 'NASD', 'JSE', 'NSE', 'GSE', 'EGX', 'RSE'
  )
);

update country_modules set collection_priority = 1,
  notes = coalesce(notes, '') || ' Guide 1: mandatory IAS-19 pension notes reliable; sustainability reports ~15% of large issuers beyond financials (sub-Saharan average).'
where country_code = 'NG';

update country_modules set collection_priority = 2,
  notes = coalesce(notes, '') || ' Strongest second market for Guide 1. JSE (~430 listed). Best sub-Saharan sustainability/ESG depth — expect richer voluntary-benefit narrative (wellness, HMO, DEI).'
where country_code = 'ZA';

update country_modules set collection_priority = 3,
  notes = coalesce(notes, '') || ' NSE — IFRS annual reports similar to NGX. Solid pension/gratuity notes; dedicated sustainability less universal.'
where country_code = 'KE';

update country_modules set collection_priority = 4,
  notes = coalesce(notes, '') || ' GSE — smaller exchange. Mandatory financial disclosure; fewer listed companies than NGX/JSE.'
where country_code = 'GH';

update country_modules set collection_priority = 5,
  notes = coalesce(notes, '') || ' EGX — FRA oversight, EAS base with IFRS alignment. Mandatory audited reports; voluntary benefits sparser outside largest names.'
where country_code = 'EG';

update country_modules set collection_priority = 6,
  notes = coalesce(notes, '') || ' RSE — very few listed companies. Weakest Guide 1 market; lean on Guides 2, 3, and 7.'
where country_code = 'RW';

-- Nigeria: secondary disclosure exchanges (FMDQ debt/CP, NASD OTC equity)
-- Commodity exchanges (NCX, AFEX) intentionally excluded — wrong disclosure model for Guide 1.

alter table country_modules add column if not exists secondary_disclosure_exchanges text[];

update country_modules
set
  secondary_disclosure_exchanges = array['FMDQ', 'NASD'],
  notes = trim(both from coalesce(notes, '') || ' Primary equity exchange: NGX. Secondary disclosure venues: FMDQ (listed/quoted debt and commercial paper) and NASD (OTC equity; NASD Blue tier = compliant disclosures). Commodity exchanges (NCX, AFEX) are out of scope.')
where country_code = 'NG';

alter table companies add column if not exists listing_exchange text
  check (listing_exchange is null or listing_exchange in ('NGX', 'FMDQ', 'NASD'));

create index if not exists idx_companies_listing_exchange on companies(listing_exchange);
create index if not exists idx_companies_ticker_exchange on companies(exchange_ticker, listing_exchange);

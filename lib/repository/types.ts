export type CountryCode = "NG" | "GH" | "KE" | "ZA" | "EG" | "RW";

export type SourceType =
  | "annual_report"
  | "sustainability_report"
  | "careers_page"
  | "press_release"
  | "regulatory_filing"
  | "linkedin"
  | "award_recognition"
  | "direct_confirmation";

export type BenefitCategory =
  | "retirement"
  | "health"
  | "risk_insurance"
  | "leave"
  | "allowances"
  | "development"
  | "equity_variable"
  | "other_voluntary";

export type ValueType = "quantified" | "named_program" | "compliance_status" | "narrative";

export type ConfidenceScore = "high" | "medium" | "low";

export type PublishStatus = "published" | "pending_verification" | "superseded" | "rejected";

export type CompanySizeBand = "1-50" | "51-500" | "501-5000" | "5000+";

export type DisclosureExchange =
  | "NGX"
  | "FMDQ"
  | "NASD"
  | "JSE"
  | "NSE"
  | "GSE"
  | "EGX"
  | "RSE";

export type ListedStatus = "listed" | "private" | "multinational_subsidiary";

export type CountryModule = {
  country_code: CountryCode;
  country_name: string;
  currency_code: string;
  pension_regulator: string | null;
  pension_statutory_employer_pct: number | null;
  pension_statutory_employee_pct: number | null;
  pension_scheme_type: string | null;
  notes: string | null;
  collection_priority?: number | null;
};

export type Company = {
  company_id: string;
  name: string;
  country: CountryCode;
  industry: string | null;
  sub_industry: string | null;
  company_size_band: CompanySizeBand | null;
  listed_status: ListedStatus | null;
  exchange_ticker: string | null;
  listing_exchange: DisclosureExchange | null;
  created_at: string;
  last_reviewed_at: string | null;
};

export type SourceRecord = {
  source_id?: string;
  company_id: string;
  source_type: SourceType;
  source_url?: string | null;
  source_title?: string | null;
  publication_date?: string | null;
  date_accessed: string;
  country?: CountryCode | null;
};

export type ExtractedEntry = {
  category: BenefitCategory;
  field: string;
  value: string | null;
  value_type: ValueType;
  fiscal_year_or_effective_date?: string | null;
  confidence_score: ConfidenceScore;
  notes?: string | null;
};

export type BenefitEntryRow = ExtractedEntry & {
  entry_id?: string;
  company_id: string;
  source_id: string;
  source_trust_weight: number;
  publish_status: PublishStatus;
};

export type CoverageRow = {
  country: string;
  industry: string | null;
  company_size_band: string | null;
  company_count: number;
  entry_count: number;
};

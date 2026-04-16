
ALTER TABLE public.properties
ADD COLUMN listing_rules jsonb NOT NULL DEFAULT '{
  "min_income_ratio": 3,
  "require_linkedin": true,
  "require_db_credit": true,
  "require_biometric_id": true,
  "require_tax_return": false,
  "require_payslips": true,
  "require_work_contract": true,
  "residency_history_check": false,
  "require_nie": false,
  "scoring_weights": {
    "db_credit": 30,
    "linkedin": 20,
    "identity": 20,
    "residency": 15,
    "verification": 15
  }
}'::jsonb;

-- Migration 015 — allow every action the pipeline and review scripts write to verification_log.
-- The original check only allowed extraction-time actions, so publish/reject decisions and the
-- pipeline's pending_conflict / confidence_clamped / value_type_mismatch flags were rejected by
-- the constraint (and the unchecked inserts dropped them silently).

alter table verification_log drop constraint if exists verification_log_action_check;

alter table verification_log add constraint verification_log_action_check check (action in (
  'extracted', 'cross_checked', 'corrected', 'upgraded_confidence', 'downgraded_confidence',
  'flagged_legal_review', 'superseded', 'reconciled',
  'published', 'rejected', 'pending_conflict', 'confidence_clamped', 'value_type_mismatch'
));

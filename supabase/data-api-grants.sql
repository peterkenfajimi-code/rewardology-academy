-- Explicit Data API grants for Academy tables (Supabase change 2026-10-30).
-- Run once in the Academy project's SQL Editor. Safe to re-run.
-- Existing tables already have auto-grants; this makes them explicit and
-- matches the CREATE TABLE files so a future reset still works.
-- Privileges follow RLS: no anon write on learner tables.

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;

grant select, insert, update, delete on table public.quiz_centre_progress to authenticated;
grant select, insert, update, delete on table public.quiz_centre_progress to service_role;
grant execute on function public.record_quiz_centre_attempt(integer, integer, integer, integer) to authenticated;

grant select, insert, update, delete on table public.course_progress to authenticated;
grant select, insert, update, delete on table public.course_progress to service_role;
grant execute on function public.record_course_lesson(integer, text, integer) to authenticated;

grant select, insert, update on table public.daily_quiz_completions to authenticated;
grant select, insert, update, delete on table public.daily_quiz_completions to service_role;
grant execute on function public.record_daily_quiz_completion(date, text, text, boolean, integer) to authenticated;

grant select, insert on table public.article_progress to authenticated;
grant select, insert, update, delete on table public.article_progress to service_role;
grant execute on function public.record_article_read(integer, text, integer) to authenticated;

grant select, insert on table public.comics_progress to authenticated;
grant select, insert, update, delete on table public.comics_progress to service_role;
grant execute on function public.record_comic_issue(text, integer, integer) to authenticated;

grant select, insert on table public.dictionary_progress to authenticated;
grant select, insert, update, delete on table public.dictionary_progress to service_role;
grant execute on function public.record_dictionary_term(text, integer) to authenticated;

grant select, insert, update on table public.user_locations to authenticated;
grant select, insert, update, delete on table public.user_locations to service_role;
grant execute on function public.record_user_location(text, text, text, text) to authenticated;
grant execute on function public.admin_user_location_stats() to authenticated;

grant select, insert, update on table public.issued_certificates to authenticated;
grant select, insert, update, delete on table public.issued_certificates to service_role;
grant execute on function public.issue_certificate(text, text, text, text, text, integer, integer, timestamptz) to authenticated;
grant execute on function public.get_public_certificate(text) to anon, authenticated;

grant select on table public.testimonials to anon, authenticated;
grant insert on table public.testimonials to authenticated;
grant select, insert, update, delete on table public.testimonials to service_role;
grant execute on function public.list_pending_testimonials() to authenticated;
grant execute on function public.moderate_testimonial(uuid, text) to authenticated;

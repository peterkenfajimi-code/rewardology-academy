-- LEGACY — not used by the current Quiz Centre (quizzes live in lib/quizzes/quizCentre.ts).
-- The app uses quiz_centre_progress from supabase/quiz-centre.sql instead.
-- Run after main schema migration

insert into public.quizzes (id, slug, title, category, difficulty, is_daily, status)
values (
  'a1111111-1111-1111-1111-111111111111',
  'daily-comp-basics',
  'Daily Quiz: Compensation Basics',
  'Compensation',
  'beginner',
  true,
  'published'
)
on conflict (slug) do nothing;

insert into public.quiz_questions (quiz_id, question_text, options, correct_option, explanation)
values
(
  'a1111111-1111-1111-1111-111111111111',
  'What does total rewards typically include?',
  '[{"key":"A","text":"Base pay only"},{"key":"B","text":"Pay, benefits, wellbeing, and recognition"},{"key":"C","text":"Stock options only"},{"key":"D","text":"Overtime pay only"}]'::jsonb,
  'B',
  'Total rewards covers all forms of employee value exchange.'
),
(
  'a1111111-1111-1111-1111-111111111111',
  'Job evaluation primarily helps organizations:',
  '[{"key":"A","text":"Set internal job worth and pay structure"},{"key":"B","text":"Track attendance"},{"key":"C","text":"Design marketing campaigns"},{"key":"D","text":"Manage leave balances"}]'::jsonb,
  'A',
  null
),
(
  'a1111111-1111-1111-1111-111111111111',
  'Pay equity analysis is mainly focused on:',
  '[{"key":"A","text":"Fair pay for equal or comparable work"},{"key":"B","text":"Office seating plans"},{"key":"C","text":"Recruitment branding"},{"key":"D","text":"Expense approvals"}]'::jsonb,
  'A',
  null
);

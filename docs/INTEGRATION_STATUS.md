# THERASON integration status

## Source of truth and safety
- Existing Supabase project: `Therason 3` (`fcmatdnueuyisypmstam`).
- Existing Auth, student registry, profiles, user roles, wallets, XP events, academic catalog, question bank, exams, attempts and results remain authoritative.
- No production schema migrations or data mutations were made as part of this UI integration.
- No Lovable `.env`, secrets, service-role keys, auth configuration or database migrations were copied.
- All work is isolated to `integration/lovable-design`; `main` is untouched.

## UI reference
- Reference repository: `Tahiroon/sudan-physio-clinic-quest`.
- Adapted its THERASON visual direction, Arabic RTL, Readex Pro, student dashboard, learning navigation and clinical simulation concepts.
- Lovable's separate Cloud Auth and Drizzle schema were intentionally not imported because they do not match the existing Therason 3 schema.

## Implemented in this branch
- Responsive THERASON student/admin application shell and navigation.
- Existing student-ID + password Supabase Auth flow retained.
- Student home, wallet/XP/level display, profile, progress history and announcements.
- Academic library based on existing `subjects` and `topics` tables.
- Published question practice without exposing answer keys to students.
- Published exams using existing `start_attempt` and `submit_attempt` RPCs.
- Admin overview, institution management, student registry view, subjects/topics, question authoring, exam authoring and announcements.
- A lightweight educational clinical reasoning simulator adapted from the Lovable idea; its demo cases are local and do not award persisted XP.

## Known limitations requiring a separate, deliberate phase
- Therason 3 has no `lessons`, `shop_items`, `purchases`, or clinical case completion tables matching the Lovable app. The learning library therefore uses the real `subjects`/`topics`/`questions` schema; the Lovable equipment shop and persistent clinic progression are not enabled.
- The current `profiles` table had zero rows at the time of inspection while `student_registry` had 10 rows. Students without a profile linked to their Auth user will see the account-pending screen. Do not bypass this with client-side profile creation; finish the approved activation workflow/Edge Function integration.
- Student registry is currently view-only in this UI; bulk import/activation remains an administrative workflow.
- Admin actions are still constrained by existing Supabase RLS. A visible control does not imply the current account has permission.
- This static HTML/CSS/JS branch has not yet been run through a Vercel Preview build or end-to-end browser test in this environment.

## Next verification
1. Deploy `integration/lovable-design` as a Vercel Preview, not Production.
2. Test with the existing super-admin account.
3. Test a real student account that has a matching row in `profiles`.
4. Verify exam start and submit RPCs, and confirm RLS blocks unauthorized admin operations.
5. Only after preview acceptance, discuss a separate production merge.

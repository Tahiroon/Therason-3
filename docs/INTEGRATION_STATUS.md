# THERASON integration status

## Non-negotiable source of truth
- Supabase project: Therason 3 (existing project).
- Keep existing Auth users, student registry, profiles, roles, wallets, XP, lessons, questions, exams, and results.
- Do not apply the Lovable project's database migrations to the production Therason project.
- Do not copy the Lovable repository's `.env`, secrets, auth configuration, or database schema.

## Repositories
- Production foundation: `Tahiroon/Therason-3`.
- UI reference: `Tahiroon/sudan-physio-clinic-quest`.

## Verified current foundation
- Existing app is a small RTL HTML/CSS/JS client.
- Existing login calls Supabase Auth and maps student IDs matching `thr\d{6}` to `@students.therason.app`.
- Existing authorization reads `user_roles`; super_admin is recognized.
- Existing student home reads `profiles` and `wallets`.
- Existing admin screens read/write `institutions` and `subjects`.
- Existing public Supabase client configuration is in `config.js`; never add service-role keys to browser code.

## UI reference
- Lovable app uses React 19, Vite 8, TanStack Router/Start, Tailwind 4, and Supabase JS.
- Its root shell provides Arabic RTL, Readex Pro, shared header/footer, i18n, and React Query.
- Its home page provides the academic landing experience and specialty tracks.
- Its authentication and database implementation must be adapted to Therason's existing tables and policies.

## Integration rules
1. Port visual components and page structure in small reviewed increments.
2. Keep Therason Auth as the only authentication authority.
3. Use a typed data-access adapter for Therason tables; map UI terminology to the existing schema.
4. Keep student ID + password login; no public self-registration.
5. Check role and RLS on the server/database for every privileged action; hiding admin UI is not authorization.
6. Do not mutate production schema or student data during UI integration.
7. Never expose secrets, service-role keys, passwords, or activation peppers in frontend files.
8. Build and test before proposing a merge to `main`.

## First implementation slice
- Establish a React/Vite app shell in this integration branch.
- Port the shared RTL shell and public landing page.
- Replace Lovable auth/data assumptions with the existing Therason Supabase client and schema.
- Preserve current login, student, and super-admin workflows while migrating page by page.

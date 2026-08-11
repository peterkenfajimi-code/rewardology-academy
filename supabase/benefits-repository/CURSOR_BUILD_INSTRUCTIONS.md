# Africa Benefits Repository — Cursor Build Instructions

**Read this file first.** It's the entry point that ties the SQL schema, the master spec, and the seven source guides into an actual build sequence.

See the full instructions in the original handoff package. This repo copy tracks the schema and application code under `feature/benefits-repository`.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_REPOSITORY_SUPABASE_URL` | Separate Supabase project URL |
| `NEXT_PUBLIC_REPOSITORY_SUPABASE_ANON_KEY` | Anon key (optional public reads) |
| `REPOSITORY_SUPABASE_SERVICE_KEY` | Service role for admin writes (server only) |
| `REPOSITORY_SUPABASE_PROJECT_REF` | For `npm run apply:benefits-repository` |
| `REPOSITORY_SUPABASE_ACCESS_TOKEN` | Management API token for apply script |
| `REPOSITORY_ADMIN_USERNAME` | Basic auth username for `/repository-admin` |
| `REPOSITORY_ADMIN_PASSWORD` | Basic auth password |
| `REPOSITORY_ADMIN_SESSION_TOKEN` | Random secret set as httpOnly cookie on login |
| `ANTHROPIC_API_KEY` | AI extraction in admin tool |

**Never** point these at the Academy production Supabase project.

## Apply schema

```bash
npm run apply:benefits-repository
```

Or run `supabase/benefits-repository/schema.sql` in the new project's SQL Editor.

# Admin dashboard (`/setup`) — production configuration

The admin dashboard needs **platform-wide** read access to Supabase. Member tables use RLS; only the platform owner should see all users.

## Fix the red “Admin stats unavailable” error

### Fastest (recommended): Netlify only

1. Supabase → [API Keys for this project](https://supabase.com/dashboard/project/fgkhowgggwbsosqhfnnz/settings/api-keys)  
   - Copy the **secret** key (`sb_secret_...`) or **service_role** (Reveal).  
   - Not the anon / publishable key.

2. Netlify → [Environment variables](https://app.netlify.com/sites/effulgent-cajeta-57593b/configuration/env)  
   - Add `SUPABASE_SERVICE_ROLE_KEY` = that value (server-only).  
   - Trigger a production deploy.

3. Refresh [rewardologyacademy.com/setup](https://rewardologyacademy.com/setup).

SQL migration is **optional** when this variable is set.

## Automated (local or GitHub Actions)

With `.env.local` containing `NETLIFY_AUTH_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, Supabase URL/anon key:

```bash
node scripts/setup-admin-stats-production.mjs
```

Or: GitHub → **Actions** → **Setup admin dashboard stats** → **Run workflow** (after adding the same names under repo **Secrets → Actions**).

## Finding API keys in Supabase (no bottom gear required)

Use **Settings → API Keys** in the project, or open directly:

`https://supabase.com/dashboard/project/fgkhowgggwbsosqhfnnz/settings/api-keys`
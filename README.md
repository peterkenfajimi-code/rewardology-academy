# Rewardology Academy

Total Rewards learning platform — articles, courses, quizzes, and read-aloud.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Without any API keys**, the app runs in demo mode with sample articles, courses, and quizzes.

## Environment setup

### ElevenLabs (Charlotte read-aloud)

1. Create an account at [elevenlabs.io](https://elevenlabs.io)
2. Copy your API key into `.env.local`:

```bash
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=XB0fDUnXU5powFXDhCwa
```

3. Open any article → click **Read aloud**

### Sanity CMS

1. Create a project at [sanity.io](https://sanity.io)
2. Add to `.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

3. Import schemas from `sanity/schemas/` in Sanity Studio
4. Publish articles and courses

### Supabase (auth + XP sync)

1. Create a project at [supabase.com](https://supabase.com)
2. **SQL Editor** → paste and run `supabase/schema.sql` (creates profiles, quiz progress, course progress)
3. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
4. **Project Settings → API** → add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

5. Restart `npm run dev` and open `/setup` → **Check schema**

**What Supabase powers:** sign-in / sign-up, soft-gated routes (courses, quizzes, comics, dashboard), cross-device XP for quizzes and courses.

Individual SQL files also live in `supabase/` if you prefer running them separately.

## Deploy (rewardologyacademy.com)

**Registrar:** Namecheap · **Host:** [Netlify](https://app.netlify.com/start) · **Repo:** [peterkenfajimi-code/rewardology-academy](https://github.com/peterkenfajimi-code/rewardology-academy)

1. [Netlify](https://app.netlify.com/start) → Sign up with GitHub → Import `rewardology-academy` (uses `netlify.toml`).
2. Add environment variables from `.env.example` (`NEXT_PUBLIC_SITE_URL=https://rewardologyacademy.com`).
3. Deploy → Domain management → add `rewardologyacademy.com` + `www` → paste DNS into Namecheap **Advanced DNS**.
4. Add your `*.netlify.app` callback URL in Supabase until the custom domain is live.
5. Run `npm run configure:supabase-auth` or set auth URLs in Supabase dashboard.
6. [Resend](https://resend.com/domains) → verify domain DNS → Supabase **Authentication → SMTP**.

Full checklist: **`/setup`** in the app after `npm run dev`.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/articles` | Article list |
| `/articles/[slug]` | Article + read aloud |
| `/courses` | Course list |
| `/quizzes` | Quiz list |
| `/quizzes/[slug]` | Take quiz, earn XP |
| `/comics` | Comic series |
| `/setup` | Integration + deploy checklist |

## Comic image

Copy your comic to:

```
public/assets/comic-issue-1.png
```

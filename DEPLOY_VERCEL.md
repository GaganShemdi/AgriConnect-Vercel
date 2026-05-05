# Deploying AgriConnect to Vercel

This guide walks through deploying the AgriConnect React + Vite app to Vercel
while keeping the existing Firebase (Phone OTP) and Supabase (database)
integrations intact.

The repo is already configured for Vercel — `vercel.json` and `.env.example`
are committed. You just need to (1) push to GitHub, (2) import on Vercel,
(3) paste env vars, (4) whitelist the production domain in Firebase and
Supabase.

---

## 1. Prerequisites

- A GitHub / GitLab / Bitbucket account (Vercel imports from one of these).
- A free Vercel account: https://vercel.com/signup
- Your existing **Firebase** project credentials (already in your local `.env`).
- Your existing **Supabase** project URL + anon key (already in your local
  `.env`).
- Your **Gemini**, **OpenWeather**, and **data.gov.in** API keys.

You do **not** need to change Firebase or Supabase — the same projects you
use locally will be reused in production.

---

## 2. Push the project to GitHub

From the project root (`D:\AgriConnect Vercel\AgriConnect Vercel`):

```bash
git init
git add .
git commit -m "Prepare AgriConnect for Vercel deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/agriconnect.git
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `dist/`, `.env`, and the bundled
`AgriConnect.zip` artifact, so secrets won't be pushed.

> If `git` is not installed, download it from https://git-scm.com/download/win
> or use GitHub Desktop instead.

---

## 3. Import the project into Vercel

1. Go to https://vercel.com/new.
2. Choose **Import Git Repository** and select your `agriconnect` repo.
3. Vercel will auto-detect the framework. Confirm the settings match:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

   (These are also enforced by `vercel.json`, so you can leave the UI fields
   on their defaults.)

4. **Do not click Deploy yet** — add environment variables first (next step).

---

## 4. Add environment variables on Vercel

Vercel does **not** read your local `.env` file. You must add each variable
in the Vercel dashboard.

In the Import screen (or later under **Project → Settings → Environment
Variables**), add the following one at a time. Apply each to all three
environments: **Production**, **Preview**, and **Development**.

| Key | Value |
|-----|-------|
| `VITE_FIREBASE_API_KEY` | from your `.env` |
| `VITE_FIREBASE_AUTH_DOMAIN` | from your `.env` |
| `VITE_FIREBASE_PROJECT_ID` | from your `.env` |
| `VITE_FIREBASE_STORAGE_BUCKET` | from your `.env` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from your `.env` |
| `VITE_FIREBASE_APP_ID` | from your `.env` |
| `VITE_SUPABASE_URL` | from your `.env` |
| `VITE_SUPABASE_ANON_KEY` | from your `.env` |
| `VITE_GEMINI_API_KEY` | from your `.env` |
| `VITE_GEMINI_MODEL` | `gemini-2.5-flash` |
| `VITE_OPENWEATHER_API_KEY` | from your `.env` |
| `VITE_DATA_GOV_API_KEY` | from your `.env` |
| `VITE_OSM_TILE_URL` | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |
| `VITE_APP_NAME` | `AgriConnect` |
| `VITE_DEFAULT_LANGUAGE` | `en` |

`.env.example` in the repo lists exactly these keys — keep it as the source
of truth.

> **Tip**: Vercel lets you paste a multi-line `.env` block via the
> "Import .env" button. Open your local `.env`, copy everything except
> blank lines, and paste it in.

Click **Deploy**. The first build takes 1–2 minutes.

---

## 5. Authorize the new Vercel domain in Firebase

Firebase Phone OTP (the reCAPTCHA flow) only works on domains that are
explicitly authorized in your Firebase console. Without this step, OTP
**will fail in production**.

1. Open https://console.firebase.google.com/
2. Select project **agriconnect-122b3** (or whichever project the API key
   points to).
3. **Authentication → Settings → Authorized domains → Add domain**.
4. Add:
   - `your-project.vercel.app` (the auto-generated Vercel URL)
   - any custom domain you plan to attach (e.g. `agriconnect.in`)
5. Save.

Re-deploy is **not** required after this — it takes effect immediately.

---

## 6. (Optional) Lock down Supabase to your new domain

By default, Supabase's anon key works from any origin. If you'd like to
restrict it:

1. Go to https://supabase.com/dashboard
2. Select your project → **Authentication → URL Configuration**.
3. Add your Vercel URL under **Site URL** and **Redirect URLs**.

This is only required if you later add Supabase auth flows; the current
`upsert/select` calls work as-is.

---

## 7. (Optional) Attach a custom domain

In Vercel: **Project → Settings → Domains → Add**.

After Vercel verifies the DNS records, **repeat step 5** to authorize the
custom domain in Firebase as well. OTP will silently fail on any
unauthorized domain.

---

## 8. Verify the deployment

Open the Vercel URL and run through the smoke test:

1. **Onboarding loads** — no blank screen, fonts and Tailwind classes apply.
2. **Phone OTP** — enter your phone, receive the SMS, verify. (If reCAPTCHA
   complains about the domain, revisit step 5.)
3. **Profile saves to Supabase** — finish onboarding; check the `users`
   table in Supabase Studio for the new row.
4. **Weather page** — should fetch from OpenWeather.
5. **Mandi page** — should pull live prices from data.gov.in.
6. **Advisory page** — Gemini answers should stream back.
7. **PWA** — Chrome should offer "Install AgriConnect" in the address bar.

If any page errors, check:
- **Vercel → Deployments → \[deployment\] → Runtime Logs**: client-side
  errors won't show here, but build errors will.
- **Browser DevTools → Console**: most issues at runtime are missing env
  vars (`[Supabase] Missing VITE_SUPABASE_URL...`) or unauthorized Firebase
  domain.

---

## 9. Continuous deployment

Once connected, Vercel will redeploy automatically on every push to `main`.
Pushes to other branches create **Preview** deployments at unique URLs you
can share for review.

To redeploy without a code change (e.g., after rotating an API key), use
**Vercel → Deployments → Redeploy**.

---

## Troubleshooting

**Build fails with `Cannot find module @rollup/rollup-linux-x64-gnu`**
A stale `package-lock.json` from Windows. Delete `node_modules/` and
`package-lock.json` locally, run `npm install`, commit the new lockfile,
push.

**`[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY` in
console**
Env vars not set for the Production environment, or you forgot to redeploy
after adding them. Vercel only picks up new env vars on the **next** build.

**Firebase reCAPTCHA error: "This domain is not authorized"**
You skipped step 5. Add the Vercel domain to Firebase Authorized domains.

**404 on a deep link like `/dashboard`**
`vercel.json` already includes a SPA rewrite rule. If you removed it,
restore the `rewrites` block.

**PWA service worker serving stale assets**
The `sw.js` and `manifest.json` cache headers in `vercel.json` are set to
`must-revalidate`. Hard-reload (Ctrl-Shift-R) once after a deployment to
pick up the new SW.

---

## Files added for Vercel

- `vercel.json` — framework preset, SPA rewrites, asset cache headers.
- `.env.example` — documents every required env var (no secrets).
- `DEPLOY_VERCEL.md` — this guide.

Existing project files (`package.json`, `vite.config.ts`, all of `src/`)
are unchanged — Firebase, Supabase, and every other integration keep
working exactly as they do locally.

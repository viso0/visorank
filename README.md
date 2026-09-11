# VisoRank

VisoRank is a responsive product-discovery and ranking website for SaaS, AI tools, AI agents, developer tools, apps and startups.

## Stack
- React + TypeScript
- Vite
- Supabase
- Lucide React

## Run locally

```bash
npm ci
npm run dev
```

Create a `.env` file from `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never commit `.env` or service-role/private keys.

## Supabase setup

Run `supabase/schema.sql` in the Supabase SQL Editor, or apply the migration in `supabase/migrations/` using your preferred Supabase workflow.

The schema includes products, profiles, categories, click events, favorites, promotions, reports, promotion interests, RLS policies, storage setup and click-tracking functions.

## Promotion payments

Paid promotion checkout is intentionally **disabled** for the current version. Paid plans are displayed as **Coming Soon** and collect promotion interest instead. No fake live payment is used.

## Build

```bash
npm run build
```

A GitHub Actions workflow is included at `.github/workflows/build.yml` to verify the production build on pushes and pull requests.

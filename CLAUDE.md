# GenericOrNot

## Project Overview

Community-driven website where **Canadian shoppers** look up, vote on, and contribute evidence about whether store-brand/generic products (No Name, President's Choice, Great Value, Kirkland Signature, Life Brand, Compliments, Selection, Equate…) are as good as the name brands — so people buying something for the first time can see whether paying more for the brand is worth it.

**Live site:** https://genericornot.com
**GitHub repo:** https://github.com/seawaydigital/genericornot
**Domain registrar:** Porkbun (genericornot.com)
**Launch runbook:** `docs/LAUNCH.md` (deploy order, owner checklist, what changed)

## Tech Stack

- **Framework:** Next.js 16.4.5 (App Router) with TypeScript
- **Database:** Neon PostgreSQL (serverless, free tier, project "GenericOrNot", US East 2 Ohio)
- **ORM:** Prisma 7.10 — `@prisma/adapter-neon` in production; `@prisma/adapter-pg` is picked automatically for `localhost` URLs (see `src/lib/db.ts`). Config in `prisma.config.ts`.
- **Auth:** NextAuth.js v4 (Google + Facebook + Microsoft OAuth + Resend email magic link) + @auth/prisma-adapter v2. No nodemailer — the email provider is defined inline and sends via Resend's HTTP API.
- **Styling:** Tailwind CSS v4
- **Brand Logos:** logo.dev API (free tier 500K req/month, token in `NEXT_PUBLIC_LOGO_DEV_TOKEN`)
- **Email:** Resend API for magic link emails (free tier 3K/month)
- **Hosting:** Vercel (auto-deploys from GitHub master branch)
- **Testing:** Vitest 4.1 + React Testing Library + happy-dom 21 (476 tests)
- **Search:** PostgreSQL full-text search (tsvector + trigram) with a trigger keeping `searchVector` current. Falls back to Prisma `contains` if tsvector is unavailable.

## Visual Design

**Light editorial theme** inspired by Stripe/Apple aesthetics:
- **Background:** Warm off-white (`#fafaf8`)
- **Primary accent:** Navy blue (`#0d1b4a`) for links, buttons, branding
- **Typography:** DM Sans (body) + Instrument Serif (headlines/logo italic accent)
- **Cards:** White background with subtle gray border + shadow (defined as `glass` CSS utility)
- **Verdict colors:** Emerald (Generic Worth It), Amber (Close Enough), Red (Stick with Brand)
- **Footer tone:** Editorial — uppercase tracking, "Transparency is our only product", "Made in Canada"
- **Comparison page:** 2-column layout on desktop (main content + sticky vote sidebar); on mobile the vote card sits right after the products (single `VotePanel`, CSS grid placement)

## Project Structure

```
src/
  app/                    # Next.js App Router pages and API routes
    api/
      auth/[...nextauth]/ # Auth endpoints
      votes/              # GET own vote; POST cast/change vote → recount from Vote rows, revalidate page
      comparisons/        # GET list (effective-verdict filter), POST create (validated, 409 on duplicate)
      comparisons/[slug]/ # GET single (approved evidence only)
      comparisons/[slug]/flag/ # One "outdated" report per user (ComparisonFlag)
      evidence/           # POST (http(s) links only, held as PENDING) / GET (approved only)
      search/             # Search API
      admin/              # Moderation: approve/reject/archive/restore/markReviewed, approve/reject evidence
      categories/         # GET categories list
    auth/signin/          # Server page (reads callbackUrl/error) + SignInForm client component
    auth/verify/          # "Check your email" page after magic link sent
    compare/[slug]/       # Comparison page (ISR, generateStaticParams → []), opengraph-image.tsx
    categories/, categories/[slug]/  # Browse (savings sort ranks by unit-price savings in memory)
    top-rated/            # "Best Swaps": effective verdict SAME_QUALITY, by confidence then savings
    new/, search/, submit/, user/[username]/, admin/
    about/, privacy/, terms/, contact/  # privacy = PIPEDA/Law 25 basics; terms = Ontario law
    opengraph-image.tsx   # Site-wide share image
    sitemap.ts (revalidates hourly), robots.ts, not-found.tsx, error.tsx, global-error.tsx
  components/
    layout/               # Navbar (click menu, profile/admin links), Footer, SearchBar, Providers
    comparison/           # ProductCard, GenericStatusBadge, BrandHero, GenericAlternative, PriceComparison,
                          # VotePanel (logic) + VoteButtons/VoteBreakdown (presentational), EvidenceList,
                          # EvidenceForm, QuickFacts, FreshnessIndicator, FlagOutdatedButton, HealthNotice,
                          # AdminTools (admin-only inline "mark reviewed"/archive), VerdictBadge
    category/, home/
    admin/                # SubmissionQueue, EvidenceQueue, FlaggedQueue, ArchivedList
    ui/                   # Badge, Button, Card, ProductIcon, Skeleton, LegalPage
  lib/
    db.ts                 # Prisma client factory (Neon or pg adapter) + singleton
    auth.ts               # NextAuth config; pseudonymous usernames via username.ts
    verdict.ts            # computeVerdict, getDisplayVerdict (community vs research), computeSavings (unit-aware), tallyVotes
    verdict-labels.ts     # Shared wording for verdicts and vote options
    units.ts              # Package-size parser ("2 x 1.89 L", "100 tablets", "75 sq ft") + unit prices
    format.ts             # formatCAD, en-CA dates
    validation.ts         # cleanText, isSafeHttpUrl, parsePrice, field validators, LIMITS
    comparisons.ts        # effectiveVerdictWhere, toCardData (Decimal → number), card include
    site.ts               # SITE_URL, copy constants, safeCallbackPath (open-redirect guard)
    search.ts, slug.ts, seo.ts (WebPage JSON-LD, no fake ratings), rate-limit.ts, admin.ts, brand-logos.ts
    catalogue/            # Curated Canadian catalogue: types.ts, data.ts (71 entries + archive list),
                          # sync.ts (idempotent, transactional), constants.ts (system account)
  test/
    setup.ts, mock-prisma.ts (+ asMock for groupBy), fixtures.ts (typed model factories)
  types/next-auth.d.ts
prisma/
  schema.prisma           # Models + enums + searchVector tsvector field
  seed.ts                 # Non-destructive: runs the catalogue sync. --reset only on disposable dev DBs
  apply-search-migration.ts, search_vector_migration_backup/
scripts/
  sync-catalogue.ts       # Production-safe catalogue sync (dry run by default, --apply to write)
  promote-admin.ts
docs/LAUNCH.md            # Launch runbook
```

## Data Model

- **ProductComparison** — generic + name brand details (name, brand, store, price, **size**), community `verdict`/`confidenceScore`/`totalVotes` (computed **only** from Vote rows), `editorialVerdict` + `editorialNote` (research verdict), `featured`, `status` (PENDING/APPROVED/REJECTED/**ARCHIVED**), `lastVerifiedAt` ("reviewed by an editor"), `flaggedOutdated`/`flagCount`, `searchVector`
- **Vote** — one per user per comparison (upsert)
- **Evidence** — type, confidence tier (CONFIRMED/COMMUNITY/UNVERIFIED), **status** (PENDING/APPROVED/REJECTED; column default APPROVED so pre-existing rows stayed public; the API creates user evidence as PENDING)
- **ComparisonFlag** — one "outdated" report per user per comparison (unique userId+comparisonId), optional reason
- **User** — pseudonymous `username`, private `name`/`email`/`image`, `emailVerified` (needed by the magic-link provider), USER or ADMIN role
- **Category** — 8 flat categories (Grocery, Health & Pharmacy, Cleaning & Laundry, Baby & Kids, Personal Care, Pet Supplies, Electronics, Household); `comparisonCount` is recomputed, never incremented
- **Account/Session/VerificationToken** — NextAuth adapter tables

## Core Business Logic

### Verdicts (`src/lib/verdict.ts`)
- Community verdict: PENDING < 5 votes; SAME_QUALITY / CLOSE_ENOUGH / NOT_WORTH_IT when the plurality > 40%; MIXED otherwise.
- Confidence: `min(100, totalVotes * 2) * (topVotePercent / 100)`
- **Display verdict** (`getDisplayVerdict`): community verdict once it exists (≥ 5 votes); otherwise the research verdict (always labelled "Research"); otherwise "Awaiting Votes".
- Filters and "Best Swaps" use the same effective verdict (`effectiveVerdictWhere`).

### Savings
- `computeSavings(genericPrice, nameBrandPrice, genericSize?, nameBrandSize?)` compares **unit prices** when both sizes parse to the same unit kind (g, mL, count, m², m); otherwise package prices. Negative = generic costs more. Prices are approximate regular CAD shelf prices.

### Catalogue (`src/lib/catalogue/`)
- `data.ts` is the source of truth for starter content. Rules (enforced by `src/lib/__tests__/catalogue.test.ts`): unique permanent slugs; `editorialVerdict` only with CONFIRMED evidence that has a source URL; Canadian retailers only; no FDA references; parseable sizes.
- `sync.ts`: upsert by slug, never overrides an admin's ARCHIVED/REJECTED decision, replaces only system-authored evidence when it changed, clears `lastVerifiedAt` only when displayed facts change, archives `ARCHIVED_LEGACY_SLUGS`, recounts all tallies from Vote rows, recomputes category counts. One transaction; dry-run rolls back.
- System author: `admin@genericornot.com` → username `genericornot-team`, role USER (constants.ts).

### Moderation
- New comparisons and new evidence are PENDING until an admin approves them (`/admin`). Approving a comparison also approves the submitter's attached evidence and stamps `lastVerifiedAt`.
- Admins can "Mark reviewed" (clears reports, stamps date) from the dashboard or the inline AdminTools bar on any comparison page.

### Brand Logo Resolution (`src/lib/brand-logos.ts`)
- Exact brand-name → domain map (Canadian brands included; store brands map to their retailer). Unknown brands fall back to the category emoji — only add domains you're sure of.

### Search (`src/lib/search.ts`)
- Parses "X vs Y" queries; tsvector + `similarity()` ranking; falls back to Prisma `contains`.
- Re-run if needed: `npx tsx prisma/apply-search-migration.ts` (idempotent)

## Authentication

All providers are registered conditionally on env vars — the app boots cleanly with any subset configured; sign-in buttons show/hide automatically.

1. **Google OAuth** — `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — ✅ LIVE
2. **Facebook OAuth** — `FACEBOOK_CLIENT_ID` + `FACEBOOK_CLIENT_SECRET` — ✅ LIVE
3. **Microsoft OAuth** — `AZURE_AD_CLIENT_ID` + `AZURE_AD_CLIENT_SECRET` + `AZURE_AD_TENANT_ID` (default `common`) — ⏳ env vars not set
4. **Email Magic Link** — `RESEND_API_KEY` + `EMAIL_FROM` — ⏳ not set (recommended before launch)

- All OAuth providers use `allowDangerousEmailAccountLinking: true` (same email = one account).
- New users get a random pseudonymous username (`thrifty-loon-4821`); public profiles never show the real name, email or OAuth photo.
- Sign-in links carry `?callbackUrl=` (validated by `safeCallbackPath`) so people return to the page they were on. Signed-out votes are stored in sessionStorage and replayed after sign-in.
- JWT sessions: a role change takes effect after the user signs out and back in.

## CSS Design System (`src/app/globals.css`)

Custom Tailwind v4 utilities via `@utility`: `glass`, `glass-hover`, `gradient-mesh`, `accent-line`, `gradient-divider`, `animate-fade-up` / `animate-fade-in` (+ `delay-*`).
Color tokens: `--background: #fafaf8`, `--navy: #0d1b4a`, `--navy-light: #1e3a7a`

## Development Commands

```bash
npm run dev          # Start dev server (port 3000)
npm test             # Run Vitest tests (476)
npm run test:watch   # Watch mode
npm run lint         # ESLint
npx tsc --noEmit     # Type-check (tests included)
npm run build        # Build (includes prisma generate)
npx prisma db push   # Push schema to database (additive changes only in production!)
npx prisma db seed   # Upsert the Canadian catalogue (safe to re-run; never deletes)
npx tsx prisma/seed.ts --reset   # Dev only: wipe + reseed (refuses on prod / DBs with real users)
npx tsx scripts/sync-catalogue.ts           # Dry run against DATABASE_URL
npx tsx scripts/sync-catalogue.ts --apply   # Apply catalogue changes
npx tsx prisma/apply-search-migration.ts    # Full-text search indexes + trigger
```

Local Postgres works out of the box: a `localhost`/`127.0.0.1` `DATABASE_URL` uses node-postgres automatically (`DATABASE_ADAPTER=pg|neon` overrides).

## Admin Operations

```bash
# Promote a user to ADMIN role (must sign in at least once first)
npx tsx scripts/promote-admin.ts you@example.com
```

Point your local `.env` `DATABASE_URL` at the target database before running. Script is idempotent.

## Architecture Decisions

- **NextAuth v4** (not v5 beta) — stable API, `NextAuthOptions`, `getServerSession`
- **Prisma v7** with driver adapters — Neon in prod, pg locally
- **Prisma db push** (not migrate) — schema changes must stay additive so `db push` can run before code deploys
- **No fabricated data** — vote counts come only from Vote rows; editorial knowledge is shown as a separately labelled research verdict
- **ISR comparison pages** — cached 60 s, revalidated on vote/evidence/admin actions; per-user state (your vote) loads client-side
- **Rate limiting in route handlers** — in-memory, per instance (move to Upstash if abused)
- **Evidence pre-moderation** — claims about brands go public only after review
- **Archive, don't delete** — retired comparisons keep their votes/evidence and can be restored
- **Server components by default** — client components only for interactive parts
- **Flat categories** for v1
- **Brand-first UX** — cards lead with the name brand, show the generic's verdict and savings
- **Security headers** in `next.config.ts` (no CSP yet; HSTS comes from Vercel)

## Environment Variables

See `.env.example`:
- `DATABASE_URL` ✅, `NEXTAUTH_SECRET` ✅, `NEXTAUTH_URL` (`https://genericornot.com`) ✅
- `NEXT_PUBLIC_SITE_URL` — optional, defaults to `https://genericornot.com`
- `GOOGLE_*` ✅, `FACEBOOK_*` ✅, `AZURE_AD_*` ⏳, `RESEND_API_KEY` + `EMAIL_FROM` ⏳
- `NEXT_PUBLIC_LOGO_DEV_TOKEN` ✅
- `VOTE_MIN_ACCOUNT_AGE_MINUTES` — optional anti-brigading delay, default 0 (off)
- `DATABASE_ADAPTER` — optional override (`pg` / `neon`)
- `R2_*` — no longer used (upload code removed); safe to delete from Vercel

## Deployment

- **Vercel project:** genericornot (seawaydigital org); pushes to `master` auto-deploy
- **Domain:** genericornot.com (DNS via Porkbun → Vercel); www → 308 redirect to apex
- **Database:** Neon project "GenericOrNot", US East 2 (Ohio)
- **Deploy order for schema changes:** back up → `prisma db push` → (catalogue sync if needed) → merge to master. Full steps in `docs/LAUNCH.md`.
- **Google OAuth:** redirect URI `https://genericornot.com/api/auth/callback/google`
- **Facebook OAuth:** callback `https://genericornot.com/api/auth/callback/facebook`
- **FlexOffers:** domain verification meta tag (`fo-verify`) via root layout metadata
- **Admin:** andrew@seawaydigital.ca promoted to ADMIN role (username: andrew-austin-468 — legacy name-based handle; see LAUNCH.md to rename)

## What's NOT Yet Set Up

- [ ] **Production catalogue sync** — run `docs/LAUNCH.md` steps 1–3 (db push → sync → merge)
- [ ] **Email magic link** — Resend account + DNS verification + env vars
- [ ] **Microsoft OAuth** — Azure app registration + env vars
- [ ] **French (fr-CA)** — no i18n yet
- [ ] **Error tracking** — no Sentry; route-level and root error boundaries exist
- [ ] **Shared rate limiting** — in-memory only
- [ ] **Self-serve username change / account deletion** — handled by email for now (see privacy policy)
- [ ] **Facebook app icon** — 1024×1024 icon for the Meta listing (not blocking)

## Conventions

- Tests colocated in `__tests__/` directories; use `src/test/fixtures.ts` factories instead of hand-written model objects
- All tests, `npx tsc --noEmit` and `npm run lint` must pass before pushing
- **Never fabricate votes, reviews or verification dates.** Seed data starts at zero votes
- Research verdicts require CONFIRMED evidence with a source URL; taste/performance questions stay community-only
- Canadian English copy; prices in CAD (`formatCAD`); dates via `formatDate` (en-CA)
- New comparisons and evidence start PENDING and require admin approval
- One vote per user per comparison (upsert); one flag per user per comparison
- Slugs are permanent URLs — archive instead of renaming or deleting
- Schema changes must be additive (nullable columns / defaults) so `db push` is safe before deploy
- `tsconfig.json` excludes `prisma/`; shared logic used by scripts lives in `src/lib` with relative imports
- CSS uses `@utility` directives in globals.css for custom Tailwind v4 classes
- Navy (`#0d1b4a`) for accent/links; prefer gray-500+ for text on white for contrast
- Sign-in links point to `/auth/signin?callbackUrl=<current path>`, never `/api/auth/signin`

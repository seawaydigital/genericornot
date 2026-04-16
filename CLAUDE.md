# GenericOrNot

## Project Overview

Community-driven website where users look up, vote on, and contribute evidence about whether generic/store-brand products are the same quality as name-brand equivalents. Helps shoppers save money by surfacing community knowledge about which generics are worth buying.

**Live site:** https://genericornot.com
**GitHub repo:** https://github.com/seawaydigital/genericornot
**Domain registrar:** Porkbun (genericornot.com)

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router) with TypeScript
- **Database:** Neon PostgreSQL (serverless, free tier, project "GenericOrNot", US East 2 Ohio)
- **ORM:** Prisma v7 (uses `@prisma/adapter-neon` driver adapter, config in `prisma.config.ts`)
- **Auth:** NextAuth.js v4 with Google OAuth + Facebook OAuth + Microsoft (Azure AD) OAuth + Email Magic Link (Resend) + @auth/prisma-adapter v2
- **Styling:** Tailwind CSS v4
- **Image Storage:** Cloudflare R2 (S3-compatible, zero egress) — configured but not yet active
- **Brand Logos:** logo.dev API (free tier 500K req/month, token in `NEXT_PUBLIC_LOGO_DEV_TOKEN`)
- **Email:** Resend API for magic link emails (free tier 3K/month) — may switch to Google Workspace SMTP
- **Hosting:** Vercel (auto-deploys from GitHub master branch)
- **Testing:** Vitest 4.1.2 + React Testing Library + happy-dom (349 tests passing)
- **Search:** PostgreSQL full-text search (tsvector + trigram) — migration applied, 100 rows indexed. Falls back to Prisma `contains` if tsvector unavailable.

## Visual Design

**Light editorial theme** inspired by Stripe/Apple aesthetics:
- **Background:** Warm off-white (`#fafaf8`)
- **Primary accent:** Navy blue (`#0d1b4a`) for links, buttons, branding
- **Typography:** DM Sans (body) + Instrument Serif (headlines/logo italic accent)
- **Cards:** White background with subtle gray border + shadow (defined as `glass` CSS utility)
- **Verdict colors:** Emerald (worth it), Amber (close enough), Red (stick with brand)
- **Footer tone:** Editorial — uppercase tracking, "Transparency is our only product"
- **Comparison page:** 2-column layout on desktop (main content + sticky sidebar)

## Project Structure

```
src/
  app/                    # Next.js App Router pages and API routes
    api/
      auth/[...nextauth]/ # Auth endpoints (Google + Email)
      votes/              # Vote API (cast/change vote, recompute verdict)
      comparisons/        # Comparison CRUD (GET list/single, POST create)
      comparisons/[slug]/flag/ # Flag comparison as outdated
      evidence/           # Evidence submission (GET/POST)
      search/             # Search API
      admin/              # Admin actions (approve/reject pending submissions)
      upload/             # Image upload to R2
      categories/         # GET categories list
    auth/
      signin/             # Custom sign-in page (Google + Email magic link)
      verify/             # "Check your email" page after magic link sent
    compare/[slug]/       # Comparison detail page (2-column: BrandHero + sidebar)
    categories/           # Category index page
    categories/[slug]/    # Category browsing with filters
    top-rated/            # Top rated comparisons by confidence score
    new/                  # Recently added comparisons
    search/               # Search results page
    submit/               # Submit new comparison (auth-gated)
    user/[username]/      # User profile
    admin/                # Admin dashboard (admin-only)
    about/                # Editorial independence policy
    privacy/              # Privacy policy
    terms/                # Terms of service
    contact/              # Contact page with FAQ
    not-found.tsx         # Custom 404 page with search
    loading.tsx           # Homepage loading skeleton
    icon.svg              # Favicon (G? in emerald/dark)
    apple-icon.svg        # Apple touch icon
    sitemap.ts            # Dynamic sitemap generation
    robots.ts             # Robots.txt
  components/
    layout/               # Navbar, Footer, SearchBar, Providers (SessionProvider)
    comparison/           # ProductCard, VerdictBadge, GenericStatusBadge, BrandHero,
                          # GenericAlternative, QuickFacts, VoteButtons, VoteBreakdown,
                          # EvidenceList, EvidenceForm, FreshnessIndicator, FlagOutdatedButton
    category/             # CategoryGrid, CategoryFilter
    home/                 # TrendingSection, RecentActivity
    admin/                # SubmissionQueue
    ui/                   # Badge, Button, Card, ProductIcon, Skeleton
  lib/
    db.ts                 # Prisma client singleton (PrismaNeon adapter)
    auth.ts               # NextAuth config (Google + Facebook + AzureAD + Email providers, all conditional on env vars, JWT, Prisma adapter)
    verdict.ts            # Verdict computation (pure function) + savings calculation
    search.ts             # Search: tsvector full-text with trigram fallback → Prisma contains fallback
    slug.ts               # Slug generation with collision handling
    upload.ts             # R2 image upload (validate + upload)
    rate-limit.ts         # Rate limiting (in-memory sliding window, per API route)
    admin.ts              # requireAdmin() helper
    seo.ts                # SEO metadata helpers (brand-first titles, JSON-LD)
    brand-logos.ts        # Brand-to-domain mapping for logo.dev API (75+ brands)
  prisma/
    schema.prisma         # Database schema (all models + enums + searchVector tsvector field)
    seed.ts               # Seed data (120 comparisons: 100 US + 20 Canadian, uses PrismaNeon adapter)
    apply-search-migration.ts  # Script to apply full-text search indexes (run with npx tsx)
    search_vector_migration_backup/ # Raw SQL for tsvector migration
  test/
    setup.ts              # Vitest setup (jest-dom matchers, cleanup)
    mock-prisma.ts        # Reusable Prisma mock for tests
  types/
    next-auth.d.ts        # Session type augmentation (id, role, username)
```

## Data Model

- **ProductComparison** — central entity with generic + name brand details, verdict, confidence, status, lastVerifiedAt, flaggedOutdated, flagCount, searchVector (tsvector)
- **Vote** — one per user per comparison (upsert), triggers verdict recomputation
- **Evidence** — user-submitted proof with confidence tier (CONFIRMED/COMMUNITY/UNVERIFIED)
- **User** — Google/Facebook/Microsoft OAuth or Email magic link, auto-generated username, USER or ADMIN role. Same email across providers = same account (allowDangerousEmailAccountLinking: true on all providers)
- **Category** — flat list with emoji icons and comparison counts (8 categories)
- **Account/Session/VerificationToken** — NextAuth adapter tables (VerificationToken used for email magic links)

## Core Business Logic

### Verdict Computation (`src/lib/verdict.ts`)
- PENDING: < 5 votes
- SAME_QUALITY / CLOSE_ENOUGH / NOT_WORTH_IT: plurality > 40%
- MIXED: no category > 40%
- Confidence: `min(100, totalVotes * 2) * (topVotePercent / 100)`

### Savings: `((nameBrandPrice - genericPrice) / nameBrandPrice * 100)` — null if either price missing

### Brand Logo Resolution (`src/lib/brand-logos.ts`)
- Maps 75+ brand names to website domains
- `getBrandLogoUrl(brandName)` returns logo.dev URL or null if no token/no mapping
- Used by ProductIcon component with emoji fallback

### Search (`src/lib/search.ts`)
- Parses "X vs Y" queries
- Tries tsvector full-text search with `ts_rank()` + `similarity()` (trigram fuzzy matching)
- Falls back to Prisma `contains` if tsvector unavailable
- Migration already applied to production (100 rows indexed, trigger auto-updates new rows)
- Re-run if needed: `npx tsx prisma/apply-search-migration.ts` (idempotent)

## Authentication

All providers registered conditionally on env vars — app boots cleanly with any subset configured.
Sign-in buttons appear/hide automatically based on which providers are active.

Configured providers in `src/lib/auth.ts`:
1. **Google OAuth** — `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — ✅ LIVE
2. **Facebook OAuth** — `FACEBOOK_CLIENT_ID` + `FACEBOOK_CLIENT_SECRET` — ✅ LIVE (app published in Meta developer portal)
3. **Microsoft OAuth** — `AZURE_AD_CLIENT_ID` + `AZURE_AD_CLIENT_SECRET` + `AZURE_AD_TENANT_ID` (default: `common`) — ⏳ Code ready, env vars not yet set (Azure tenant setup pending)
4. **Email Magic Link** — `RESEND_API_KEY` + `EMAIL_FROM` — ⏳ Not yet set up (needs Resend account + domain verification)

All OAuth providers use `allowDangerousEmailAccountLinking: true` — same email across providers = same account, no duplicates.

Custom sign-in page at `/auth/signin` (server component passes available provider IDs to `SignInForm` client component).
Verify page at `/auth/verify` for email magic links.
Sign-in links throughout the app point to `/auth/signin` (not `/api/auth/signin`).

## CSS Design System (`src/app/globals.css`)

Custom Tailwind v4 utilities defined via `@utility`:
- `glass` — white card: `bg-white`, `border-gray-200`, `shadow-sm`
- `glass-hover` — hover state: lighter bg, darker border, larger shadow
- `gradient-mesh` — subtle navy radial gradients for hero background
- `accent-line` — 40px navy line before section headers
- `gradient-divider` — full-width gray gradient horizontal rule
- `animate-fade-up` / `animate-fade-in` — entrance animations with `delay-*` variants

Color tokens: `--background: #fafaf8`, `--navy: #0d1b4a`, `--navy-light: #1e3a7a`

## Development Commands

```bash
npm run dev          # Start dev server (port 3000)
npm test             # Run Vitest tests (349 tests)
npm run test:watch   # Watch mode
npm run build        # Build (includes prisma generate)
npx prisma db push   # Push schema to database
npx prisma db seed   # Seed database (120 comparisons: 100 US + 20 Canadian)
npx prisma studio    # Visual DB browser
npx prisma generate  # Regenerate Prisma client
npx tsx prisma/apply-search-migration.ts  # Apply full-text search indexes
```

## Admin Operations

```bash
# Promote a user to ADMIN role (must sign in at least once first)
npx tsx scripts/promote-admin.ts you@example.com
```

Point your local `.env` `DATABASE_URL` at the target database (prod or dev) before running. The user must have signed in at least once so their `User` row exists. Script is idempotent.

## Architecture Decisions

- **NextAuth v4** (not v5 beta) — stable API, all code uses `NextAuthOptions`, `getServerSession`
- **Prisma v7** with `@prisma/adapter-neon` — requires driver adapter for serverless Postgres
- **Prisma db push** (not migrate dev) — used for initial setup; search vector migration stored separately
- **prisma generate in build** — `package.json` build script runs `prisma generate && next build`; `postinstall` also runs `prisma generate` for Vercel deployments
- **Rate limiting in API route handlers** (not edge middleware) — edge middleware is stateless on Vercel
- **ISR caching** — comparison pages (60s), category pages (5min), homepage (2min), search (always dynamic)
- **Server components by default** — client components only for interactive parts (voting, forms, sign-in)
- **Flat categories** for v1 — hierarchical deferred to v2
- **Brand-first UX** — cards lead with name brand product, show generic status as verdict indicator
- **logo.dev for brand images** — free tier (500K/month), publishable token in NEXT_PUBLIC env var, emoji fallback when no token
- **Light editorial theme** — navy (#0d1b4a) primary accent, warm off-white background, DM Sans + Instrument Serif
- **2-column comparison page** — main content (2/3) + sticky sidebar (1/3) on desktop, stacks on mobile
- **Custom sign-in page** — `/auth/signin` split into server page + `SignInForm` client component; buttons auto-show based on registered providers
- **Multi-provider auth** — Google + Facebook active; Microsoft code ready (needs Azure env vars); email magic link code ready (needs Resend env vars)
- **Account linking** — `allowDangerousEmailAccountLinking: true` on all providers; same email = one account regardless of sign-in method

## Implementation Status

All phases COMPLETE. Site is live at genericornot.com.

### Completed Features
- Full CRUD: comparisons, votes, evidence, categories
- Google OAuth + Email Magic Link authentication
- Brand-first UI with logo.dev integration
- SEO (sitemap, robots.txt, JSON-LD, OpenGraph)
- Rate limiting on all mutation endpoints
- Vote integrity (1-hour account age minimum)
- Evidence confidence tiers (CONFIRMED/COMMUNITY/UNVERIFIED)
- Data freshness tracking + outdated flagging
- Admin dashboard for submission review
- Custom 404 page with search
- Loading skeletons for all data pages
- 120 seed comparisons (100 US + 20 Canadian)
- Full-text search upgrade (tsvector + trigram, with migration script)
- All 14 pages: home, categories, categories/[slug], top-rated, new, compare/[slug], search, submit, about, privacy, terms, contact, user/[username], admin

## Environment Variables

See `.env.example` for required variables:
- `DATABASE_URL` — Neon PostgreSQL connection string (set in .env and Vercel) ✅
- `NEXTAUTH_SECRET` — Random secret for JWT signing (set in Vercel) ✅
- `NEXTAUTH_URL` — `https://genericornot.com` (no trailing slash, no www) ✅
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth (set in Vercel, Google Cloud project "Generic Or Not") ✅
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` — Facebook OAuth (Meta app "Generic or Not", App ID 1875911233106909) ✅
- `AZURE_AD_CLIENT_ID` / `AZURE_AD_CLIENT_SECRET` / `AZURE_AD_TENANT_ID` — Microsoft OAuth (⏳ not yet set — Azure tenant setup needed)
- `RESEND_API_KEY` — Resend API for email magic links (⏳ not yet set — need resend.com account + domain verification)
- `EMAIL_FROM` — Sender for magic link emails (`GenericOrNot <noreply@genericornot.com>`)
- `NEXT_PUBLIC_LOGO_DEV_TOKEN` — logo.dev publishable API key (set in .env and Vercel) ✅
- `R2_*` — Cloudflare R2 credentials (⏳ not yet set — dead code, activate or delete)

## Deployment

- **Vercel project:** genericornot (seawaydigital org)
- **Auto-deploy:** pushes to `master` branch auto-deploy to production
- **Domain:** genericornot.com (DNS via Porkbun → Vercel)
- **Database:** Neon project "GenericOrNot", US East 2 (Ohio), seeded with 120 comparisons
- **Google OAuth:** Google Cloud project "Generic Or Not", consent screen published (External), credentials in Vercel ✅
- **Facebook OAuth:** Meta app "Generic or Not" (App ID 1875911233106909), published, credentials in Vercel ✅
- **Domain config:** genericornot.com → Production; www.genericornot.com → 308 redirect to genericornot.com (non-www is canonical)
- **FlexOffers:** Domain verification meta tag added to site header
- **Admin:** andrew@seawaydigital.ca promoted to ADMIN role (username: andrew-austin-468)

## What's NOT Yet Set Up

- [ ] **Microsoft OAuth** — Code in `src/lib/auth.ts` is ready. Needs Azure AD tenant + app registration. Set `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID=common` in Vercel. Azure setup blocked by account type (no subscription); try signing into portal.azure.com with a personal Microsoft account instead.
- [ ] **Email magic link provisioning** — Code ready, provider conditional on env vars. Need: resend.com account, verify genericornot.com domain in Porkbun DNS, add `RESEND_API_KEY` + `EMAIL_FROM` to Vercel.
- [ ] **Cloudflare R2** — Image upload API exists (`src/app/api/upload/`, `src/lib/upload.ts`) but no UI wires to it and R2 credentials not set. Recommend deleting dead code unless product photos are a priority.
- [ ] **Error tracking** — No Sentry. Route-level (`src/app/error.tsx`) and root (`src/app/global-error.tsx`) error boundaries exist as safety nets.
- [ ] **Facebook app icon** — Meta developer portal requires 1024×1024 icon for app store listing (not blocking functionality).

## What's DONE (recently completed)

- [x] **Google OAuth fixed and live** — Root cause was www/non-www domain mismatch (Vercel was redirecting genericornot.com → www; flipped so www → genericornot.com). Google Cloud redirect URI: `https://genericornot.com/api/auth/callback/google`
- [x] **Facebook OAuth live** — Meta app "Generic or Not" created, published, credentials in Vercel. Callback: `https://genericornot.com/api/auth/callback/facebook`
- [x] **Microsoft OAuth code added** — `AzureADProvider` wired in auth.ts + Microsoft button in sign-in form; awaiting Azure env vars
- [x] **Full-text search migration applied** — 100 rows indexed with tsvector + trigram; auto-update trigger active for new rows; `apply-search-migration.ts` rewritten to handle dollar-quoted SQL
- [x] **Admin promoted** — andrew@seawaydigital.ca → ADMIN (username: andrew-austin-468)
- [x] **Vercel domain fixed** — genericornot.com = Production; www = 308 redirect
- [x] Auth module crash-safe — all providers conditional on env vars
- [x] Sign-in page: server component + `SignInForm` client component; buttons auto-show/hide
- [x] Route-level + root error boundaries
- [x] Admin promotion CLI script (`scripts/promote-admin.ts`)
- [x] Vercel Analytics in layout
- [x] Light editorial theme, all 14 pages, 120 seed comparisons, Canadian products

## Conventions

- Tests colocated in `__tests__/` directories next to source
- All 349 tests must pass before pushing
- All new comparisons start as PENDING, require admin approval
- One vote per user per comparison (upsert pattern)
- Slugs auto-generated from product names with collision suffix
- Brand-first UX: cards lead with name brand, show generic status as indicator
- `tsconfig.json` excludes `prisma/` directory from TypeScript build checks (seed.ts uses different import patterns)
- CSS uses `@utility` directives in globals.css for custom Tailwind v4 classes
- Navy (`#0d1b4a`) for accent/links, grays for text hierarchy (900/700/500/400/300)
- Sign-in links point to `/auth/signin`, not `/api/auth/signin`

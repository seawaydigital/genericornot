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
- **Auth:** NextAuth.js v4 with Google OAuth + @auth/prisma-adapter v2
- **Styling:** Tailwind CSS v4
- **Image Storage:** Cloudflare R2 (S3-compatible, zero egress) — configured but not yet active
- **Brand Logos:** logo.dev API (free tier 500K req/month, token in `NEXT_PUBLIC_LOGO_DEV_TOKEN`)
- **Hosting:** Vercel (auto-deploys from GitHub master branch)
- **Testing:** Vitest 4.1.2 + React Testing Library + happy-dom (349 tests passing)
- **Search:** Prisma contains queries (v1); PostgreSQL full-text search migration ready at `prisma/search_vector_migration_backup/`

## Key Documents

- **Design spec:** `docs/superpowers/specs/2026-04-04-generic-or-not-design.md`
- **Implementation plan:** `docs/superpowers/plans/2026-04-04-generic-or-not.md`
- **UI redesign plan:** `.claude/plans/warm-tinkering-mountain.md`

## Project Structure

```
src/
  app/                    # Next.js App Router pages and API routes
    api/
      auth/[...nextauth]/ # Auth endpoints
      votes/              # Vote API (cast/change vote, recompute verdict)
      comparisons/        # Comparison CRUD (GET list/single, POST create)
      comparisons/[slug]/flag/ # Flag comparison as outdated
      evidence/           # Evidence submission (GET/POST)
      search/             # Search API (Prisma contains)
      admin/              # Admin actions (approve/reject pending submissions)
      upload/             # Image upload to R2
      categories/         # GET categories list
    compare/[slug]/       # Comparison detail page (BrandHero + GenericAlternative)
    categories/[slug]/    # Category browsing with filters
    search/               # Search results page
    submit/               # Submit new comparison (auth-gated)
    user/[username]/      # User profile
    admin/                # Admin dashboard (admin-only)
    about/                # Editorial independence policy
    icon.svg              # Favicon (G? in emerald/dark)
    apple-icon.svg        # Apple touch icon
  components/
    layout/               # Navbar, Footer, SearchBar, Providers (SessionProvider)
    comparison/           # ProductCard, VerdictBadge, GenericStatusBadge, BrandHero,
                          # GenericAlternative, QuickFacts, VoteButtons, VoteBreakdown,
                          # EvidenceList, EvidenceForm, FreshnessIndicator, FlagOutdatedButton
    category/             # CategoryGrid, CategoryFilter
    home/                 # TrendingSection, RecentActivity, RecentlyVerifiedSection
    admin/                # SubmissionQueue
    ui/                   # Badge, Button, Card, ProductIcon
  lib/
    db.ts                 # Prisma client singleton (PrismaNeon adapter)
    auth.ts               # NextAuth config (Google OAuth, JWT, Prisma adapter)
    verdict.ts            # Verdict computation (pure function) + savings calculation
    search.ts             # Search utilities (Prisma contains with "X vs Y" parsing)
    slug.ts               # Slug generation with collision handling
    upload.ts             # R2 image upload (validate + upload)
    rate-limit.ts         # Rate limiting (in-memory sliding window, per API route)
    admin.ts              # requireAdmin() helper
    seo.ts                # SEO metadata helpers (brand-first titles, JSON-LD)
    brand-logos.ts        # Brand-to-domain mapping for logo.dev API (75+ brands)
  prisma/
    schema.prisma         # Database schema (all models + enums)
    seed.ts               # Seed data (100 researched comparisons, uses PrismaNeon adapter)
    search_vector_migration_backup/ # Full-text search SQL migration (apply when needed)
  test/
    setup.ts              # Vitest setup (jest-dom matchers, cleanup)
    mock-prisma.ts        # Reusable Prisma mock for tests
  types/
    next-auth.d.ts        # Session type augmentation (id, role, username)
```

## Data Model

- **ProductComparison** — central entity with generic + name brand details, verdict, confidence, status, lastVerifiedAt, flaggedOutdated, flagCount
- **Vote** — one per user per comparison (upsert), triggers verdict recomputation
- **Evidence** — user-submitted proof with confidence tier (CONFIRMED/COMMUNITY/UNVERIFIED)
- **User** — Google OAuth, auto-generated username, USER or ADMIN role
- **Category** — flat list with emoji icons and comparison counts (8 categories)
- **Account/Session/VerificationToken** — NextAuth adapter tables

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

## UX Design: Brand-Name-First

The site uses a **brand-first mental model** — users think about the brand product (Advil, Tide) and want to know if a good generic exists. Key components:

- **ProductCard** — shows brand name product prominently, GenericStatusBadge below ("✓ Generic Worth It — Save 67%"), generic info as secondary text
- **BrandHero** — large brand product display at top of comparison detail page
- **GenericAlternative** — subordinate card showing generic product details
- **GenericStatusBadge** — verdict display with brand-first language (replaces VerdictBadge in card contexts)
- **ProductIcon** — renders brand logos from logo.dev API, falls back to category emoji

## Development Commands

```bash
npm run dev          # Start dev server (port 3000)
npm test             # Run Vitest tests (349 tests)
npm run test:watch   # Watch mode
npm run build        # Build (includes prisma generate)
npx prisma db push   # Push schema to database
npx prisma db seed   # Seed database (100 comparisons)
npx prisma studio    # Visual DB browser
npx prisma generate  # Regenerate Prisma client
```

## Architecture Decisions

- **NextAuth v4** (not v5 beta) — stable API, all code uses `NextAuthOptions`, `getServerSession`
- **Prisma v7** with `@prisma/adapter-neon` — requires driver adapter for serverless Postgres
- **Prisma db push** (not migrate dev) — used for initial setup; search vector migration stored separately
- **prisma generate in build** — `package.json` build script runs `prisma generate && next build`; `postinstall` also runs `prisma generate` for Vercel deployments
- **Rate limiting in API route handlers** (not edge middleware) — edge middleware is stateless on Vercel
- **ISR caching** — comparison pages (60s), category pages (5min), homepage (2min), search (always dynamic)
- **Server components by default** — client components only for interactive parts (voting, forms)
- **Flat categories** for v1 — hierarchical deferred to v2
- **Brand-first UX** — cards lead with name brand product, show generic status as verdict indicator
- **logo.dev for brand images** — free tier (500K/month), publishable token in NEXT_PUBLIC env var, emoji fallback when no token

## Implementation Status

### Phase 1: Foundation (Tasks 1-6) -- COMPLETE
- [x] Task 1: Next.js 15 project scaffolding (Next.js 16.2.2 / Tailwind v4)
- [x] Task 2: Testing infrastructure (Vitest 4.1.2 + React Testing Library)
- [x] Task 3: Prisma setup + full database schema (Prisma v7)
- [x] Task 4: Auth setup (NextAuth v4 + @auth/prisma-adapter v2)
- [x] Task 5: Verdict computation logic (20 tests)
- [x] Task 6: Seed data (51 comparisons across 8 categories)

### Phase 2: Core API (Tasks 7-12) -- COMPLETE
- [x] Task 7: Comparisons API — Read
- [x] Task 8: Comparisons API — Create (Submit)
- [x] Task 9: Votes API
- [x] Task 10: Evidence API
- [x] Task 11: Search API (PostgreSQL full-text)
- [x] Task 12: Admin API

### Phase 3: Pages & Components (Tasks 13-23) -- COMPLETE
- [x] Task 13: Layout, Navbar, shared UI
- [x] Task 14: VerdictBadge + ComparisonCard
- [x] Task 15: Homepage
- [x] Task 16: Comparison page — read-only display
- [x] Task 17: Comparison page — voting UI
- [x] Task 18: Comparison page — evidence form
- [x] Task 19: Category page
- [x] Task 20: Search results page
- [x] Task 21: Submit comparison page
- [x] Task 22: User profile page
- [x] Task 23: Admin dashboard

### Phase 4: Polish (Tasks 24-27) -- COMPLETE
- [x] Task 24: SEO (meta tags, sitemap, JSON-LD)
- [x] Task 25: Image upload (Cloudflare R2)
- [x] Task 26: Rate limiting
- [x] Task 27: Mobile responsiveness + final polish

### Post-Launch Enhancements -- COMPLETE
- [x] Evidence confidence tiers (CONFIRMED/COMMUNITY/UNVERIFIED)
- [x] Data freshness tracking (lastVerifiedAt + flaggedOutdated + flagCount)
- [x] Vote integrity (1-hour account age minimum)
- [x] Editorial independence policy (/about page)
- [x] Seed data upgraded to 100 researched comparisons with real evidence
- [x] Brand-name-first UI redesign (ProductCard, BrandHero, GenericAlternative, GenericStatusBadge)
- [x] Brand logo integration via logo.dev API (75+ brand mappings)
- [x] Custom favicon (G? in emerald/dark)

## Environment Variables

See `.env.example` for required variables:
- `DATABASE_URL` — Neon PostgreSQL connection string (set in .env and Vercel)
- `NEXTAUTH_SECRET` — Random secret for JWT signing (set in Vercel)
- `NEXTAUTH_URL` — Base URL (`http://localhost:3000` dev, `https://genericornot.com` prod)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials (NOT YET SET UP)
- `NEXT_PUBLIC_LOGO_DEV_TOKEN` — logo.dev publishable API key (set in .env and Vercel)
- `R2_*` — Cloudflare R2 credentials (NOT YET SET UP)

## Deployment

- **Vercel project:** genericornot (seawaydigital org)
- **Auto-deploy:** pushes to `master` branch auto-deploy to production
- **Domain:** genericornot.com (DNS via Porkbun → Vercel)
  - A record: `76.76.21.21` (Vercel recommends updating to `216.198.79.1`)
  - CNAME www: `cname.vercel-dns.com` (Vercel recommends `239442f2da81494d.vercel-dns-017.com`)
- **Database:** Neon project "GenericOrNot", US East 2 (Ohio), seeded with 100 comparisons

## Trust & Data Integrity

- **Evidence confidence tiers**: CONFIRMED (FDA/manufacturer docs), COMMUNITY (multiple reports), UNVERIFIED (single report)
- **Data freshness**: `lastVerifiedAt` timestamp on comparisons, color-coded freshness indicator (green/amber/red)
- **Outdated flagging**: Users can flag comparisons as outdated; auto-flags at 3+ reports
- **Vote integrity**: 1-hour account age minimum for voting to prevent brigading
- **Editorial independence**: `/about` page with stated policy — verdicts are never influenced by sponsors

## What's NOT Yet Set Up

- [ ] **Google OAuth** — GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not configured. Users cannot sign in, vote, or submit yet.
- [ ] **Cloudflare R2** — Image upload API exists but R2 credentials not set. Product images use logo.dev API instead.
- [ ] **Canadian product data** — Seed data is US-focused. Need to add No Name, President's Choice, Compliments, Great Value Canada comparisons.
- [ ] **Full-text search migration** — SQL at `prisma/search_vector_migration_backup/`. Currently using Prisma `contains` queries.
- [ ] **Analytics** — No Vercel Analytics or tracking yet.

## Conventions

- Tests colocated in `__tests__/` directories next to source
- TDD: write failing test first, then implement
- One commit per task completion
- All new comparisons start as PENDING, require admin approval
- One vote per user per comparison (upsert pattern)
- Slugs auto-generated from product names with collision suffix
- Brand-first UX: cards lead with name brand, show generic status as indicator
- `tsconfig.json` excludes `prisma/` directory from TypeScript build checks (seed.ts uses different import patterns)

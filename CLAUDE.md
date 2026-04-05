# GenericOrNot

## Project Overview

Community-driven website where users look up, vote on, and contribute evidence about whether generic/store-brand products are the same quality as name-brand equivalents. Helps shoppers save money by surfacing community knowledge about which generics are worth buying.

## Tech Stack

- **Framework:** Next.js 15 (App Router) with TypeScript
- **Database:** Neon PostgreSQL (serverless, free tier)
- **ORM:** Prisma (type-safe, migrations via `prisma migrate dev`)
- **Auth:** NextAuth.js v4 with Google OAuth + Prisma adapter
- **Styling:** Tailwind CSS
- **Image Storage:** Cloudflare R2 (S3-compatible, zero egress)
- **Hosting:** Vercel
- **Testing:** Vitest + React Testing Library + happy-dom
- **Search:** PostgreSQL full-text search (tsvector + pg_trgm)

## Key Documents

- **Design spec:** `docs/superpowers/specs/2026-04-04-generic-or-not-design.md`
- **Implementation plan:** `docs/superpowers/plans/2026-04-04-generic-or-not.md`

## Project Structure

```
src/
  app/                    # Next.js App Router pages and API routes
    api/
      auth/[...nextauth]/ # Auth endpoints
      votes/              # Vote API (cast/change)
      comparisons/        # Comparison CRUD
      evidence/           # Evidence submission
      search/             # Full-text search
      admin/              # Admin actions (approve/reject)
    compare/[slug]/       # Comparison page (core experience)
    categories/[slug]/    # Category browsing
    search/               # Search results
    submit/               # Submit new comparison
    user/[username]/      # User profile
    admin/                # Admin dashboard
  components/
    layout/               # Navbar, Footer, SearchBar
    comparison/           # VerdictBadge, ComparisonCard, VoteButtons, etc.
    category/             # CategoryGrid, CategoryFilter
    home/                 # TrendingSection, RecentActivity
    admin/                # SubmissionQueue
    ui/                   # Shared primitives (Badge, Button, Card)
  lib/
    db.ts                 # Prisma client singleton
    auth.ts               # NextAuth config
    verdict.ts            # Verdict computation (pure function)
    search.ts             # Search utilities
    slug.ts               # Slug generation
    upload.ts             # R2 image upload
    rate-limit.ts         # Rate limiting (in-memory, per API route)
    admin.ts              # Admin helpers
    seo.ts                # SEO metadata helpers
  prisma/
    schema.prisma         # Database schema
    seed.ts               # Seed data (50-100 comparisons)
```

## Data Model

- **ProductComparison** — the central entity, with generic + name brand product details, verdict, confidence score
- **Vote** — one per user per comparison (upsert), triggers verdict recomputation
- **Evidence** — user-submitted proof (manufacturer info, ingredients, photos, video links)
- **User** — Google OAuth, username auto-generated, USER or ADMIN role
- **Category** — flat list with emoji icons and comparison counts

## Core Business Logic

### Verdict Computation (`src/lib/verdict.ts`)
- PENDING: < 5 votes
- SAME_QUALITY / CLOSE_ENOUGH / NOT_WORTH_IT: plurality > 40%
- MIXED: no category > 40%
- Confidence: `min(100, totalVotes * 2) * (topVotePercent / 100)`

### Savings: `((nameBrandPrice - genericPrice) / nameBrandPrice * 100)` — null if either price missing

## Development Commands

```bash
npm run dev          # Start dev server
npm test             # Run Vitest tests
npm run test:watch   # Watch mode
npx prisma migrate dev --name <name>  # Create migration
npx prisma db seed   # Seed database
npx prisma studio    # Visual DB browser
```

## Architecture Decisions

- **NextAuth v4** (not v5 beta) — stable API, all code uses `NextAuthOptions`, `getServerSession`
- **Prisma migrate dev** (not db push) — maintains migration history, needed for search vector migration
- **Rate limiting in API route handlers** (not edge middleware) — edge middleware is stateless on Vercel
- **ISR caching** — comparison pages (60s), category pages (5min), homepage (2min), search (always dynamic)
- **Server components by default** — client components only for interactive parts (voting, forms)
- **Flat categories** for v1 — hierarchical deferred to v2

## Implementation Status

### Phase 1: Foundation (Tasks 1-6)
- [ ] Task 1: Next.js 15 project scaffolding
- [ ] Task 2: Testing infrastructure (Vitest)
- [ ] Task 3: Prisma setup + full database schema
- [ ] Task 4: Auth setup (NextAuth v4 + Google OAuth)
- [ ] Task 5: Verdict computation logic
- [ ] Task 6: Seed data (50-100 comparisons)

### Phase 2: Core API (Tasks 7-12)
- [ ] Task 7: Comparisons API — Read
- [ ] Task 8: Comparisons API — Create (Submit)
- [ ] Task 9: Votes API
- [ ] Task 10: Evidence API
- [ ] Task 11: Search API (PostgreSQL full-text)
- [ ] Task 12: Admin API

### Phase 3: Pages & Components (Tasks 13-23)
- [ ] Task 13: Layout, Navbar, shared UI
- [ ] Task 14: VerdictBadge + ComparisonCard
- [ ] Task 15: Homepage
- [ ] Task 16: Comparison page — read-only display
- [ ] Task 17: Comparison page — voting UI
- [ ] Task 18: Comparison page — evidence form
- [ ] Task 19: Category page
- [ ] Task 20: Search results page
- [ ] Task 21: Submit comparison page
- [ ] Task 22: User profile page
- [ ] Task 23: Admin dashboard

### Phase 4: Polish (Tasks 24-27)
- [ ] Task 24: SEO (meta tags, sitemap, JSON-LD)
- [ ] Task 25: Image upload (Cloudflare R2)
- [ ] Task 26: Rate limiting
- [ ] Task 27: Mobile responsiveness + final polish

## Environment Variables

See `.env.example` for required variables:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` — Random secret for JWT signing
- `NEXTAUTH_URL` — Base URL (http://localhost:3000 for dev)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials
- `R2_*` — Cloudflare R2 credentials (Task 25)

## Conventions

- Tests colocated in `__tests__/` directories next to source
- TDD: write failing test first, then implement
- One commit per task completion
- All new comparisons start as PENDING, require admin approval
- One vote per user per comparison (upsert pattern)
- Slugs auto-generated from product names with collision suffix

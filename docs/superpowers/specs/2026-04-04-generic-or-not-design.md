# GenericOrNot — Design Spec

## Context

People frequently discover (via YouTube videos, Reddit posts, factory workers' knowledge) that many generic/store-brand products are manufactured in the same facilities as name-brand equivalents — making them the same quality at a fraction of the price. But there's no single trusted place to look up whether a specific generic is worth buying. This site fills that gap: a community-powered database of generic-vs-name-brand product comparisons, with voting, evidence, and verified claims.

## Product Overview

**GenericOrNot** is a community-driven website where users can:
- **Look up** whether a specific generic product is the same quality as the name brand
- **Browse and discover** which generics are secretly the same as premium products
- **Vote and contribute** evidence about product quality, manufacturing origins, and ingredient comparisons

### Core User Personas
1. **Shopper** — at the store or planning a trip, wants a fast yes/no answer
2. **Browser** — exploring at home, curious about which generics are hidden gems
3. **Contributor** — has insider knowledge or personal experience, wants to share it

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 15 (App Router) | SSR for SEO, integrated API routes, server components |
| Database | Neon PostgreSQL | Serverless, autoscaling, 0.5GB free tier, scales to zero |
| ORM | Prisma | Type-safe database access, easy migrations |
| Auth | NextAuth.js (Auth.js) | Google social login, session management |
| Hosting | Vercel | Built for Next.js, 100GB bandwidth free tier |
| Image Storage | Cloudflare R2 | 10GB free, zero egress fees |
| Styling | Tailwind CSS | Utility-first, fast development |
| Search | PostgreSQL full-text search (v1) | Built-in, free, upgrade to Meilisearch later |

## Data Model

### ProductComparison
- `id` — UUID primary key
- `slug` — URL-friendly identifier (e.g., "kirkland-olive-oil-vs-california-olive-ranch")
- `genericProductName` — string
- `genericBrand` — string (e.g., "Kirkland Signature")
- `genericStore` — string (e.g., "Costco")
- `genericPrice` — decimal (optional)
- `genericImageUrl` — string (optional)
- `genericUpc` — string (optional)
- `nameBrandProductName` — string
- `nameBrand` — string (e.g., "California Olive Ranch")
- `nameBrandPrice` — decimal (optional)
- `nameBrandImageUrl` — string (optional)
- `nameBrandUpc` — string (optional)
- `categoryId` — foreign key to Category
- `verdict` — enum: SAME_QUALITY | CLOSE_ENOUGH | NOT_WORTH_IT | MIXED | PENDING
- `confidenceScore` — integer (0-100, computed from votes)
- `totalVotes` — integer
- `status` — enum: PENDING | APPROVED | FLAGGED
- `submittedById` — foreign key to User
- `createdAt`, `updatedAt` — timestamps

### Vote
- `id` — UUID
- `userId` — foreign key to User (unique per comparison)
- `comparisonId` — foreign key to ProductComparison
- `value` — enum: SAME_QUALITY | CLOSE_ENOUGH | NOT_WORTH_IT
- `createdAt` — timestamp
- Unique constraint: one vote per user per comparison

### Evidence
- `id` — UUID
- `comparisonId` — foreign key to ProductComparison
- `userId` — foreign key to User
- `type` — enum: MANUFACTURER_INFO | INGREDIENT_COMPARISON | PHOTO | VIDEO_LINK | OTHER
- `title` — string
- `content` — text (description/explanation)
- `url` — string (optional, for video links etc.)
- `imageUrl` — string (optional, for uploaded photos)
- `isVerified` — boolean (set by moderators)
- `upvotes` — integer
- `createdAt` — timestamp

### User
- `id` — UUID
- `email` — string (unique)
- `name` — string
- `image` — string (avatar URL from OAuth)
- `reputation` — integer (default 0, computed from contributions)
- `role` — enum: USER | MODERATOR | ADMIN
- `createdAt` — timestamp

### Category
- `id` — UUID
- `name` — string
- `slug` — string (URL-friendly)
- `icon` — string (emoji)
- `parentId` — self-referencing foreign key (nullable, for hierarchy)
- `comparisonCount` — integer (denormalized for display)

## Page Structure

### Homepage (`/`)
- **Nav bar** — logo, category link, top rated, new, submit, sign in
- **Hero section** — search bar (primary CTA), tagline, popular search suggestions
- **Trending comparisons** — 3-6 cards showing highest-traffic recent comparisons with verdict badges and savings percentages
- **Category grid** — 8 category tiles with icons and comparison counts
- **Recent contributions feed** — latest community activity (new evidence, new submissions)

### Category Page (`/categories/[slug]`)
- Category name and description
- Subcategory navigation (if applicable)
- Filterable list of comparisons: by verdict, store, confidence level
- Sort by: most voted, newest, highest savings

### Comparison Page (`/compare/[slug]`)
The core experience. Sections from top to bottom:
1. **Verdict banner** — colored badge (green/amber/red), confidence score, vote count, savings percentage
2. **Side-by-side products** — generic vs name brand with images, store, price
3. **Quick facts** — structured badges: same manufacturer?, ingredients match?, taste/quality comparison. Verified vs community-reported distinction.
4. **Vote section** — three buttons (Same Quality / Close Enough / Not Worth It), sign-in prompt for anonymous users
5. **Vote breakdown bar** — horizontal stacked bar showing vote distribution
6. **Evidence section** — expandable list of user-contributed evidence sorted by type and upvotes. Each entry shows type badge, verified status, contributor username, timestamp, and content.
7. **Add evidence CTA** — form to submit new evidence (requires auth)

### Search Results (`/search?q=`)
- Full-text search across product names, brands, stores
- Results show comparison cards with verdict badges inline
- Handles "X vs Y" queries and single product queries

### Submit Comparison (`/submit`)
- Requires authentication
- Form fields: generic product details, name brand details, category selection, initial evidence (optional)
- Goes to PENDING status for admin review
- User gets notification when approved

### User Profile (`/user/[username]`)
- Public profile showing contributions, votes cast, reputation score
- List of comparisons the user has submitted or contributed evidence to

### Admin Dashboard (`/admin`)
- Accessible to ADMIN and MODERATOR roles
- Pending submission review queue (approve/reject)
- Evidence verification (mark claims as verified)
- User management (assign moderator role)
- Flagged content review

## Verdict Computation

The verdict is computed from votes with evidence weighting:
- Each vote = 1 point
- Votes accompanied by evidence = 1.5 points (50% bonus)
- Verdict thresholds:
  - **SAME_QUALITY**: >50% weighted votes are "Same Quality"
  - **CLOSE_ENOUGH**: >50% weighted votes are "Close Enough"
  - **NOT_WORTH_IT**: >50% weighted votes are "Not Worth It"
  - **MIXED**: no category exceeds 50%
  - **PENDING**: fewer than 5 total votes
- Confidence score = (total weighted votes / 100) capped at 100, adjusted by vote concentration (higher if votes agree)

## Authentication Flow

1. Anonymous users can browse all pages and search freely
2. Sign-in via Google OAuth (NextAuth.js)
3. After sign-in, users can: vote on comparisons, submit evidence, submit new comparisons
4. One vote per user per comparison (can change vote)
5. Session-based auth with JWT tokens

## Search Implementation

v1 uses PostgreSQL full-text search:
- `tsvector` column on ProductComparison combining: genericProductName, genericBrand, genericStore, nameBrandProductName, nameBrand
- `ts_rank` for relevance sorting
- Trigram similarity (`pg_trgm`) for fuzzy matching / typo tolerance
- Upgrade path: Meilisearch Cloud (100k docs free) when search quality needs improvement

## Caching Strategy

- **Comparison pages**: ISR with 60-second revalidation. On-demand revalidation triggered by new votes.
- **Category pages**: ISR with 5-minute revalidation.
- **Homepage**: ISR with 2-minute revalidation.
- **Search**: Always dynamic (no caching).
- **API routes**: Cache-Control headers for GET endpoints.

## Image Handling

- Product images uploaded via comparison submission form
- Evidence photos uploaded via evidence contribution form
- Stored in Cloudflare R2 (S3-compatible API)
- Served through Next.js Image component for automatic optimization (WebP, responsive sizes)
- Max upload size: 5MB per image
- Accepted formats: JPEG, PNG, WebP

## Security & Abuse Prevention

- Rate limiting: 10 votes/min, 5 submissions/hour per authenticated user
- One vote per user per comparison (database unique constraint)
- CSRF protection via NextAuth.js
- Input sanitization on all user-submitted content
- Image upload validation (file type, size)
- Admin moderation queue for all new submissions
- Flagging system for inappropriate content

## Mobile Responsiveness

- All pages responsive from 320px to 1440px+
- Comparison page: stacks side-by-side products vertically on mobile
- Category grid: 2 columns on mobile, 4 on desktop
- Trending cards: horizontal scroll on mobile, grid on desktop
- Vote buttons: full-width stacked on mobile

## MVP Scope (v1)

### Included
- Homepage with search, trending, categories
- Comparison pages with verdict, voting, evidence
- Category browsing with filters
- Google sign-in authentication
- Submit new comparison form + admin review queue
- 50-100 seeded comparisons
- Basic admin dashboard (approve/reject)
- Mobile-responsive design
- SEO-optimized pages (meta tags, structured data, semantic URLs)

### Deferred to v2
- Reputation system and detailed user profiles
- Verified badges from moderators
- Comment threads on comparisons
- Store-specific landing pages
- Brand landing pages
- Email notifications

### Deferred to v3
- Public API
- Browser extension
- Mobile app / PWA
- Advanced search (Meilisearch)
- Community moderation tools

## Project Structure

```
generic-or-not/
  src/
    app/
      page.tsx                    # Homepage
      layout.tsx                  # Root layout with nav
      categories/
        [slug]/page.tsx           # Category page
      compare/
        [slug]/page.tsx           # Comparison page
      search/page.tsx             # Search results
      submit/page.tsx             # Submit comparison form
      user/
        [username]/page.tsx       # User profile
      admin/
        page.tsx                  # Admin dashboard
      api/
        auth/[...nextauth]/       # Auth endpoints
        votes/route.ts            # Vote API
        comparisons/route.ts      # Comparison CRUD
        evidence/route.ts         # Evidence submission
        search/route.ts           # Search API
        admin/route.ts            # Admin actions
    components/
      layout/
        Navbar.tsx
        Footer.tsx
        SearchBar.tsx
      comparison/
        VerdictBadge.tsx
        ComparisonCard.tsx
        ProductSideBySide.tsx
        QuickFacts.tsx
        VoteButtons.tsx
        VoteBreakdown.tsx
        EvidenceList.tsx
        EvidenceForm.tsx
      category/
        CategoryGrid.tsx
        CategoryFilter.tsx
      home/
        TrendingSection.tsx
        RecentActivity.tsx
      admin/
        SubmissionQueue.tsx
        EvidenceReview.tsx
      ui/                         # Shared UI primitives
    lib/
      db.ts                       # Prisma client
      auth.ts                     # NextAuth config
      search.ts                   # Search utilities
      verdict.ts                  # Verdict computation logic
      upload.ts                   # Image upload to R2
    prisma/
      schema.prisma               # Database schema
      seed.ts                     # Seed data (50-100 comparisons)
  public/
    images/
  tailwind.config.ts
  next.config.ts
  package.json
```

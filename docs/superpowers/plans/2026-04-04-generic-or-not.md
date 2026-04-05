# GenericOrNot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a community-driven website where users look up, vote on, and contribute evidence about whether generic products match name-brand quality.

**Architecture:** Next.js 15 App Router with server components for SEO-critical pages, client components for interactive features (voting, forms). PostgreSQL via Prisma for data, NextAuth for Google OAuth, Cloudflare R2 for images. ISR caching on read-heavy pages, dynamic rendering for search.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Prisma, Neon PostgreSQL, NextAuth.js v4, Cloudflare R2, Vitest, Vercel

**Spec:** `docs/superpowers/specs/2026-04-04-generic-or-not-design.md`

---

## Phase 1: Foundation (Tasks 1-6)

### Task 1: Next.js 15 Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js 15 project**

Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git`

Expected: Project files created in current directory.

- [ ] **Step 2: Verify dev server starts**

Run: `npm run dev` (stop after confirming it compiles)
Expected: Compiles successfully, page renders at localhost:3000

- [ ] **Step 3: Update root layout with app shell**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GenericOrNot — Is the generic version worth it?",
  description: "Community-powered comparisons to help you save money without sacrificing quality",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
```

Replace `src/app/page.tsx`:
```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">
        Generic<span className="text-emerald-400">Or</span>Not
      </h1>
      <p className="mt-4 text-gray-400">Coming soon</p>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 project with TypeScript and Tailwind"
```

---

### Task 2: Testing Infrastructure

**Files:**
- Create: `vitest.config.ts`, `src/test/setup.ts`
- Create: `src/app/__tests__/page.test.tsx`

- [ ] **Step 1: Install test dependencies**

Run: `npm install -D vitest @vitejs/plugin-react happy-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event`

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/__tests__/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Create test setup file**

Create `src/test/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add test script to package.json**

Add to `scripts` in `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write homepage smoke test**

Create `src/app/__tests__/page.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "../page";

describe("Homepage", () => {
  it("renders the site name", () => {
    render(<Home />);
    expect(screen.getByText(/GenericOrNot/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: 1 test passes

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Vitest testing infrastructure with React Testing Library"
```

---

### Task 3: Prisma Setup + Database Schema

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/db.ts`
- Create: `src/lib/__tests__/db.test.ts`
- Modify: `package.json` (add prisma scripts)

- [ ] **Step 1: Install Prisma**

Run: `npm install prisma @prisma/client && npx prisma init --datasource-provider postgresql`

- [ ] **Step 2: Write the complete Prisma schema**

Replace `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Verdict {
  SAME_QUALITY
  CLOSE_ENOUGH
  NOT_WORTH_IT
  MIXED
  PENDING
}

enum VoteValue {
  SAME_QUALITY
  CLOSE_ENOUGH
  NOT_WORTH_IT
}

enum ComparisonStatus {
  PENDING
  APPROVED
  REJECTED
}

enum EvidenceType {
  MANUFACTURER_INFO
  INGREDIENT_COMPARISON
  PHOTO
  VIDEO_LINK
  OTHER
}

enum UserRole {
  USER
  ADMIN
}

model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  name      String
  image     String?
  role      UserRole @default(USER)
  createdAt DateTime @default(now())

  votes       Vote[]
  evidence    Evidence[]
  comparisons ProductComparison[] @relation("SubmittedBy")

  // NextAuth fields
  accounts Account[]
  sessions Session[]
}

model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Category {
  id              String @id @default(uuid())
  name            String
  slug            String @unique
  icon            String
  comparisonCount Int    @default(0)

  comparisons ProductComparison[]
}

model ProductComparison {
  id                   String           @id @default(uuid())
  slug                 String           @unique
  genericProductName   String
  genericBrand         String
  genericStore         String
  genericPrice         Decimal?
  genericImageUrl      String?
  nameBrandProductName String
  nameBrand            String
  nameBrandPrice       Decimal?
  nameBrandImageUrl    String?
  categoryId           String
  verdict              Verdict          @default(PENDING)
  confidenceScore      Int              @default(0)
  totalVotes           Int              @default(0)
  status               ComparisonStatus @default(PENDING)
  rejectionReason      String?
  submittedById        String?
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt

  category    Category   @relation(fields: [categoryId], references: [id])
  submittedBy User?      @relation("SubmittedBy", fields: [submittedById], references: [id])
  votes       Vote[]
  evidence    Evidence[]

  @@index([status])
  @@index([categoryId])
  @@index([verdict])
  @@index([totalVotes(sort: Desc)])
}

model Vote {
  id           String    @id @default(uuid())
  userId       String
  comparisonId String
  value        VoteValue
  createdAt    DateTime  @default(now())

  user       User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  comparison ProductComparison @relation(fields: [comparisonId], references: [id], onDelete: Cascade)

  @@unique([userId, comparisonId])
}

model Evidence {
  id           String       @id @default(uuid())
  comparisonId String
  userId       String
  type         EvidenceType
  title        String
  content      String
  url          String?
  imageUrl     String?
  createdAt    DateTime     @default(now())

  comparison ProductComparison @relation(fields: [comparisonId], references: [id], onDelete: Cascade)
  user       User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([comparisonId])
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `src/lib/db.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Create .env.example**

Create `.env.example`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/genericornot"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

- [ ] **Step 5: Run initial migration and generate client**

Run: `npx prisma migrate dev --name init`
Expected: Migration created and applied, Prisma Client generated.

Note: Use `prisma migrate dev` (not `db push`) throughout the project to maintain migration history. This matters for Task 11 which adds a search migration.

- [ ] **Step 6: Write schema validation test**

Create `src/lib/__tests__/db.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";

describe("Database schema", () => {
  it("exports Verdict enum values", () => {
    const values = Object.values(Prisma.ModelName);
    expect(values).toContain("User");
    expect(values).toContain("ProductComparison");
    expect(values).toContain("Vote");
    expect(values).toContain("Evidence");
    expect(values).toContain("Category");
  });

  it("has the expected enums", () => {
    // These will fail to compile if the schema is wrong
    const verdict: Prisma.EnumVerdictFilter = { equals: "SAME_QUALITY" };
    const vote: Prisma.EnumVoteValueFilter = { equals: "SAME_QUALITY" };
    const status: Prisma.EnumComparisonStatusFilter = { equals: "PENDING" };
    const evidenceType: Prisma.EnumEvidenceTypeFilter = { equals: "MANUFACTURER_INFO" };
    const role: Prisma.EnumUserRoleFilter = { equals: "USER" };
    expect(verdict.equals).toBe("SAME_QUALITY");
    expect(vote.equals).toBe("SAME_QUALITY");
    expect(status.equals).toBe("PENDING");
    expect(evidenceType.equals).toBe("MANUFACTURER_INFO");
    expect(role.equals).toBe("USER");
  });
});
```

- [ ] **Step 7: Run tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema with all models, enums, and relations"
```

---

### Task 4: Auth Setup (NextAuth.js v5)

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/__tests__/auth.test.ts`

- [ ] **Step 1: Install NextAuth v4 and Prisma adapter**

Run: `npm install next-auth@4 @next-auth/prisma-adapter`

Note: Using v4 (stable) not v5 (beta). V4 uses `NextAuthOptions`, `getServerSession`, and `import GoogleProvider from "next-auth/providers/google"` which is what all subsequent tasks use.

- [ ] **Step 2: Write auth config test**

Create `src/lib/__tests__/auth.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { authOptions } from "../auth";

describe("Auth config", () => {
  it("has Google provider configured", () => {
    expect(authOptions.providers).toBeDefined();
    expect(authOptions.providers.length).toBeGreaterThan(0);
  });

  it("uses JWT session strategy", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/auth.test.ts`
Expected: FAIL — cannot find module `../auth`

- [ ] **Step 4: Create auth config**

Create `src/lib/auth.ts`:
```ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./db";

function generateUsername(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 20);
  const suffix = Math.floor(Math.random() * 1000);
  return `${base}-${suffix}`;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, username: true },
        });
        token.role = dbUser?.role ?? "USER";
        token.username = dbUser?.username ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.name && user.id) {
        const username = generateUsername(user.name);
        await prisma.user.update({
          where: { id: user.id },
          data: { username },
        });
      }
    },
  },
  pages: {
    signIn: "/",
  },
};
```

- [ ] **Step 5: Create auth route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:
```ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 6: Create session type augmentation**

Create `src/types/next-auth.d.ts`:
```ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: string;
      username: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    username: string;
  }
}
```

- [ ] **Step 7: Run tests**

Run: `npm test -- src/lib/__tests__/auth.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add NextAuth.js with Google OAuth and Prisma adapter"
```

---

### Task 5: Verdict Computation Logic

**Files:**
- Create: `src/lib/verdict.ts`, `src/lib/__tests__/verdict.test.ts`

- [ ] **Step 1: Write exhaustive tests FIRST**

Create `src/lib/__tests__/verdict.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeVerdict, computeSavings } from "../verdict";

describe("computeVerdict", () => {
  it("returns PENDING when fewer than 5 total votes", () => {
    const result = computeVerdict({ sameQuality: 3, closeEnough: 1, notWorthIt: 0 });
    expect(result.verdict).toBe("PENDING");
    expect(result.confidenceScore).toBe(0);
  });

  it("returns PENDING for 0 votes", () => {
    const result = computeVerdict({ sameQuality: 0, closeEnough: 0, notWorthIt: 0 });
    expect(result.verdict).toBe("PENDING");
  });

  it("returns SAME_QUALITY when plurality exceeds 40%", () => {
    const result = computeVerdict({ sameQuality: 7, closeEnough: 2, notWorthIt: 1 });
    expect(result.verdict).toBe("SAME_QUALITY");
  });

  it("returns CLOSE_ENOUGH when plurality exceeds 40%", () => {
    const result = computeVerdict({ sameQuality: 1, closeEnough: 7, notWorthIt: 2 });
    expect(result.verdict).toBe("CLOSE_ENOUGH");
  });

  it("returns NOT_WORTH_IT when plurality exceeds 40%", () => {
    const result = computeVerdict({ sameQuality: 1, closeEnough: 2, notWorthIt: 7 });
    expect(result.verdict).toBe("NOT_WORTH_IT");
  });

  it("returns MIXED when no category exceeds 40%", () => {
    // 34%, 33%, 33%
    const result = computeVerdict({ sameQuality: 34, closeEnough: 33, notWorthIt: 33 });
    expect(result.verdict).toBe("MIXED");
  });

  it("handles exact 40% boundary — returns the verdict", () => {
    // 40%, 30%, 30% — 40% is not >40%, it equals 40%
    const result = computeVerdict({ sameQuality: 4, closeEnough: 3, notWorthIt: 3 });
    // Per spec: "> 40%" means strictly greater. 40% exactly = MIXED
    expect(result.verdict).toBe("MIXED");
  });

  it("handles 41% — returns the verdict", () => {
    // need >40%. 41/100 = 41%
    const result = computeVerdict({ sameQuality: 41, closeEnough: 30, notWorthIt: 29 });
    expect(result.verdict).toBe("SAME_QUALITY");
  });

  it("computes confidence: 30 votes, 70% agree = 42", () => {
    // 21 sameQuality, 5 closeEnough, 4 notWorthIt = 30 total, 70% top
    const result = computeVerdict({ sameQuality: 21, closeEnough: 5, notWorthIt: 4 });
    expect(result.confidenceScore).toBe(42);
  });

  it("computes confidence: 200 votes, 90% agree = 90", () => {
    const result = computeVerdict({ sameQuality: 180, closeEnough: 10, notWorthIt: 10 });
    expect(result.confidenceScore).toBe(90);
  });

  it("caps confidence at 100", () => {
    const result = computeVerdict({ sameQuality: 1000, closeEnough: 0, notWorthIt: 0 });
    expect(result.confidenceScore).toBeLessThanOrEqual(100);
  });

  it("confidence is 0 for PENDING verdicts", () => {
    const result = computeVerdict({ sameQuality: 2, closeEnough: 1, notWorthIt: 0 });
    expect(result.confidenceScore).toBe(0);
  });

  it("returns totalVotes in result", () => {
    const result = computeVerdict({ sameQuality: 10, closeEnough: 5, notWorthIt: 3 });
    expect(result.totalVotes).toBe(18);
  });
});

describe("computeSavings", () => {
  it("computes savings percentage", () => {
    expect(computeSavings(12.99, 21.99)).toBe(41);
  });

  it("returns null when generic price is missing", () => {
    expect(computeSavings(null, 21.99)).toBeNull();
  });

  it("returns null when name brand price is missing", () => {
    expect(computeSavings(12.99, null)).toBeNull();
  });

  it("returns null when both prices missing", () => {
    expect(computeSavings(null, null)).toBeNull();
  });

  it("returns null when name brand price is 0", () => {
    expect(computeSavings(5, 0)).toBeNull();
  });

  it("returns 0 when prices are equal", () => {
    expect(computeSavings(10, 10)).toBe(0);
  });

  it("returns negative when generic is more expensive", () => {
    expect(computeSavings(25, 20)).toBe(-25);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/lib/__tests__/verdict.test.ts`
Expected: FAIL — cannot find module `../verdict`

- [ ] **Step 3: Implement verdict logic**

Create `src/lib/verdict.ts`:
```ts
import type { Verdict } from "@prisma/client";

interface VoteCounts {
  sameQuality: number;
  closeEnough: number;
  notWorthIt: number;
}

interface VerdictResult {
  verdict: Verdict;
  confidenceScore: number;
  totalVotes: number;
}

export function computeVerdict(votes: VoteCounts): VerdictResult {
  const totalVotes = votes.sameQuality + votes.closeEnough + votes.notWorthIt;

  if (totalVotes < 5) {
    return { verdict: "PENDING", confidenceScore: 0, totalVotes };
  }

  const percentages = {
    sameQuality: (votes.sameQuality / totalVotes) * 100,
    closeEnough: (votes.closeEnough / totalVotes) * 100,
    notWorthIt: (votes.notWorthIt / totalVotes) * 100,
  };

  const topPercent = Math.max(percentages.sameQuality, percentages.closeEnough, percentages.notWorthIt);

  let verdict: Verdict;
  if (topPercent <= 40) {
    verdict = "MIXED";
  } else if (percentages.sameQuality === topPercent) {
    verdict = "SAME_QUALITY";
  } else if (percentages.closeEnough === topPercent) {
    verdict = "CLOSE_ENOUGH";
  } else {
    verdict = "NOT_WORTH_IT";
  }

  const confidenceScore = Math.round(Math.min(100, totalVotes * 2) * (topPercent / 100));

  return { verdict, confidenceScore, totalVotes };
}

export function computeSavings(
  genericPrice: number | null,
  nameBrandPrice: number | null
): number | null {
  if (genericPrice == null || nameBrandPrice == null || nameBrandPrice === 0) {
    return null;
  }
  return Math.round(((nameBrandPrice - genericPrice) / nameBrandPrice) * 100);
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/lib/__tests__/verdict.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/verdict.ts src/lib/__tests__/verdict.test.ts
git commit -m "feat: add verdict computation and savings calculation with tests"
```

---

### Task 6: Seed Data

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma seed script)

- [ ] **Step 1: Add ts-node for seed execution**

Run: `npm install -D tsx`

Add to `package.json`:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 2: Write seed script**

Create `prisma/seed.ts` with:
- 8 categories with emoji icons (Grocery, Health & OTC, Cleaning, Baby & Kids, Personal Care, Pet Supplies, Electronics, Home & Garden)
- 1 admin user (you)
- 50+ product comparisons across all categories with realistic names, brands, stores, and prices
- Vote distributions that produce a mix of verdicts (SAME_QUALITY, CLOSE_ENOUGH, NOT_WORTH_IT, MIXED, PENDING)
- 10-15 evidence entries across popular comparisons
- Use the `computeVerdict` function from `src/lib/verdict.ts` to set verdict and confidence on each comparison

The seed script should:
1. Clear existing data (in correct order for foreign keys)
2. Create categories
3. Create admin user
4. Create comparisons with pre-computed verdicts
5. Create sample votes
6. Create sample evidence
7. Update category comparison counts

Include well-known real-world examples:
- Kirkland Signature batteries vs Duracell (Costco, SAME_QUALITY)
- Great Value ibuprofen vs Advil (Walmart, SAME_QUALITY)
- Kirkland olive oil vs California Olive Ranch (Costco, SAME_QUALITY)
- Store brand Q-Tips vs Q-Tips (NOT_WORTH_IT)
- Aldi cereals vs name brands (CLOSE_ENOUGH)
- Generic Claritin vs Claritin (SAME_QUALITY)
- etc.

- [ ] **Step 3: Run database migration and seed**

Run: `npx prisma db seed` (tables already exist from Task 3 migration)
Expected: Seed data created successfully

- [ ] **Step 4: Verify with Prisma Studio**

Run: `npx prisma studio` (opens browser, verify data looks correct, then close)

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add seed data with 50+ product comparisons across 8 categories"
```

---

## Phase 2: Core API Routes (Tasks 7-12)

### Task 7: Comparisons API — Read

**Files:**
- Create: `src/app/api/comparisons/route.ts`, `src/app/api/comparisons/[slug]/route.ts`
- Create: `src/app/api/comparisons/__tests__/route.test.ts`

- [ ] **Step 1: Write tests for GET list endpoint**

Test cases:
- Returns paginated comparisons (default 20 per page, only APPROVED status)
- Filters by categoryId query param
- Filters by verdict query param
- Sorts by `totalVotes` (default), `createdAt`, `confidenceScore`
- Returns correct shape: `{ comparisons: [...], total: number, page: number }`

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/app/api/comparisons/__tests__/route.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement GET list handler**

In `src/app/api/comparisons/route.ts`:
- Parse query params: `page`, `limit`, `categoryId`, `verdict`, `sort`
- Query with Prisma including category relation
- Only return APPROVED comparisons for public API
- Return JSON with pagination metadata

- [ ] **Step 4: Write tests for GET single comparison**

Test cases:
- Returns comparison by slug with category, votes count, evidence
- Returns 404 for non-existent slug
- Only returns APPROVED comparisons

- [ ] **Step 5: Implement GET single handler**

In `src/app/api/comparisons/[slug]/route.ts`:
- Find by slug, include category and evidence (ordered by createdAt)
- Include vote breakdown (count by value)
- Return 404 if not found or not APPROVED

- [ ] **Step 6: Run all tests**

Run: `npm test -- src/app/api/comparisons`
Expected: All pass

- [ ] **Step 7: Commit**

```bash
git add src/app/api/comparisons/
git commit -m "feat: add comparisons read API with pagination, filtering, and sorting"
```

---

### Task 8: Comparisons API — Create (Submit)

**Files:**
- Create: `src/lib/slug.ts`, `src/lib/__tests__/slug.test.ts`
- Modify: `src/app/api/comparisons/route.ts`

- [ ] **Step 1: Write slug utility tests**

Test: generates slug from product names, handles special characters, appends suffix on collision.

- [ ] **Step 2: Implement slug utility**

Create `src/lib/slug.ts`:
```ts
import { prisma } from "./db";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80)
    .replace(/^-|-$/g, "");
}

export async function generateUniqueSlug(
  genericName: string,
  nameBrandName: string
): Promise<string> {
  const base = slugify(`${genericName} vs ${nameBrandName}`);
  let slug = base;
  let counter = 2;

  while (await prisma.productComparison.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}
```

- [ ] **Step 3: Write POST handler tests**

Test cases:
- Creates comparison with PENDING status (requires auth)
- Auto-generates slug
- Returns 401 when not authenticated
- Validates required fields (genericProductName, genericBrand, genericStore, nameBrandProductName, nameBrand, categoryId)
- Returns duplicate warning when similar comparison exists

- [ ] **Step 4: Implement POST handler**

Add POST to `src/app/api/comparisons/route.ts`:
- Require auth via `getServerSession`
- Validate input fields
- Check for duplicates (fuzzy match on product names)
- Generate unique slug
- Create with PENDING status
- Return created comparison

- [ ] **Step 5: Run tests**

Run: `npm test -- src/app/api/comparisons/ src/lib/__tests__/slug.test.ts`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add src/lib/slug.ts src/lib/__tests__/slug.test.ts src/app/api/comparisons/
git commit -m "feat: add comparison submission with slug generation and duplicate detection"
```

---

### Task 9: Votes API

**Files:**
- Create: `src/app/api/votes/route.ts`, `src/app/api/votes/__tests__/route.test.ts`

- [ ] **Step 1: Write vote API tests**

Test cases:
- Casts a new vote (upsert), returns updated verdict
- Changes existing vote, verdict recomputes correctly
- Returns 401 when not authenticated
- Returns 404 for non-existent comparison
- Returns 400 for invalid vote value
- Enforces one vote per user per comparison (upsert, not duplicate)

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement POST handler**

In `src/app/api/votes/route.ts`:
- Require auth
- Validate: `comparisonId` exists and is APPROVED, `value` is valid enum
- Upsert vote (unique on userId + comparisonId)
- Count all votes for the comparison
- Call `computeVerdict` with vote counts
- Update comparison's `verdict`, `confidenceScore`, `totalVotes`
- Return updated verdict data

- [ ] **Step 4: Run tests**

Run: `npm test -- src/app/api/votes/`
Expected: All pass

- [ ] **Step 5: Commit**

```bash
git add src/app/api/votes/
git commit -m "feat: add votes API with upsert and verdict recomputation"
```

---

### Task 10: Evidence API

**Files:**
- Create: `src/app/api/evidence/route.ts`, `src/app/api/evidence/__tests__/route.test.ts`

- [ ] **Step 1: Write evidence API tests**

Test cases:
- POST creates evidence (requires auth), returns created evidence
- Validates type enum, requires title and content
- Returns 401 when not authenticated
- Returns 404 for non-existent comparison
- GET returns evidence for a comparison, sorted by createdAt desc

- [ ] **Step 2: Implement handlers**

POST: require auth, validate fields, create evidence entry.
GET: query by comparisonId with user info, sort chronologically.

- [ ] **Step 3: Run tests**

Run: `npm test -- src/app/api/evidence/`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add src/app/api/evidence/
git commit -m "feat: add evidence API for submitting and retrieving evidence"
```

---

### Task 11: Search API

**Files:**
- Create: `src/lib/search.ts`, `src/lib/__tests__/search.test.ts`
- Create: `src/app/api/search/route.ts`
- Create: `prisma/migrations/` (search migration)

- [ ] **Step 1: Create migration for full-text search**

Create a raw SQL migration that:
- Enables `pg_trgm` extension
- Adds `searchVector` tsvector column to ProductComparison
- Creates GIN index on the tsvector column
- Creates trigger to auto-update searchVector on INSERT/UPDATE
- Populates searchVector for existing rows

Run: `npx prisma migrate dev --name add-search-vector`

- [ ] **Step 2: Write search utility tests**

Test cases:
- Single word query finds matching comparisons
- Multi-word query works
- "X vs Y" query is parsed and both terms searched
- Returns results sorted by relevance
- Only returns APPROVED comparisons
- Returns empty array for no matches
- Handles special characters safely

- [ ] **Step 3: Implement search utility**

Create `src/lib/search.ts` with:
- `searchComparisons(query: string, page: number, limit: number)` function
- Parse "X vs Y" queries into component terms
- Build `ts_query` from terms
- Fall back to trigram similarity for fuzzy matching
- Return results with relevance ranking

- [ ] **Step 4: Create search API route**

`src/app/api/search/route.ts`:
- GET handler reading `q`, `page`, `limit` from search params
- Return `{ results: [...], total: number }`
- No caching (always dynamic)

- [ ] **Step 5: Run tests**

Run: `npm test -- src/lib/__tests__/search.test.ts src/app/api/search/`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add src/lib/search.ts src/lib/__tests__/search.test.ts src/app/api/search/ prisma/
git commit -m "feat: add PostgreSQL full-text search with trigram fallback"
```

---

### Task 12: Admin API

**Files:**
- Create: `src/app/api/admin/route.ts`, `src/app/api/admin/__tests__/route.test.ts`
- Create: `src/lib/admin.ts`

- [ ] **Step 1: Write admin helper and API tests**

Test cases:
- `requireAdmin` returns 403 for non-admin users
- GET returns pending submissions (admin only)
- POST approve sets status to APPROVED, increments category count
- POST reject sets status to REJECTED with optional reason
- Returns 401 for unauthenticated, 403 for non-admin

- [ ] **Step 2: Implement admin helper**

Create `src/lib/admin.ts`:
```ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if (session.user.role !== "ADMIN") return { error: "Forbidden", status: 403 };
  return { session };
}
```

- [ ] **Step 3: Implement admin API route**

GET: list pending comparisons with submitter info.
POST with `action: "approve" | "reject"`, `comparisonId`, optional `reason`.
On approve: set APPROVED, increment category comparisonCount.
On reject: set REJECTED, store rejectionReason.

- [ ] **Step 4: Run tests**

Run: `npm test -- src/app/api/admin/`
Expected: All pass

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/ src/lib/admin.ts
git commit -m "feat: add admin API for reviewing and approving submissions"
```

---

## Phase 3: Pages & Components (Tasks 13-23)

### Task 13: Layout, Navbar, and Shared UI

**Files:**
- Create: `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/SearchBar.tsx`
- Create: `src/components/ui/Badge.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write Navbar test**

Test: renders logo, nav links (Categories, Top Rated, New), Submit link, Sign In button. Shows user avatar when authenticated.

- [ ] **Step 2: Build Navbar component**

Client component with:
- Logo linking to `/`
- Nav links: Categories, Top Rated, New
- Submit link (visible always, redirects to sign-in if not authenticated)
- Sign In button (NextAuth `signIn`/`signOut`)
- Mobile hamburger menu
- "Top Rated" links to `/categories?sort=confidence` and "New" links to `/categories?sort=newest` (category listing with pre-set sorts)

- [ ] **Step 3: Build Footer**

Simple footer with links and "GenericOrNot" branding.

- [ ] **Step 4: Build SearchBar**

Client component: input with search icon, navigates to `/search?q=...` on submit. Supports popular search suggestions displayed below.

- [ ] **Step 5: Build shared UI primitives**

- `Badge`: variant prop (success/warning/danger/neutral), renders colored pill
- `Button`: variant (primary/secondary/ghost), size (sm/md/lg), loading state
- `Card`: container with border, hover state, optional onClick

- [ ] **Step 6: Update root layout**

Add Navbar and Footer to `src/app/layout.tsx`, wrapping `{children}`.

- [ ] **Step 7: Run tests and verify visually**

Run: `npm test`
Run: `npm run dev` — verify navbar renders with logo, links, search bar

- [ ] **Step 8: Commit**

```bash
git add src/components/ src/app/layout.tsx
git commit -m "feat: add layout with Navbar, Footer, SearchBar, and shared UI components"
```

---

### Task 14: VerdictBadge + ComparisonCard (Shared Components)

**Files:**
- Create: `src/components/comparison/VerdictBadge.tsx`, `src/components/comparison/ComparisonCard.tsx`
- Create: `src/components/comparison/__tests__/`

- [ ] **Step 1: Write VerdictBadge tests**

Test: renders correct text and color for each verdict (SAME_QUALITY=green, CLOSE_ENOUGH=amber, NOT_WORTH_IT=red, MIXED=gray, PENDING=gray).

- [ ] **Step 2: Build VerdictBadge**

Props: `verdict: Verdict`, `size?: "sm" | "md"`. Maps verdict to label text ("Same Quality", "Close Enough", "Not Worth It", "Mixed", "Pending") and Tailwind color classes.

- [ ] **Step 3: Write ComparisonCard tests**

Test: renders product names, verdict badge, vote count, savings percentage (or hides when prices missing).

- [ ] **Step 4: Build ComparisonCard**

Props: comparison data object. Renders as a Card with:
- Verdict badge (top-left)
- Savings percentage (top-right, or hidden)
- Generic name "vs" Name Brand name
- Store name, vote count, confidence

Links to `/compare/[slug]`.

- [ ] **Step 5: Run tests**

Run: `npm test -- src/components/comparison/`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add src/components/comparison/
git commit -m "feat: add VerdictBadge and ComparisonCard shared components"
```

---

### Task 15: Homepage

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/home/TrendingSection.tsx`, `src/components/home/RecentActivity.tsx`
- Create: `src/components/category/CategoryGrid.tsx`

- [ ] **Step 1: Write homepage tests**

Test: renders hero section with search bar, trending comparisons section, category grid, recent activity feed. Uses seed data.

- [ ] **Step 2: Build TrendingSection**

Server component: fetches top 6 comparisons by totalVotes (APPROVED only), renders as ComparisonCard grid. 3 columns on desktop, horizontal scroll on mobile.

- [ ] **Step 3: Build CategoryGrid**

Server component: fetches all categories, renders as grid of tiles with emoji icon, name, and comparison count. 4 columns desktop, 2 mobile.

- [ ] **Step 4: Build RecentActivity**

Server component: fetches latest 5 evidence submissions and approved comparisons. Renders as a feed list with timestamps.

- [ ] **Step 5: Assemble homepage**

Update `src/app/page.tsx`:
1. Hero: tagline + SearchBar + popular search chips
2. TrendingSection
3. CategoryGrid
4. RecentActivity

Set ISR: `export const revalidate = 120;`

- [ ] **Step 6: Run tests and verify visually**

Run: `npm test`
Run: `npm run dev` — verify homepage renders all sections with seed data

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx src/components/home/ src/components/category/
git commit -m "feat: build homepage with hero, trending, categories, and recent activity"
```

---

### Task 16: Comparison Page — Read-Only Display

**Files:**
- Create: `src/app/compare/[slug]/page.tsx`
- Create: `src/components/comparison/ProductSideBySide.tsx`, `QuickFacts.tsx`, `EvidenceList.tsx`

- [ ] **Step 1: Write comparison page tests**

Test: renders verdict banner, product side-by-side, quick facts section, evidence list. Handles missing prices gracefully. Returns 404 for unknown slugs.

- [ ] **Step 2: Build ProductSideBySide**

Server component: renders generic product (left) and name brand (right) with images (or placeholder), names, store, and prices. Stacks vertically on mobile.

- [ ] **Step 3: Build QuickFacts**

Derives quick facts from evidence entries (checks for MANUFACTURER_INFO, INGREDIENT_COMPARISON type evidence). Renders as badge grid.

- [ ] **Step 4: Build EvidenceList**

Client component (expandable): renders evidence entries with type badge, contributor, timestamp, content. Initially shows 3, "Show all" expands.

- [ ] **Step 5: Assemble comparison page**

Server component page: fetch comparison by slug, 404 if not found/not APPROVED. Render:
1. Verdict banner (verdict badge, confidence, votes, savings)
2. ProductSideBySide
3. QuickFacts
4. EvidenceList

Set ISR: `export const revalidate = 60;`
Generate metadata for SEO.

- [ ] **Step 6: Run tests and verify visually**

Run: `npm test`
Navigate to a seeded comparison page and verify layout.

- [ ] **Step 7: Commit**

```bash
git add src/app/compare/ src/components/comparison/ProductSideBySide.tsx src/components/comparison/QuickFacts.tsx src/components/comparison/EvidenceList.tsx
git commit -m "feat: build comparison page with verdict banner, products, and evidence"
```

---

### Task 17: Comparison Page — Voting UI

**Files:**
- Create: `src/components/comparison/VoteButtons.tsx`, `src/components/comparison/VoteBreakdown.tsx`
- Modify: `src/app/compare/[slug]/page.tsx`

- [ ] **Step 1: Write VoteButtons tests**

Test: renders three vote buttons, highlights user's current vote, shows sign-in prompt when not authenticated, calls vote API on click.

- [ ] **Step 2: Build VoteButtons**

Client component (`"use client"`):
- Three buttons: Same Quality (green), Close Enough (amber), Not Worth It (red)
- Fetch user's existing vote on mount
- Optimistic UI: highlight immediately, revert on API error
- Show "Sign in to vote" for unauthenticated users

- [ ] **Step 3: Build VoteBreakdown**

Props: vote counts per value, total votes. Renders horizontal stacked bar with percentages.

- [ ] **Step 4: Integrate into comparison page**

Add VoteButtons and VoteBreakdown between QuickFacts and EvidenceList.

- [ ] **Step 5: Run tests**

Run: `npm test -- src/components/comparison/`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add src/components/comparison/VoteButtons.tsx src/components/comparison/VoteBreakdown.tsx src/app/compare/
git commit -m "feat: add voting UI with optimistic updates and vote breakdown bar"
```

---

### Task 18: Comparison Page — Evidence Form

**Files:**
- Create: `src/components/comparison/EvidenceForm.tsx`
- Modify: `src/app/compare/[slug]/page.tsx`

- [ ] **Step 1: Write EvidenceForm tests**

Test: renders form with type dropdown, title, content, optional URL. Requires auth. Submits to evidence API. Shows success message.

- [ ] **Step 2: Build EvidenceForm**

Client component:
- Type dropdown (Manufacturer Info, Ingredient Comparison, Photo, Video Link, Other)
- Title input, content textarea, optional URL input
- Submit button, loading state
- Auth-gated: shows "Sign in to contribute" if not authenticated
- On success: clear form, optimistically add to evidence list

- [ ] **Step 3: Integrate into comparison page**

Add EvidenceForm below EvidenceList with "Add Evidence" heading.

- [ ] **Step 4: Run tests**

Run: `npm test -- src/components/comparison/`
Expected: All pass

- [ ] **Step 5: Commit**

```bash
git add src/components/comparison/EvidenceForm.tsx src/app/compare/
git commit -m "feat: add evidence submission form on comparison page"
```

---

### Task 19: Category Page

**Files:**
- Create: `src/app/categories/[slug]/page.tsx`
- Create: `src/components/category/CategoryFilter.tsx`

- [ ] **Step 1: Write category page tests**

Test: renders category name and icon, filterable comparison list, handles unknown category slug (404).

- [ ] **Step 2: Build CategoryFilter**

Client component: filter buttons for verdict (all/same quality/close enough/not worth it), sort dropdown (most voted/newest/highest savings).

- [ ] **Step 3: Build category page**

Server component: fetch category by slug, fetch comparisons with filters from search params, render ComparisonCard list with pagination. Generate metadata.

Set ISR: `export const revalidate = 300;` (5 minutes)

Add price disclaimer text below comparison list: "Prices are community-reported and may vary by location"

- [ ] **Step 4: Run tests**

- [ ] **Step 5: Commit**

```bash
git add src/app/categories/ src/components/category/CategoryFilter.tsx
git commit -m "feat: build category page with filtering and sorting"
```

---

### Task 20: Search Results Page

**Files:**
- Create: `src/app/search/page.tsx`

- [ ] **Step 1: Write search page tests**

Test: renders search results for query, shows "No results" with suggestions for empty results, reads `q` param.

- [ ] **Step 2: Build search page**

Server component (dynamic, no caching):
- Read `q` from searchParams
- Call search utility
- Render ComparisonCard list
- "No results" state with suggestions

- [ ] **Step 3: Run tests and verify**

- [ ] **Step 4: Commit**

```bash
git add src/app/search/
git commit -m "feat: build search results page"
```

---

### Task 21: Submit Comparison Page

**Files:**
- Create: `src/app/submit/page.tsx`

- [ ] **Step 1: Write submit page tests**

Test: renders form fields, requires auth (redirects to sign-in), shows success message on submit, shows duplicate warning.

- [ ] **Step 2: Build submit page**

Client component (auth-gated):
- Form: generic product (name, brand, store, price), name brand (name, brand, price), category dropdown, optional initial evidence
- Category dropdown populated from API
- Submit calls POST comparisons API
- Shows "Submitted for review" success state
- Shows duplicate warning if API returns one

- [ ] **Step 3: Run tests**

- [ ] **Step 4: Commit**

```bash
git add src/app/submit/
git commit -m "feat: build comparison submission page with duplicate detection"
```

---

### Task 22: User Profile Page

**Files:**
- Create: `src/app/user/[username]/page.tsx`

- [ ] **Step 1: Write profile page tests**

Test: renders user name, avatar, join date, submissions list with status badges, evidence contributions. Returns 404 for unknown username.

- [ ] **Step 2: Build profile page**

Server component:
- Fetch user by username
- List their submitted comparisons with status badges (Pending/Approved/Rejected)
- List their evidence contributions
- Generate metadata

- [ ] **Step 3: Run tests**

- [ ] **Step 4: Commit**

```bash
git add src/app/user/
git commit -m "feat: build user profile page with submissions and contributions"
```

---

### Task 23: Admin Dashboard

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/SubmissionQueue.tsx`

- [ ] **Step 1: Write admin page tests**

Test: renders pending submissions queue, approve/reject buttons work, shows rejection reason textarea, redirects non-admin users.

- [ ] **Step 2: Build SubmissionQueue component**

Client component: list of pending submissions with:
- Product names, submitter, category, date
- Approve button (calls admin API)
- Reject button with reason textarea
- Status updates optimistically

- [ ] **Step 3: Build admin page**

Auth-gated server component (admin only):
- Renders SubmissionQueue
- Shows count of pending items

- [ ] **Step 4: Run tests**

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/ src/components/admin/
git commit -m "feat: build admin dashboard with submission review queue"
```

---

## Phase 4: Polish & Launch (Tasks 24-27)

### Task 24: SEO

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/seo.ts`
- Modify: comparison page, category page, homepage (add `generateMetadata`)

- [ ] **Step 1: Create SEO utility**

`src/lib/seo.ts`: helpers for generating OpenGraph metadata, JSON-LD Product schema for comparison pages.

- [ ] **Step 2: Add generateMetadata to all pages**

- Homepage: title, description, OG image
- Comparison page: dynamic title ("[Generic] vs [Brand] — GenericOrNot"), description with verdict
- Category page: dynamic title ("[Category] — GenericOrNot")
- Search: "Search Results — GenericOrNot"

- [ ] **Step 3: Create sitemap**

`src/app/sitemap.ts`: dynamic sitemap from all approved comparisons and categories.

- [ ] **Step 4: Create robots.txt**

`src/app/robots.ts`: allow all, point to sitemap.

- [ ] **Step 5: Add JSON-LD to comparison pages**

Product structured data for Google rich results.

- [ ] **Step 6: Commit**

```bash
git add src/lib/seo.ts src/app/sitemap.ts src/app/robots.ts src/app/compare/ src/app/categories/ src/app/page.tsx
git commit -m "feat: add SEO metadata, sitemap, robots.txt, and JSON-LD structured data"
```

---

### Task 25: Image Upload (Cloudflare R2)

**Files:**
- Create: `src/lib/upload.ts`, `src/app/api/upload/route.ts`
- Modify: `src/components/comparison/EvidenceForm.tsx`, `src/app/submit/page.tsx`

- [ ] **Step 1: Install S3 client**

Run: `npm install @aws-sdk/client-s3`

- [ ] **Step 2: Create upload utility**

`src/lib/upload.ts`:
- Validate file type (JPEG, PNG, WebP) and size (<5MB)
- Upload to R2 via S3-compatible API
- Return public URL
- Graceful error handling (return null on failure)

- [ ] **Step 3: Create upload API route**

POST handler: accept multipart form data, validate, upload to R2, return URL.

- [ ] **Step 4: Integrate with EvidenceForm and Submit page**

Add image upload input to both forms. Show preview. Allow submission without image if upload fails.

- [ ] **Step 5: Add R2 env vars to .env.example**

```
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/upload.ts src/app/api/upload/ src/components/comparison/EvidenceForm.tsx src/app/submit/ .env.example
git commit -m "feat: add Cloudflare R2 image upload for evidence and submissions"
```

---

### Task 26: Rate Limiting

**Files:**
- Create: `src/lib/rate-limit.ts`, `src/lib/__tests__/rate-limit.test.ts`
- Modify: `src/app/api/votes/route.ts`, `src/app/api/comparisons/route.ts`, `src/app/api/evidence/route.ts`

Note: Rate limiting is applied inside API route handlers (not edge middleware) because Next.js edge middleware on Vercel is stateless — in-memory stores reset between invocations.

- [ ] **Step 1: Write rate limiter tests**

Test: allows requests under limit, returns 429 after limit exceeded, resets after window expires, tracks per-user.

- [ ] **Step 2: Implement in-memory rate limiter**

`src/lib/rate-limit.ts`:
- Sliding window algorithm using a Map (works in Node.js API routes which are long-lived)
- Configurable: requests per window, window duration
- Key by user ID
- Returns `{ success: boolean, remaining: number, resetAt: Date }`
- Export pre-configured limiters: `voteLimiter` (10/min), `submissionLimiter` (5/hour), `evidenceLimiter` (10/hour)

- [ ] **Step 3: Add rate limiting to API routes**

Add rate limit check at the top of each POST handler:
- `src/app/api/votes/route.ts` — `voteLimiter`
- `src/app/api/comparisons/route.ts` — `submissionLimiter`
- `src/app/api/evidence/route.ts` — `evidenceLimiter`

If limit exceeded, return: `NextResponse.json({ error: "Too many requests, please try again later" }, { status: 429 })`

- [ ] **Step 4: Run tests**

- [ ] **Step 5: Commit**

```bash
git add src/lib/rate-limit.ts src/lib/__tests__/rate-limit.test.ts src/app/api/votes/ src/app/api/comparisons/ src/app/api/evidence/
git commit -m "feat: add rate limiting to vote, submission, and evidence API routes"
```

---

### Task 27: Mobile Responsiveness + Final Polish

**Files:**
- Modify: various component files for responsive fixes
- Create: `e2e/` directory with Playwright tests (optional stretch goal)

- [ ] **Step 1: Responsive audit**

Check each page at 375px (mobile), 768px (tablet), 1280px (desktop):
- Comparison page: products stack vertically on mobile
- Category grid: 2 columns mobile, 4 desktop
- Trending cards: horizontal scroll on mobile
- Vote buttons: full-width stacked on mobile
- Navbar: hamburger menu on mobile

- [ ] **Step 2: Fix responsive issues**

Apply Tailwind responsive classes where needed.

- [ ] **Step 3: Visual QA pass**

Run through all pages with seed data, verify:
- All verdicts display correctly
- Missing prices handled gracefully
- Evidence section expands/collapses
- Vote buttons work
- Search returns results
- Admin dashboard functions

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: responsive design fixes and final polish"
```

---

## Verification

After all tasks are complete, verify end-to-end:

1. **Database**: `npx prisma db push && npx prisma db seed` — data populates correctly
2. **Dev server**: `npm run dev` — all pages render without errors
3. **Tests**: `npm test` — all unit tests pass
4. **Auth flow**: sign in with Google, vote on a comparison, submit evidence
5. **Submit flow**: submit a new comparison, verify it appears in admin queue
6. **Admin flow**: approve a submission, verify it appears on the site
7. **Search**: search for "Kirkland", verify results appear
8. **Mobile**: test on mobile viewport, verify responsive layout
9. **SEO**: check page source for meta tags and JSON-LD on comparison pages

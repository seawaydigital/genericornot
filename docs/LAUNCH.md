# GenericOrNot — Canadian Launch Runbook

This branch makes GenericOrNot launch-ready for Canadian shoppers. Production
needs a **database update before the new code goes live**, so follow the steps
in order.

## 1. Deploy to production (in this order)

### Step 0 — Back up

In the Neon console, create a branch or restore point of the production
database. Every step below is designed to be safe, but take the backup first.

### Step 1 — Apply the schema (additive only)

```bash
DATABASE_URL="<production Neon URL>" npx prisma db push
```

This only **adds** things: new nullable columns, a `ComparisonFlag` table, an
`EvidenceStatus` enum, an `ARCHIVED` status and `User.emailVerified`. The site
currently running in production keeps working after this step.

**If Prisma warns about data loss or asks to reset the database, stop and do
not continue.**

### Step 2 — Sync the Canadian catalogue

Dry run first. It shows exactly what will change and writes nothing:

```bash
DATABASE_URL="<production Neon URL>" npx tsx scripts/sync-catalogue.ts
```

Expected against today's production data: about 17 created, 54 updated, 66
archived, and vote tallies corrected on all 120 comparisons (the fabricated
totals drop to the real vote count, which is close to zero). Then apply it:

```bash
DATABASE_URL="<production Neon URL>" npx tsx scripts/sync-catalogue.ts --apply
```

The whole sync runs in one transaction, so it either fully applies or changes
nothing. A second run reports no changes.

### Step 3 — Ship the code

Merge `claude/magical-brahmagupta-6ld0v1` into `master`; Vercel deploys
automatically. Optional new environment variables in Vercel:

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://genericornot.com` | Optional (this is the default). |
| `VOTE_MIN_ACCOUNT_AGE_MINUTES` | `0` | Default `0`. Set to e.g. `60` only if fresh accounts start brigading. |

You can delete the `R2_*` variables; the dead upload code is gone.

### Step 4 — Smoke test (5 minutes)

- [ ] Homepage loads and shows "Popular Swaps" with Canadian products.
- [ ] `/compare/life-brand-ibuprofen-vs-advil` shows a **Research** verdict, a
      price check in CAD and the "Not medical advice" note.
- [ ] Sign in from a comparison page; you return to the same page.
- [ ] Vote. The tally updates immediately, then refresh: it's still there.
- [ ] Submit evidence. You see "will appear once a moderator reviews it".
- [ ] `/admin`: the evidence is waiting; approve it and it appears on the page.
- [ ] `/compare/up-and-up-acetaminophen-vs-tylenol` returns 404 (archived).
- [ ] Share a comparison link in a private Slack/Messenger chat: the preview
      card shows the verdict image.

## 2. Owner checklist before announcing

These need your judgement; code can't do them.

1. **Spot-check the catalogue.** Prices are my best estimates of typical
   regular CAD shelf prices (Nov 2026), not verified quotes. Check at least
   the six featured items (Advil, Kraft Dinner, Gravol, butter, PC Decadent,
   Kirkland diapers). Then use the **Admin → Mark reviewed** toolbar at the
   bottom of each comparison page, which shows "Reviewed Nov 2026" to visitors.
   To correct a price, edit `src/lib/catalogue/data.ts` and re-run the sync.
2. **Confirm the legal details.** The privacy policy names
   `hello@genericornot.com` as the privacy contact (Quebec's Law 25 requires a
   named person in charge) and the terms use Ontario law. Make sure that inbox
   exists and is monitored, and tell me if the operator or province should be
   different.
3. **Turn on email sign-in (strongly recommended).** Plenty of Canadians won't
   use Google or Facebook to sign in. Create a Resend account, verify
   `genericornot.com` in Porkbun DNS, and set `RESEND_API_KEY` and `EMAIL_FROM`
   in Vercel.
4. **Rename your own username.** Accounts created before this release got
   usernames built from the person's real name (including the admin account),
   and the username shows on every contribution. New accounts get pseudonyms.
   To rename yours:

   ```sql
   UPDATE "User" SET username = 'genericornot-editor' WHERE email = 'you@example.com';
   ```

   Then sign out and back in.

## 3. What changed and why

### Trust
- **Fabricated votes removed.** The original seed wrote vote totals (for
  example "312 votes") with no real votes behind them, and the comparison page
  invented vote breakdowns. Totals now come only from real votes. The first
  real vote no longer collapses a seeded verdict.
- **Research vs community verdicts.** Where there is objective, sourced
  evidence (same medicinal ingredient and strength, a legal food standard, the
  HDMI spec), a comparison shows a clearly labelled *Research verdict* until 5
  people vote. Taste and performance questions are left to the community.
- **Evidence is moderated** before it goes public. Canada has no blanket safe
  harbour for user-generated claims about brands.
- **Flags count one per person** (previously one account could mark any page
  outdated by clicking three times).

### Canada-first
- A 71-item catalogue: Loblaws, No Frills, Shoppers, Walmart, Costco, Sobeys,
  Metro and Amazon.ca, with CAD prices and package sizes.
- 66 US-only or invalid comparisons archived (hidden, never deleted), including
  ranitidine, which was withdrawn from the Canadian market.
- Savings compare **unit prices** (per 100 g, 100 mL, item or m²), so bulk
  packs aren't shown as "more expensive".
- `en-CA` dates, CAD currency, Canadian copy, and Health Canada references
  instead of the FDA.
- Privacy policy rewritten for PIPEDA and Quebec's Law 25 basics, including
  the real third parties and the fact that data is stored in the US. Terms
  updated (Ontario law, moderation, the Competition Act disclosure rule).

### Product and UX
- The vote tally updates instantly. Signed-out visitors can tap a vote; it's
  remembered through sign-in and submitted when they return.
- Sign-in returns people to the page they came from.
- A search box on the search page (it was a dead end before).
- An admin dashboard with queues for submissions, evidence (approve with a
  confidence tier), reports, and archived comparisons (restore).
- Social share images for every comparison.
- Comparison pages are cached (ISR) and return real 404s for missing or
  archived items.

### Security
- Patched critical/high vulnerabilities (Next 16.4.5, next-auth 4.24.15,
  happy-dom 21, transitive dependencies). nodemailer was removed entirely.
- `javascript:` and other unsafe links are blocked; user links get
  `nofollow ugc noopener noreferrer`.
- Length and price validation, a category existence check and duplicate
  detection on submissions.
- Admin approval is idempotent, and category counts are recomputed from the
  data rather than incremented.
- Open-redirect protection on sign-in callbacks, and the JSON-LD
  `</script>` break-out is escaped.
- Security headers (`nosniff`, `DENY` framing, referrer and permissions
  policies).
- The seed no longer wipes the database (it would have deleted every user).
  `--reset` refuses to run on production or on any database with real users.
- The system "admin@genericornot.com" seed account is demoted to a normal user.

## 4. Recommended next steps (after launch)

| Priority | Item | Why |
|---|---|---|
| High | French (fr-CA) | About 22% of Canadians; required if you actively target Quebec. |
| High | Error monitoring (Sentry) | You'll otherwise learn about errors from users. |
| Medium | Shared rate limiting (Upstash Redis) | The current limiter is per serverless instance. |
| Medium | Community price reports | Prices drift; let shoppers update them with a date. |
| Medium | Self-serve "change username" and "delete my account" | Today these are email requests. |
| Low | Content-Security-Policy (report-only first) | Defence in depth. |
| Low | Province and banner availability | E.g. "No Name at No Frills, Superstore, Provigo". |

## 5. Local development

```bash
cp .env.example .env               # point DATABASE_URL at Neon or a local Postgres
npx prisma db push
npx prisma db seed                 # loads the catalogue (safe to re-run)
npx tsx prisma/apply-search-migration.ts
npm run dev
```

A local Postgres works directly: `localhost` URLs automatically use the
node-postgres driver instead of Neon's serverless driver.

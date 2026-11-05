import type { Prisma, PrismaClient } from "@prisma/client";
import { ARCHIVED_LEGACY_SLUGS, CATALOGUE, CATEGORIES } from "./data";
import type { CatalogueEntry, CatalogueEvidence } from "./types";
import { computeVerdict, tallyVotes } from "../verdict";
import { SYSTEM_DISPLAY_NAME, SYSTEM_USER_EMAIL, SYSTEM_USERNAME } from "./constants";

export { SYSTEM_DISPLAY_NAME, SYSTEM_USER_EMAIL, SYSTEM_USERNAME };

export interface SyncSummary {
  categoriesUpserted: number;
  created: string[];
  updated: string[];
  unchanged: number;
  needsReview: string[];
  skippedByAdmin: string[];
  archived: string[];
  evidenceReplaced: string[];
  talliesCorrected: Array<{ slug: string; from: number; to: number }>;
  categoryCounts: Record<string, number>;
}

export interface SyncOptions {
  /** Run everything inside a transaction, then roll it back. */
  dryRun?: boolean;
  log?: (message: string) => void;
}

type Tx = Prisma.TransactionClient;

class DryRunRollback extends Error {
  constructor(readonly summary: SyncSummary) {
    super("dry run — rolled back");
  }
}

function toNumber(value: { toString(): string } | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value.toString());
}

/** Fields shoppers see. A change to any of these means the page needs a fresh editorial review. */
function displayFingerprint(row: {
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice: number | null;
  genericSize: string | null;
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: number | null;
  nameBrandSize: string | null;
  editorialVerdict: string | null;
}): string {
  return JSON.stringify([
    row.genericProductName,
    row.genericBrand,
    row.genericStore,
    row.genericPrice,
    row.genericSize,
    row.nameBrandProductName,
    row.nameBrand,
    row.nameBrandPrice,
    row.nameBrandSize,
    row.editorialVerdict,
  ]);
}

function entryData(entry: CatalogueEntry, categoryId: string) {
  return {
    genericProductName: entry.generic.product,
    genericBrand: entry.generic.brand,
    genericStore: entry.generic.store,
    genericPrice: entry.generic.price ?? null,
    genericSize: entry.generic.size ?? null,
    nameBrandProductName: entry.nameBrand.product,
    nameBrand: entry.nameBrand.brand,
    nameBrandPrice: entry.nameBrand.price ?? null,
    nameBrandSize: entry.nameBrand.size ?? null,
    categoryId,
    editorialVerdict: entry.editorialVerdict ?? null,
    editorialNote: entry.editorialNote ?? null,
    featured: entry.featured ?? false,
  };
}

function evidenceSignature(e: { type: string; confidence: string; title: string; content: string; url?: string | null }) {
  return JSON.stringify([e.type, e.confidence, e.title, e.content, e.url ?? null]);
}

async function ensureSystemUser(tx: Tx) {
  const existing = await tx.user.findUnique({ where: { email: SYSTEM_USER_EMAIL } });
  const usernameOwner = await tx.user.findUnique({ where: { username: SYSTEM_USERNAME }, select: { id: true } });
  const username = usernameOwner && usernameOwner.id !== existing?.id ? `${SYSTEM_USERNAME}-1` : SYSTEM_USERNAME;

  if (existing) {
    return tx.user.update({
      where: { id: existing.id },
      data: { username, name: SYSTEM_DISPLAY_NAME, role: "USER" },
    });
  }
  return tx.user.create({
    data: { email: SYSTEM_USER_EMAIL, username, name: SYSTEM_DISPLAY_NAME, role: "USER" },
  });
}

async function syncEvidence(
  tx: Tx,
  comparison: { id: string; createdAt: Date },
  systemUserId: string,
  evidence: CatalogueEvidence[]
): Promise<boolean> {
  const current = await tx.evidence.findMany({
    where: { comparisonId: comparison.id, userId: systemUserId },
    orderBy: { createdAt: "asc" },
    select: { type: true, confidence: true, title: true, content: true, url: true, status: true },
  });
  const same =
    current.length === evidence.length &&
    current.every((e, i) => e.status === "APPROVED" && evidenceSignature(e) === evidenceSignature(evidence[i]));
  if (same) return false;

  await tx.evidence.deleteMany({ where: { comparisonId: comparison.id, userId: systemUserId } });
  for (const [index, e] of evidence.entries()) {
    await tx.evidence.create({
      data: {
        comparisonId: comparison.id,
        userId: systemUserId,
        type: e.type,
        confidence: e.confidence,
        title: e.title,
        content: e.content,
        url: e.url ?? null,
        status: "APPROVED",
        // Keep editorial evidence anchored to the comparison's own date so a
        // catalogue edit doesn't flood "Recent contributions". The index keeps
        // the order stable.
        createdAt: new Date(comparison.createdAt.getTime() + index),
      },
    });
  }
  return true;
}

async function runSync(tx: Tx, log: (m: string) => void): Promise<SyncSummary> {
  const summary: SyncSummary = {
    categoriesUpserted: 0,
    created: [],
    updated: [],
    unchanged: 0,
    needsReview: [],
    skippedByAdmin: [],
    archived: [],
    evidenceReplaced: [],
    talliesCorrected: [],
    categoryCounts: {},
  };

  // 1. Categories
  const categoryIds = new Map<string, string>();
  for (const category of CATEGORIES) {
    const row = await tx.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, icon: category.icon },
      create: { slug: category.slug, name: category.name, icon: category.icon },
    });
    categoryIds.set(category.slug, row.id);
    summary.categoriesUpserted++;
  }

  // 2. System author
  const systemUser = await ensureSystemUser(tx);

  // 3. Catalogue comparisons + editorial evidence
  for (const entry of CATALOGUE) {
    const categoryId = categoryIds.get(entry.category);
    if (!categoryId) throw new Error(`Unknown category "${entry.category}" for ${entry.slug}`);
    const data = entryData(entry, categoryId);
    const existing = await tx.productComparison.findUnique({ where: { slug: entry.slug } });

    let comparison: { id: string; createdAt: Date };
    if (!existing) {
      comparison = await tx.productComparison.create({
        data: {
          slug: entry.slug,
          ...data,
          status: "APPROVED",
          verdict: "PENDING",
          confidenceScore: 0,
          totalVotes: 0,
          submittedById: systemUser.id,
          lastVerifiedAt: null,
        },
      });
      summary.created.push(entry.slug);
      log(`+ created ${entry.slug}`);
    } else {
      comparison = existing;
      if (existing.status === "ARCHIVED" || existing.status === "REJECTED") {
        // An admin decided this one; the catalogue never overrides that.
        summary.skippedByAdmin.push(entry.slug);
        log(`! skipped ${entry.slug} (status ${existing.status} set by an admin)`);
        continue;
      }

      const before = displayFingerprint({
        ...existing,
        genericPrice: toNumber(existing.genericPrice),
        nameBrandPrice: toNumber(existing.nameBrandPrice),
      });
      const after = displayFingerprint(data);
      const metaChanged =
        existing.categoryId !== data.categoryId ||
        existing.editorialNote !== data.editorialNote ||
        existing.featured !== data.featured ||
        existing.status === "PENDING";

      if (before !== after || metaChanged) {
        await tx.productComparison.update({
          where: { id: existing.id },
          data: {
            ...data,
            ...(existing.status === "PENDING" ? { status: "APPROVED" as const } : {}),
            // Facts on the page changed, so any earlier review no longer applies.
            ...(before !== after ? { lastVerifiedAt: null } : {}),
          },
        });
        summary.updated.push(entry.slug);
        if (before !== after) summary.needsReview.push(entry.slug);
        log(`~ updated ${entry.slug}`);
      } else {
        summary.unchanged++;
      }
    }

    if (await syncEvidence(tx, comparison, systemUser.id, entry.evidence)) {
      summary.evidenceReplaced.push(entry.slug);
    }
  }

  // 4. Archive legacy, non-Canadian comparisons (hide, never delete)
  for (const { slug, reason } of ARCHIVED_LEGACY_SLUGS) {
    const result = await tx.productComparison.updateMany({
      where: { slug, status: { in: ["APPROVED", "PENDING"] } },
      data: { status: "ARCHIVED", rejectionReason: reason },
    });
    if (result.count > 0) {
      summary.archived.push(slug);
      log(`- archived ${slug} (${reason})`);
    }
  }

  // 5. Recount every tally from real Vote rows. This is what removes the
  //    fabricated vote totals the original seed wrote.
  const groups = await tx.vote.groupBy({ by: ["comparisonId", "value"], _count: true });
  const byComparison = new Map<string, Array<{ value: string; count: number }>>();
  for (const g of groups) {
    const list = byComparison.get(g.comparisonId) ?? [];
    list.push({ value: g.value, count: g._count });
    byComparison.set(g.comparisonId, list);
  }
  const all = await tx.productComparison.findMany({
    select: { id: true, slug: true, verdict: true, totalVotes: true, confidenceScore: true },
  });
  for (const row of all) {
    const result = computeVerdict(tallyVotes(byComparison.get(row.id) ?? []));
    if (
      row.totalVotes !== result.totalVotes ||
      row.verdict !== result.verdict ||
      row.confidenceScore !== result.confidenceScore
    ) {
      await tx.productComparison.update({
        where: { id: row.id },
        data: { verdict: result.verdict, totalVotes: result.totalVotes, confidenceScore: result.confidenceScore },
      });
      summary.talliesCorrected.push({ slug: row.slug, from: row.totalVotes, to: result.totalVotes });
    }
  }

  // 6. Category counts = approved comparisons per category
  const counts = await tx.productComparison.groupBy({
    by: ["categoryId"],
    where: { status: "APPROVED" },
    _count: true,
  });
  const countMap = new Map(counts.map((c) => [c.categoryId, c._count]));
  const categories = await tx.category.findMany({ select: { id: true, slug: true } });
  for (const category of categories) {
    const count = countMap.get(category.id) ?? 0;
    await tx.category.update({ where: { id: category.id }, data: { comparisonCount: count } });
    summary.categoryCounts[category.slug] = count;
  }

  return summary;
}

/**
 * Apply the curated catalogue to a database. Idempotent: running it twice
 * changes nothing the second time. All-or-nothing: it runs in one
 * transaction.
 */
export async function syncCatalogue(prisma: PrismaClient, options: SyncOptions = {}): Promise<SyncSummary> {
  const log = options.log ?? (() => {});
  try {
    return await prisma.$transaction(
      async (tx) => {
        const summary = await runSync(tx, log);
        if (options.dryRun) throw new DryRunRollback(summary);
        return summary;
      },
      { timeout: 5 * 60 * 1000, maxWait: 30 * 1000 }
    );
  } catch (error) {
    if (error instanceof DryRunRollback) return error.summary;
    throw error;
  }
}

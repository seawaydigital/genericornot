import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { decimalToNumber } from "@/lib/comparisons";
import { SubmissionQueue } from "@/components/admin/SubmissionQueue";
import { EvidenceQueue } from "@/components/admin/EvidenceQueue";
import { FlaggedQueue } from "@/components/admin/FlaggedQueue";
import { ArchivedList } from "@/components/admin/ArchivedList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard — GenericOrNot",
  robots: { index: false },
};

async function getQueues() {
  try {
    const [pending, evidence, flagged, archived] = await Promise.all([
      prisma.productComparison.findMany({
        where: { status: "PENDING" },
        include: {
          submittedBy: { select: { name: true, username: true } },
          category: { select: { name: true, icon: true } },
          evidence: { where: { status: "PENDING" }, select: { id: true, title: true, content: true, userId: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.evidence.findMany({
        where: { status: "PENDING", comparison: { status: "APPROVED" } },
        include: {
          user: { select: { username: true } },
          comparison: { select: { slug: true, genericProductName: true, nameBrandProductName: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.productComparison.findMany({
        where: { status: "APPROVED", flagCount: { gt: 0 } },
        include: { flags: { select: { reason: true }, orderBy: { createdAt: "desc" }, take: 10 } },
        orderBy: { flagCount: "desc" },
      }),
      prisma.productComparison.findMany({
        where: { status: "ARCHIVED" },
        select: { id: true, genericProductName: true, nameBrandProductName: true, rejectionReason: true },
        orderBy: { genericProductName: "asc" },
      }),
    ]);
    return { pending, evidence, flagged, archived };
  } catch {
    return { pending: [], evidence: [], flagged: [], archived: [] };
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { pending, evidence, flagged, archived } = await getQueues();
  const archivedCount = archived.length;

  // Serialize for client components (Decimal -> number, Date -> string).
  const comparisons = pending.map((c) => ({
    id: c.id,
    genericProductName: c.genericProductName,
    genericBrand: c.genericBrand,
    genericStore: c.genericStore,
    genericPrice: decimalToNumber(c.genericPrice),
    genericSize: c.genericSize,
    nameBrandProductName: c.nameBrandProductName,
    nameBrand: c.nameBrand,
    nameBrandPrice: decimalToNumber(c.nameBrandPrice),
    nameBrandSize: c.nameBrandSize,
    createdAt: c.createdAt.toISOString(),
    category: c.category ?? null,
    submittedBy: c.submittedBy ?? null,
    // Only the submitter's own evidence is approved together with the comparison.
    evidence: c.evidence
      .filter((e) => e.userId === c.submittedById)
      .map((e) => ({ id: e.id, title: e.title, content: e.content })),
  }));

  const pendingEvidence = evidence.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    content: e.content,
    url: e.url,
    createdAt: e.createdAt.toISOString(),
    user: { username: e.user.username },
    comparison: e.comparison,
  }));

  const flaggedComparisons = flagged.map((c) => ({
    id: c.id,
    slug: c.slug,
    genericProductName: c.genericProductName,
    nameBrandProductName: c.nameBrandProductName,
    flagCount: c.flagCount,
    flaggedOutdated: c.flaggedOutdated,
    reasons: c.flags.map((f) => f.reason).filter((r): r is string => !!r),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-10 space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">
          {comparisons.length} comparison{comparisons.length === 1 ? "" : "s"}, {pendingEvidence.length} evidence
          {pendingEvidence.length === 1 ? " entry" : " entries"} and {flaggedComparisons.length} report
          {flaggedComparisons.length === 1 ? "" : "s"} waiting. {archivedCount} archived.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Submissions</h2>
        <SubmissionQueue initialComparisons={comparisons} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Evidence Awaiting Review</h2>
        <p className="text-gray-500 text-xs mb-4">
          Approve only factual, non-defamatory content. Use &ldquo;Confirmed&rdquo; only when a regulator, product
          label or official source backs the claim.
        </p>
        <EvidenceQueue initialEvidence={pendingEvidence} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reported as Outdated</h2>
        <FlaggedQueue initialFlagged={flaggedComparisons} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Archived</h2>
        <p className="text-gray-500 text-xs mb-4">
          Hidden from the site but kept with their votes and evidence. Restoring makes a comparison public again.
        </p>
        <ArchivedList
          initialArchived={archived.map((c) => ({
            id: c.id,
            genericProductName: c.genericProductName,
            nameBrandProductName: c.nameBrandProductName,
            reason: c.rejectionReason,
          }))}
        />
      </section>
    </div>
  );
}

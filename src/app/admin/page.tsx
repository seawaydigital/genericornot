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
import { Archive, Flag, Inbox, LayoutDashboard, MessageSquareText, type LucideIcon } from "lucide-react";

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

  const stats: { label: string; value: number; Icon: LucideIcon; href: string }[] = [
    { label: "Submissions", value: comparisons.length, Icon: Inbox, href: "#submissions" },
    { label: "Evidence", value: pendingEvidence.length, Icon: MessageSquareText, href: "#evidence" },
    { label: "Reports", value: flaggedComparisons.length, Icon: Flag, href: "#reports" },
    { label: "Archived", value: archivedCount, Icon: Archive, href: "#archived" },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-hero">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <p className="eyebrow inline-flex items-center gap-1.5">
            <LayoutDashboard aria-hidden="true" className="h-3.5 w-3.5" />
            Moderation
          </p>
          <h1 className="mt-2 font-display text-5xl leading-none tracking-tight text-ink">Admin Dashboard</h1>
          <p className="mt-3 text-sm text-muted">
            {comparisons.length} comparison{comparisons.length === 1 ? "" : "s"}, {pendingEvidence.length} evidence
            {pendingEvidence.length === 1 ? " entry" : " entries"} and {flaggedComparisons.length} report
            {flaggedComparisons.length === 1 ? "" : "s"} waiting. {archivedCount} archived.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(({ label, value, Icon, href }) => (
              <li key={label}>
                <a href={href} className="card card-interactive block px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                    {label}
                  </span>
                  <span className={`mt-1 block font-display text-3xl leading-none tabular-nums ${value > 0 && label !== "Archived" ? "text-ink" : "text-subtle"}`}>
                    {value}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-10 sm:px-6">
        <section id="submissions" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-semibold text-ink">Pending Submissions</h2>
          <SubmissionQueue initialComparisons={comparisons} />
        </section>

        <section id="evidence" className="scroll-mt-24">
          <h2 className="mb-1 text-xl font-semibold text-ink">Evidence Awaiting Review</h2>
          <p className="mb-4 text-sm text-muted">
            Approve only factual, non-defamatory content. Use &ldquo;Confirmed&rdquo; only when a regulator, product
            label or official source backs the claim.
          </p>
          <EvidenceQueue initialEvidence={pendingEvidence} />
        </section>

        <section id="reports" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-semibold text-ink">Reported as Outdated</h2>
          <FlaggedQueue initialFlagged={flaggedComparisons} />
        </section>

        <section id="archived" className="scroll-mt-24">
          <h2 className="mb-1 text-xl font-semibold text-ink">Archived</h2>
          <p className="mb-4 text-sm text-muted">
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
    </div>
  );
}

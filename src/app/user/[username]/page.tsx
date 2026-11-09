import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { CalendarDays, FileText, Plus, Scale, Vote } from "lucide-react";
import { GenericStatusBadge } from "@/components/comparison/GenericStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { getDisplayVerdict } from "@/lib/verdict";
import { formatDate, formatMonthYear } from "@/lib/format";

interface PageProps { params: Promise<{ username: string }>; }

// Public profiles show a nickname and contributions only — never the real
// name, email or photo we receive from Google/Facebook/Microsoft.
async function getUser(username: string) {
  try {
    return await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        createdAt: true,
        _count: { select: { votes: true } },
        comparisons: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true, slug: true, genericProductName: true, nameBrandProductName: true,
            verdict: true, editorialVerdict: true, totalVotes: true, status: true, createdAt: true,
            category: { select: { name: true, icon: true, slug: true } },
          },
        },
        evidence: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true, title: true, type: true, status: true, createdAt: true,
            comparison: { select: { slug: true, status: true, genericProductName: true, nameBrandProductName: true } },
          },
        },
      },
    });
  } catch { return null; }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} — GenericOrNot contributor`,
    robots: { index: false, follow: true },
  };
}

const statusConfig: Record<string, { label: string; variant: "success" | "neutral" | "danger" }> = {
  APPROVED: { label: "Approved", variant: "success" },
  PENDING: { label: "In review", variant: "neutral" },
  REJECTED: { label: "Not approved", variant: "danger" },
  ARCHIVED: { label: "Archived", variant: "neutral" },
};

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const [user, session] = await Promise.all([getUser(username), getServerSession(authOptions)]);
  if (!user) notFound();

  const isOwner = session?.user?.id === user.id;
  const comparisons = isOwner ? user.comparisons : user.comparisons.filter((c) => c.status === "APPROVED");
  const evidence = isOwner
    ? user.evidence
    : user.evidence.filter((e) => e.status === "APPROVED" && e.comparison.status === "APPROVED");

  const stats = [
    { label: "Comparisons", value: comparisons.length, Icon: Scale },
    { label: "Evidence", value: evidence.length, Icon: FileText },
    { label: "Votes", value: user._count.votes, Icon: Vote },
  ];

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden border-b border-line bg-hero">
        <div aria-hidden="true" className="bg-dots absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between md:py-14 lg:px-8">
          <div className="flex items-center gap-5">
            <span
              aria-hidden="true"
              className="grid h-20 w-20 shrink-0 place-items-center rounded-[1.4rem] bg-brand font-display text-4xl text-tag shadow-card"
            >
              {user.username.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="eyebrow">Contributor</p>
              <h1 className="mt-1.5 break-all font-display text-4xl leading-none tracking-tight text-ink sm:text-5xl">
                {user.username}
              </h1>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                Member since {formatMonthYear(user.createdAt)}
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-3">
            {stats.map(({ label, value, Icon }) => (
              <div key={label} className="card min-w-[6.5rem] px-4 py-3">
                <dt className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {label}
                </dt>
                <dd className="mt-1 font-display text-3xl leading-none tabular-nums text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        {isOwner && (
          <p className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-ink">
            This is your public profile. Only your nickname and approved contributions are visible to others.
          </p>
        )}

        <section aria-labelledby="comparisons-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 id="comparisons-heading" className="font-display text-3xl leading-none tracking-tight text-ink">
              Submitted Comparisons <span className="font-sans text-base font-normal text-subtle">({comparisons.length})</span>
            </h2>
            {isOwner && (
              <Link
                href="/submit"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-brand-500 transition-colors hover:bg-brand-50"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add one
              </Link>
            )}
          </div>
          {comparisons.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-strong bg-surface-2 px-5 py-8 text-center text-sm text-muted">
              No comparisons submitted yet.
            </p>
          ) : (
            <ul className="card divide-y divide-line overflow-hidden">
              {comparisons.map((comp) => {
                const statusInfo = statusConfig[comp.status] ?? statusConfig.PENDING;
                const display = getDisplayVerdict(comp);
                const title = `${comp.genericProductName} vs ${comp.nameBrandProductName}`;
                return (
                  <li key={comp.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      {comp.status === "APPROVED" ? (
                        <Link
                          href={`/compare/${comp.slug}`}
                          className="block text-[15px] font-semibold leading-snug text-ink transition-colors hover:text-brand-500"
                        >
                          {title}
                        </Link>
                      ) : (
                        <p className="text-[15px] font-semibold leading-snug text-ink">{title}</p>
                      )}
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                        {comp.category && (
                          <span className="inline-flex items-center gap-1.5">
                            <CategoryIcon slug={comp.category.slug} size={14} />
                            {comp.category.name}
                          </span>
                        )}
                        <span>{formatDate(comp.createdAt)}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {comp.status === "APPROVED" && (
                        <GenericStatusBadge verdict={display.verdict} savings={null} size="sm" source={display.source} hideSavings />
                      )}
                      {isOwner && (
                        <Badge variant={statusInfo.variant} className="text-xs">
                          {statusInfo.label}
                        </Badge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="evidence-heading">
          <h2 id="evidence-heading" className="mb-5 font-display text-3xl leading-none tracking-tight text-ink">
            Evidence Contributions <span className="font-sans text-base font-normal text-subtle">({evidence.length})</span>
          </h2>
          {evidence.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-strong bg-surface-2 px-5 py-8 text-center text-sm text-muted">
              No evidence submitted yet.
            </p>
          ) : (
            <ul className="card divide-y divide-line overflow-hidden">
              {evidence.map((ev) => (
                <li key={ev.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[15px] font-semibold leading-snug text-ink">{ev.title}</p>
                    {isOwner && ev.status !== "APPROVED" && (
                      <Badge variant={(statusConfig[ev.status] ?? statusConfig.PENDING).variant} className="shrink-0 text-xs">
                        {(statusConfig[ev.status] ?? statusConfig.PENDING).label}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="font-semibold uppercase tracking-[0.1em] text-subtle">
                      {ev.type.replace(/_/g, " ").toLowerCase()}
                    </span>
                    {ev.comparison.status === "APPROVED" ? (
                      <Link
                        href={`/compare/${ev.comparison.slug}`}
                        className="font-medium text-brand-500 transition-colors hover:underline"
                      >
                        {ev.comparison.genericProductName} vs {ev.comparison.nameBrandProductName}
                      </Link>
                    ) : (
                      <span>
                        {ev.comparison.genericProductName} vs {ev.comparison.nameBrandProductName}
                      </span>
                    )}
                    <span>{formatDate(ev.createdAt)}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

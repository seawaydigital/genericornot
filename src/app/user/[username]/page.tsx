import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { VerdictBadge } from "@/components/comparison/VerdictBadge";
import { Badge } from "@/components/ui/Badge";
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
            category: { select: { name: true, icon: true } },
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

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-12 space-y-10">
      <section className="glass rounded-2xl p-6 flex flex-wrap items-center gap-5">
        <div className="rounded-full bg-[#0d1b4a]/10 flex items-center justify-center text-2xl font-bold text-[#0d1b4a] shrink-0 w-[72px] h-[72px]" aria-hidden="true">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 break-all">{user.username}</h1>
          <p className="text-gray-500 text-xs mt-1">Member since {formatMonthYear(user.createdAt)}</p>
          {isOwner && (
            <p className="text-gray-500 text-xs mt-1">
              This is your public profile. Only your nickname and approved contributions are visible to others.
            </p>
          )}
        </div>
        <div className="ml-auto flex gap-6 text-center">
          <div><p className="text-gray-900 font-bold text-lg">{comparisons.length}</p><p className="text-gray-500 text-xs">Comparisons</p></div>
          <div><p className="text-gray-900 font-bold text-lg">{evidence.length}</p><p className="text-gray-500 text-xs">Evidence</p></div>
          <div><p className="text-gray-900 font-bold text-lg">{user._count.votes}</p><p className="text-gray-500 text-xs">Votes</p></div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="accent-line"><h2 className="text-lg font-semibold text-gray-900">Submitted Comparisons <span className="text-gray-500 font-normal text-sm ml-2">({comparisons.length})</span></h2></div>
        {comparisons.length === 0 ? (<p className="text-gray-500 text-sm">No comparisons submitted yet.</p>) : (
          <div className="space-y-3">
            {comparisons.map((comp) => {
              const statusInfo = statusConfig[comp.status] ?? statusConfig.PENDING;
              const display = getDisplayVerdict(comp);
              return (
                <div key={comp.id} className="glass rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    {comp.status === "APPROVED" ? (
                      <Link href={`/compare/${comp.slug}`} className="text-gray-900 font-medium hover:text-[#0d1b4a] transition-colors text-sm leading-snug block">{comp.genericProductName} vs {comp.nameBrandProductName}</Link>
                    ) : (<p className="text-gray-900 font-medium text-sm leading-snug">{comp.genericProductName} vs {comp.nameBrandProductName}</p>)}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {comp.category && <span className="text-gray-500 text-xs">{comp.category.icon} {comp.category.name}</span>}
                      <span className="text-gray-400 text-xs">{formatDate(comp.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {comp.status === "APPROVED" && <VerdictBadge verdict={display.verdict} size="sm" />}
                    {isOwner && <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="accent-line"><h2 className="text-lg font-semibold text-gray-900">Evidence Contributions <span className="text-gray-500 font-normal text-sm ml-2">({evidence.length})</span></h2></div>
        {evidence.length === 0 ? (<p className="text-gray-500 text-sm">No evidence submitted yet.</p>) : (
          <div className="space-y-3">
            {evidence.map((ev) => (
              <div key={ev.id} className="glass rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-gray-900 text-sm font-medium">{ev.title}</p>
                  {isOwner && ev.status !== "APPROVED" && (
                    <Badge variant={(statusConfig[ev.status] ?? statusConfig.PENDING).variant} className="text-xs shrink-0">
                      {(statusConfig[ev.status] ?? statusConfig.PENDING).label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-gray-500 text-xs capitalize">{ev.type.replace(/_/g, " ").toLowerCase()}</span>
                  <span className="h-2.5 w-px bg-gray-200" aria-hidden="true" />
                  {ev.comparison.status === "APPROVED" ? (
                    <Link href={`/compare/${ev.comparison.slug}`} className="text-gray-600 hover:text-[#0d1b4a] transition-colors text-xs">{ev.comparison.genericProductName} vs {ev.comparison.nameBrandProductName}</Link>
                  ) : (
                    <span className="text-gray-600 text-xs">{ev.comparison.genericProductName} vs {ev.comparison.nameBrandProductName}</span>
                  )}
                  <span className="h-2.5 w-px bg-gray-200" aria-hidden="true" />
                  <span className="text-gray-400 text-xs">{formatDate(ev.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

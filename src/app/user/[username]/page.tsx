import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { VerdictBadge } from "@/components/comparison/VerdictBadge";
import { Badge } from "@/components/ui/Badge";

interface PageProps { params: Promise<{ username: string }>; }

async function getUser(username: string) {
  try {
    return await prisma.user.findUnique({
      where: { username },
      select: {
        id: true, name: true, username: true, image: true, createdAt: true,
        comparisons: { orderBy: { createdAt: "desc" }, select: { id: true, slug: true, genericProductName: true, nameBrandProductName: true, verdict: true, status: true, createdAt: true, category: { select: { name: true, icon: true } } } },
        evidence: { orderBy: { createdAt: "desc" }, take: 20, select: { id: true, title: true, type: true, createdAt: true, comparison: { select: { slug: true, genericProductName: true, nameBrandProductName: true } } } },
      },
    });
  } catch { return null; }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);
  if (!user) return { title: "User Not Found — GenericOrNot" };
  return { title: `${user.name}'s Profile — GenericOrNot`, description: `${user.name} has submitted ${user.comparisons.length} comparison${user.comparisons.length !== 1 ? "s" : ""} on GenericOrNot.` };
}

const statusConfig: Record<string, { label: string; variant: "success" | "neutral" | "danger" }> = {
  APPROVED: { label: "Approved", variant: "success" }, PENDING: { label: "Pending", variant: "neutral" }, REJECTED: { label: "Rejected", variant: "danger" },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date));
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const user = await getUser(username);
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-12 space-y-10">
      <section className="glass rounded-2xl p-6 flex items-center gap-5">
        {user.image ? (
          <Image src={user.image} alt={user.name} width={72} height={72} className="rounded-full" />
        ) : (
          <div className="rounded-full bg-[#0d1b4a]/10 flex items-center justify-center text-2xl font-bold text-[#0d1b4a] shrink-0 w-[72px] h-[72px]">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 text-sm">@{user.username}</p>
          <p className="text-gray-400 text-xs mt-1">Member since {formatDate(user.createdAt)}</p>
        </div>
        <div className="ml-auto flex gap-6 text-center">
          <div><p className="text-gray-900 font-bold text-lg">{user.comparisons.length}</p><p className="text-gray-400 text-xs">Comparisons</p></div>
          <div><p className="text-gray-900 font-bold text-lg">{user.evidence.length}</p><p className="text-gray-400 text-xs">Evidence</p></div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="accent-line"><h2 className="text-lg font-semibold text-gray-900">Submitted Comparisons <span className="text-gray-400 font-normal text-sm ml-2">({user.comparisons.length})</span></h2></div>
        {user.comparisons.length === 0 ? (<p className="text-gray-400 text-sm">No comparisons submitted yet.</p>) : (
          <div className="space-y-3">
            {user.comparisons.map((comp) => {
              const statusInfo = statusConfig[comp.status] ?? statusConfig.PENDING;
              return (
                <div key={comp.id} className="glass rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    {comp.status === "APPROVED" ? (
                      <Link href={`/compare/${comp.slug}`} className="text-gray-900 font-medium hover:text-[#0d1b4a] transition-colors text-sm leading-snug block">{comp.genericProductName} vs {comp.nameBrandProductName}</Link>
                    ) : (<p className="text-gray-900 font-medium text-sm leading-snug">{comp.genericProductName} vs {comp.nameBrandProductName}</p>)}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {comp.category && <span className="text-gray-400 text-xs">{comp.category.icon} {comp.category.name}</span>}
                      <span className="text-gray-300 text-xs">{formatDate(comp.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {comp.status === "APPROVED" && <VerdictBadge verdict={comp.verdict} size="sm" />}
                    <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="accent-line"><h2 className="text-lg font-semibold text-gray-900">Evidence Contributions <span className="text-gray-400 font-normal text-sm ml-2">({user.evidence.length})</span></h2></div>
        {user.evidence.length === 0 ? (<p className="text-gray-400 text-sm">No evidence submitted yet.</p>) : (
          <div className="space-y-3">
            {user.evidence.map((ev) => (
              <div key={ev.id} className="glass rounded-2xl p-4">
                <p className="text-gray-900 text-sm font-medium">{ev.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-gray-400 text-xs capitalize">{ev.type.replace(/_/g, " ").toLowerCase()}</span>
                  <span className="h-2.5 w-px bg-gray-200" />
                  <Link href={`/compare/${ev.comparison.slug}`} className="text-gray-500 hover:text-[#0d1b4a] transition-colors text-xs">{ev.comparison.genericProductName} vs {ev.comparison.nameBrandProductName}</Link>
                  <span className="h-2.5 w-px bg-gray-200" />
                  <span className="text-gray-300 text-xs">{formatDate(ev.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

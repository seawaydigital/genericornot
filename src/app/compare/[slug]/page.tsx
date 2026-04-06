import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { computeSavings } from "@/lib/verdict";
import { getComparisonMetadata, getComparisonJsonLd } from "@/lib/seo";
import { BrandHero } from "@/components/comparison/BrandHero";
import { GenericAlternative } from "@/components/comparison/GenericAlternative";
import { QuickFacts } from "@/components/comparison/QuickFacts";
import { EvidenceList } from "@/components/comparison/EvidenceList";
import { VoteButtons } from "@/components/comparison/VoteButtons";
import { VoteBreakdown } from "@/components/comparison/VoteBreakdown";
import { EvidenceForm } from "@/components/comparison/EvidenceForm";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getComparison(slug: string) {
  try {
    const comparison = await prisma.productComparison.findUnique({
      where: { slug },
      include: {
        category: true,
        evidence: {
          include: { user: { select: { username: true } } },
          orderBy: { createdAt: "desc" },
        },
        votes: {
          select: { value: true },
        },
      },
    });
    return comparison;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = await getComparison(slug);

  if (!comparison || comparison.status !== "APPROVED") {
    return { title: "Comparison Not Found — GenericOrNot" };
  }

  return getComparisonMetadata({
    ...comparison,
    genericPrice: comparison.genericPrice ? Number(comparison.genericPrice) : null,
    nameBrandPrice: comparison.nameBrandPrice ? Number(comparison.nameBrandPrice) : null,
  });
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const comparison = await getComparison(slug);

  if (!comparison || comparison.status !== "APPROVED") {
    notFound();
  }

  const genericPrice = comparison.genericPrice ? Number(comparison.genericPrice) : null;
  const nameBrandPrice = comparison.nameBrandPrice ? Number(comparison.nameBrandPrice) : null;
  const savings = computeSavings(genericPrice, nameBrandPrice);

  function deriveVoteCounts(verdict: string, total: number) {
    if (total === 0) return { sameQuality: 0, closeEnough: 0, notWorthIt: 0 };
    let sq: number, ce: number, nwi: number;
    if (verdict === "SAME_QUALITY") {
      sq = Math.round(total * 0.70); ce = Math.round(total * 0.20); nwi = total - sq - ce;
    } else if (verdict === "CLOSE_ENOUGH") {
      ce = Math.round(total * 0.50); sq = Math.round(total * 0.25); nwi = total - sq - ce;
    } else if (verdict === "NOT_WORTH_IT") {
      nwi = Math.round(total * 0.70); ce = Math.round(total * 0.20); sq = total - nwi - ce;
    } else {
      sq = Math.round(total / 3); ce = Math.round(total / 3); nwi = total - sq - ce;
    }
    return { sameQuality: Math.max(0, sq), closeEnough: Math.max(0, ce), notWorthIt: Math.max(0, nwi) };
  }

  const liveVoteCounts = { sameQuality: 0, closeEnough: 0, notWorthIt: 0 };
  for (const vote of comparison.votes) {
    if (vote.value === "SAME_QUALITY") liveVoteCounts.sameQuality++;
    else if (vote.value === "CLOSE_ENOUGH") liveVoteCounts.closeEnough++;
    else if (vote.value === "NOT_WORTH_IT") liveVoteCounts.notWorthIt++;
  }
  const hasLiveVotes = comparison.votes.length > 0;
  const voteCounts = hasLiveVotes
    ? liveVoteCounts
    : deriveVoteCounts(comparison.verdict, comparison.totalVotes);

  const session = await getServerSession(authOptions);
  let userVote: string | null = null;
  if (session?.user?.id) {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_comparisonId: {
          userId: session.user.id,
          comparisonId: comparison.id,
        },
      },
      select: { value: true },
    });
    userVote = vote?.value ?? null;
  }

  const evidence = comparison.evidence.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    content: e.content,
    url: e.url ?? null,
    confidence: e.confidence,
    createdAt: e.createdAt,
    user: { username: e.user.username },
  }));

  const jsonLd = getComparisonJsonLd({
    ...comparison,
    genericPrice: genericPrice,
    nameBrandPrice: nameBrandPrice,
  });

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-12">
        {/* 2-column layout on desktop */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Brand hero */}
            <BrandHero
              nameBrandProductName={comparison.nameBrandProductName}
              nameBrand={comparison.nameBrand}
              nameBrandPrice={nameBrandPrice}
              verdict={comparison.verdict}
              confidenceScore={comparison.confidenceScore}
              totalVotes={comparison.totalVotes}
              savings={savings}
              categoryIcon={comparison.category?.icon ?? "\u{1F4E6}"}
              lastVerifiedAt={comparison.lastVerifiedAt ? comparison.lastVerifiedAt.toISOString() : null}
              flaggedOutdated={comparison.flaggedOutdated}
              slug={comparison.slug}
            />

            {/* Generic alternative */}
            <GenericAlternative
              genericProductName={comparison.genericProductName}
              genericBrand={comparison.genericBrand}
              genericStore={comparison.genericStore}
              genericPrice={genericPrice}
              categoryIcon={comparison.category?.icon ?? "\u{1F4E6}"}
            />

            {/* Vote breakdown inline */}
            {comparison.totalVotes > 0 && (
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="glass rounded-2xl p-3">
                  <p className="text-emerald-700 font-semibold text-sm">{voteCounts.sameQuality}</p>
                  <p className="text-gray-400 mt-0.5">Same Quality</p>
                </div>
                <div className="glass rounded-2xl p-3">
                  <p className="text-amber-700 font-semibold text-sm">{voteCounts.closeEnough}</p>
                  <p className="text-gray-400 mt-0.5">Close Enough</p>
                </div>
                <div className="glass rounded-2xl p-3">
                  <p className="text-red-700 font-semibold text-sm">{voteCounts.notWorthIt}</p>
                  <p className="text-gray-400 mt-0.5">Not Worth It</p>
                </div>
              </div>
            )}

            {/* Evidence list */}
            <EvidenceList evidence={evidence} />

            {/* Evidence submission form */}
            <EvidenceForm comparisonId={comparison.id} />
          </div>

          {/* Sidebar */}
          <aside className="mt-8 lg:mt-0 space-y-6">
            {/* Voting card */}
            <div className="glass rounded-2xl p-6 space-y-5 lg:sticky lg:top-20">
              <VoteButtons
                comparisonId={comparison.id}
                initialVote={userVote}
                initialVoteCounts={voteCounts}
              />
              <VoteBreakdown
                sameQuality={voteCounts.sameQuality}
                closeEnough={voteCounts.closeEnough}
                notWorthIt={voteCounts.notWorthIt}
                totalVotes={comparison.totalVotes}
              />
            </div>

            {/* Quick facts */}
            <QuickFacts evidence={evidence} />
          </aside>
        </div>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { computeSavings } from "@/lib/verdict";
import { getComparisonMetadata, getComparisonJsonLd } from "@/lib/seo";
import { VerdictBadge } from "@/components/comparison/VerdictBadge";
import { ProductSideBySide } from "@/components/comparison/ProductSideBySide";
import { QuickFacts } from "@/components/comparison/QuickFacts";
import { EvidenceList } from "@/components/comparison/EvidenceList";
import { VoteButtons } from "@/components/comparison/VoteButtons";
import { VoteBreakdown } from "@/components/comparison/VoteBreakdown";
import { EvidenceForm } from "@/components/comparison/EvidenceForm";
import { FreshnessIndicator } from "@/components/comparison/FreshnessIndicator";
import { FlagOutdatedButton } from "@/components/comparison/FlagOutdatedButton";

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

  // Tally vote breakdown
  const voteCounts = { sameQuality: 0, closeEnough: 0, notWorthIt: 0 };
  for (const vote of comparison.votes) {
    if (vote.value === "SAME_QUALITY") voteCounts.sameQuality++;
    else if (vote.value === "CLOSE_ENOUGH") voteCounts.closeEnough++;
    else if (vote.value === "NOT_WORTH_IT") voteCounts.notWorthIt++;
  }

  // Get current user's vote (if authenticated)
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
    <div className="min-h-screen bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-10 space-y-8">
        {/* Verdict banner */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-white font-bold text-xl mb-3">
                {comparison.genericProductName}{" "}
                <span className="text-gray-500 font-normal">vs</span>{" "}
                {comparison.nameBrandProductName}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <VerdictBadge verdict={comparison.verdict} size="md" />
                <span className="text-gray-400 text-sm">
                  {comparison.confidenceScore}% confidence
                </span>
                <span className="text-gray-500 text-sm">
                  {comparison.totalVotes} vote{comparison.totalVotes !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            {savings !== null && (
              <div className="flex flex-col items-end">
                <span className="text-emerald-400 text-3xl font-extrabold">
                  Save {savings}%
                </span>
                <span className="text-gray-500 text-xs mt-0.5">vs name brand</span>
              </div>
            )}
          </div>

          {/* Freshness + flag */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <FreshnessIndicator
              lastVerifiedAt={comparison.lastVerifiedAt ?? null}
              flaggedOutdated={comparison.flaggedOutdated}
            />
            <FlagOutdatedButton slug={comparison.slug} />
          </div>

          {/* Vote breakdown */}
          {comparison.totalVotes > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-emerald-500/10 rounded-lg p-2">
                <p className="text-emerald-400 font-semibold text-sm">{voteCounts.sameQuality}</p>
                <p className="text-gray-500 mt-0.5">Same Quality</p>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-2">
                <p className="text-amber-400 font-semibold text-sm">{voteCounts.closeEnough}</p>
                <p className="text-gray-500 mt-0.5">Close Enough</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-2">
                <p className="text-red-400 font-semibold text-sm">{voteCounts.notWorthIt}</p>
                <p className="text-gray-500 mt-0.5">Not Worth It</p>
              </div>
            </div>
          )}
        </section>

        {/* Products side by side */}
        <section>
          <ProductSideBySide
            genericProductName={comparison.genericProductName}
            genericBrand={comparison.genericBrand}
            genericStore={comparison.genericStore}
            genericPrice={genericPrice}
            nameBrandProductName={comparison.nameBrandProductName}
            nameBrand={comparison.nameBrand}
            nameBrandPrice={nameBrandPrice}
            categoryIcon={comparison.category?.icon ?? "📦"}
          />
        </section>

        {/* Quick facts */}
        <section>
          <QuickFacts evidence={evidence} />
        </section>

        {/* Voting */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
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
        </section>

        {/* Evidence list */}
        <section>
          <EvidenceList evidence={evidence} />
        </section>

        {/* Evidence submission form */}
        <section>
          <EvidenceForm comparisonId={comparison.id} />
        </section>
      </div>
    </div>
  );
}

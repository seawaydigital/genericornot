import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { computeSavings, tallyVotes } from "@/lib/verdict";
import { decimalToNumber } from "@/lib/comparisons";
import { getComparisonMetadata, getComparisonJsonLd } from "@/lib/seo";
import { BrandHero } from "@/components/comparison/BrandHero";
import { GenericAlternative } from "@/components/comparison/GenericAlternative";
import { PriceComparison } from "@/components/comparison/PriceComparison";
import { HealthNotice } from "@/components/comparison/HealthNotice";
import { QuickFacts } from "@/components/comparison/QuickFacts";
import { EvidenceList } from "@/components/comparison/EvidenceList";
import { VotePanel } from "@/components/comparison/VotePanel";
import { EvidenceForm } from "@/components/comparison/EvidenceForm";
import { AdminTools } from "@/components/comparison/AdminTools";

// Cached and shared by every visitor; per-user state (your vote) loads
// client-side, and votes/evidence/admin actions revalidate this path.
export const revalidate = 60;

// Render each comparison on its first visit, then serve it from cache (ISR).
// Without this, a dynamic [slug] route is rendered on every request.
export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getComparison = cache(async (slug: string) => {
  try {
    const comparison = await prisma.productComparison.findUnique({
      where: { slug },
      include: {
        category: true,
        evidence: {
          where: { status: "APPROVED" },
          include: { user: { select: { username: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!comparison || comparison.status !== "APPROVED") return null;

    const voteGroups = await prisma.vote.groupBy({
      by: ["value"],
      where: { comparisonId: comparison.id },
      _count: true,
    });
    const counts = tallyVotes(voteGroups.map((g) => ({ value: g.value, count: g._count })));

    return { comparison, counts };
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getComparison(slug);

  if (!data) {
    return { title: "Comparison Not Found — GenericOrNot" };
  }

  const { comparison } = data;
  return getComparisonMetadata({
    ...comparison,
    genericPrice: decimalToNumber(comparison.genericPrice),
    nameBrandPrice: decimalToNumber(comparison.nameBrandPrice),
  });
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getComparison(slug);

  if (!data) {
    notFound();
  }

  const { comparison, counts } = data;
  const genericPrice = decimalToNumber(comparison.genericPrice);
  const nameBrandPrice = decimalToNumber(comparison.nameBrandPrice);
  const savings = computeSavings(genericPrice, nameBrandPrice, comparison.genericSize, comparison.nameBrandSize);
  const categoryIcon = comparison.category?.icon ?? "\u{1F4E6}";

  const evidence = comparison.evidence.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    content: e.content,
    url: e.url ?? null,
    confidence: e.confidence,
    createdAt: e.createdAt.toISOString(),
    user: { username: e.user.username },
  }));

  const jsonLd = getComparisonJsonLd({
    ...comparison,
    genericPrice,
    nameBrandPrice,
  });

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        // JSON.stringify doesn't escape "<", so a product name containing
        // "</script>" could break out of the tag. Escape it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12">
        {comparison.category && (
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-gray-500">
            <Link href="/categories" className="hover:text-gray-800">Categories</Link>
            <span className="mx-1.5" aria-hidden="true">/</span>
            <Link href={`/categories/${comparison.category.slug}`} className="hover:text-gray-800">
              {comparison.category.name}
            </Link>
          </nav>
        )}

        {/* One DOM order for every screen size: on mobile the vote card sits
            right after the products; on desktop grid placement moves it into
            a sticky sidebar. A single VotePanel keeps one source of truth. */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
          <div className="lg:col-span-2 space-y-6">
            <BrandHero
              nameBrandProductName={comparison.nameBrandProductName}
              nameBrand={comparison.nameBrand}
              nameBrandPrice={nameBrandPrice}
              nameBrandSize={comparison.nameBrandSize}
              verdict={comparison.verdict}
              editorialVerdict={comparison.editorialVerdict}
              editorialNote={comparison.editorialNote}
              confidenceScore={comparison.confidenceScore}
              totalVotes={counts.sameQuality + counts.closeEnough + counts.notWorthIt}
              savings={savings}
              categoryIcon={categoryIcon}
              lastVerifiedAt={comparison.lastVerifiedAt ? comparison.lastVerifiedAt.toISOString() : null}
              flaggedOutdated={comparison.flaggedOutdated}
              slug={comparison.slug}
            />

            <GenericAlternative
              genericProductName={comparison.genericProductName}
              genericBrand={comparison.genericBrand}
              genericStore={comparison.genericStore}
              genericPrice={genericPrice}
              genericSize={comparison.genericSize}
              categoryIcon={categoryIcon}
            />
          </div>

          <aside className="space-y-6 lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-20">
            <div className="glass rounded-2xl p-6">
              <VotePanel
                comparisonId={comparison.id}
                slug={comparison.slug}
                genericBrand={comparison.genericBrand}
                nameBrand={comparison.nameBrand}
                initialCounts={counts}
              />
            </div>

            <QuickFacts evidence={evidence} />
          </aside>

          <div className="lg:col-span-2 space-y-6">
            <PriceComparison
              genericBrand={comparison.genericBrand}
              genericPrice={genericPrice}
              genericSize={comparison.genericSize}
              nameBrand={comparison.nameBrand}
              nameBrandPrice={nameBrandPrice}
              nameBrandSize={comparison.nameBrandSize}
            />

            <HealthNotice categorySlug={comparison.category?.slug} />

            <EvidenceList evidence={evidence} />

            <EvidenceForm comparisonId={comparison.id} slug={comparison.slug} />

            <AdminTools comparisonId={comparison.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

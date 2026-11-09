import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { tallyVotes } from "@/lib/verdict";
import { comparisonCardInclude, decimalToNumber, toCardData, type ComparisonCardData } from "@/lib/comparisons";
import { getComparisonMetadata, getComparisonJsonLd } from "@/lib/seo";
import { ComparisonHero } from "@/components/comparison/ComparisonHero";
import { HealthNotice } from "@/components/comparison/HealthNotice";
import { QuickFacts } from "@/components/comparison/QuickFacts";
import { EvidenceList } from "@/components/comparison/EvidenceList";
import { VotePanel } from "@/components/comparison/VotePanel";
import { EvidenceForm } from "@/components/comparison/EvidenceForm";
import { AdminTools } from "@/components/comparison/AdminTools";
import { ProductCard } from "@/components/comparison/ProductCard";

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

const RELATED_LIMIT = 3;

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

/** Other approved swaps in the same category, most-voted first. */
async function getRelated(comparisonId: string, categoryId: string | null): Promise<ComparisonCardData[]> {
  if (!categoryId) return [];
  try {
    const rows = await prisma.productComparison.findMany({
      where: { categoryId, status: "APPROVED", id: { not: comparisonId } },
      include: comparisonCardInclude,
      orderBy: [{ featured: "desc" }, { totalVotes: "desc" }, { createdAt: "desc" }],
      take: RELATED_LIMIT,
    });
    return rows.map(toCardData);
  } catch {
    return [];
  }
}

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
  const totalVotes = counts.sameQuality + counts.closeEnough + counts.notWorthIt;
  const related = await getRelated(comparison.id, comparison.categoryId);

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
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 md:px-6 md:pt-8">
        <nav aria-label="Breadcrumb" className="-my-2 mb-3">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
            <li>
              <Link href="/" className="inline-flex min-h-11 items-center rounded-md px-1 transition-colors hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5 text-subtle" />
            </li>
            <li>
              <Link href="/categories" className="inline-flex min-h-11 items-center rounded-md px-1 transition-colors hover:text-ink">
                Categories
              </Link>
            </li>
            {comparison.category && (
              <>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5 text-subtle" />
                </li>
                <li>
                  <Link
                    href={`/categories/${comparison.category.slug}`}
                    className="inline-flex min-h-11 items-center rounded-md px-1 font-medium text-ink transition-colors hover:text-brand-500"
                  >
                    {comparison.category.name}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>

        <ComparisonHero
          slug={comparison.slug}
          nameBrandProductName={comparison.nameBrandProductName}
          nameBrand={comparison.nameBrand}
          nameBrandPrice={nameBrandPrice}
          nameBrandSize={comparison.nameBrandSize}
          genericProductName={comparison.genericProductName}
          genericBrand={comparison.genericBrand}
          genericStore={comparison.genericStore}
          genericPrice={genericPrice}
          genericSize={comparison.genericSize}
          verdict={comparison.verdict}
          editorialVerdict={comparison.editorialVerdict}
          editorialNote={comparison.editorialNote}
          totalVotes={totalVotes}
          voteCounts={counts}
          lastVerifiedAt={comparison.lastVerifiedAt ? comparison.lastVerifiedAt.toISOString() : null}
          flaggedOutdated={comparison.flaggedOutdated}
        />

        {/* One DOM order for every screen size. On mobile: health note, vote,
            quick facts, then the evidence. On desktop the vote card and quick
            facts move into a sticky sidebar. The "auto 1fr" rows keep the
            sidebar's extra height out of the gap under the health note. */}
        <div className="mt-8 flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-10">
          <HealthNotice categorySlug={comparison.category?.slug} className="lg:col-start-1 lg:row-start-1" />

          <aside
            aria-label="Vote and quick facts"
            className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1"
          >
            <div id="vote" className="card scroll-mt-24 p-6">
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

          <div className="flex min-w-0 flex-col gap-8 lg:col-start-1">
            <EvidenceList evidence={evidence} />

            <EvidenceForm comparisonId={comparison.id} slug={comparison.slug} />

            <AdminTools comparisonId={comparison.id} />
          </div>
        </div>

        {related.length > 0 && comparison.category && (
          <section aria-labelledby="related-heading" className="mt-16 border-t border-line pt-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Keep comparing</p>
                <h2 id="related-heading" className="mt-1.5 font-display text-3xl leading-none tracking-tight text-ink sm:text-4xl">
                  More swaps in {comparison.category.name}
                </h2>
              </div>
              <Link
                href={`/categories/${comparison.category.slug}`}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-brand-500 transition-colors hover:text-brand"
              >
                All {comparison.category.name} swaps
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <ProductCard {...item} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

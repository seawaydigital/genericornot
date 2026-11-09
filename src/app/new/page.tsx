import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/comparison/ProductCard";
import { comparisonCardInclude, toCardData } from "@/lib/comparisons";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "New Comparisons — GenericOrNot",
  description:
    "The latest store-brand vs name-brand comparisons added by Canadian shoppers on GenericOrNot.",
};

async function getNewComparisons() {
  try {
    const rows = await prisma.productComparison.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 24,
      include: comparisonCardInclude,
    });
    return rows.map(toCardData);
  } catch {
    return [];
  }
}

export default async function NewPage() {
  const comparisons = await getNewComparisons();

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Just added"
        title="New comparisons"
        description={<p>The latest store-brand matchups. Most are waiting for votes — yours helps set the verdict.</p>}
        actions={
          <Link
            href="/submit"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add a comparison
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        {comparisons.length === 0 ? (
          <EmptyState Icon={Sparkles} title="Nothing new yet">
            Be the first to add a store-brand comparison.
          </EmptyState>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((comparison) => (
              <li key={comparison.id}>
                <ProductCard {...comparison} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { SubmissionQueue } from "@/components/admin/SubmissionQueue";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard — GenericOrNot",
};

async function getPendingComparisons() {
  try {
    return await prisma.productComparison.findMany({
      where: { status: "PENDING" },
      include: {
        submittedBy: {
          select: { name: true, username: true },
        },
        category: {
          select: { name: true, icon: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const pending = await getPendingComparisons();

  // Serialize for client component (Decimal -> null-safe number)
  const comparisons = pending.map((c) => ({
    id: c.id,
    genericProductName: c.genericProductName,
    genericBrand: c.genericBrand,
    genericStore: c.genericStore,
    nameBrandProductName: c.nameBrandProductName,
    nameBrand: c.nameBrand,
    createdAt: c.createdAt.toISOString(),
    category: c.category ?? null,
    submittedBy: c.submittedBy ?? null,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm">
          {pending.length === 0
            ? "No pending submissions."
            : `${pending.length} submission${pending.length !== 1 ? "s" : ""} awaiting review.`}
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Pending Submissions</h2>
        <SubmissionQueue initialComparisons={comparisons} />
      </section>
    </div>
  );
}

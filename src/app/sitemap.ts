import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

// Regenerate hourly so newly approved comparisons get crawled without a redeploy.
export const revalidate = 3600;

const STATIC_PATHS: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }> = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/top-rated", priority: 0.8, changeFrequency: "daily" },
  { path: "/categories", priority: 0.8, changeFrequency: "weekly" },
  { path: "/new", priority: 0.6, changeFrequency: "daily" },
  { path: "/about", priority: 0.4, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.3, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.2, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  try {
    const [comparisons, categories] = await Promise.all([
      prisma.productComparison.findMany({
        where: { status: "APPROVED" },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.category.findMany({
        select: { slug: true },
      }),
    ]);

    const comparisonRoutes: MetadataRoute.Sitemap = comparisons.map((c) => ({
      url: `${SITE_URL}/compare/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${SITE_URL}/categories/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...comparisonRoutes, ...categoryRoutes];
  } catch {
    // Return static routes only when DB is unavailable
    return staticRoutes;
  }
}

import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = "https://genericornot.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];

  try {
    const [comparisons, categories] = await Promise.all([
      prisma.productComparison.findMany({
        where: { status: "APPROVED" },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const comparisonRoutes: MetadataRoute.Sitemap = comparisons.map((c) => ({
      url: `${BASE_URL}/compare/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${BASE_URL}/categories/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...comparisonRoutes, ...categoryRoutes];
  } catch {
    // Return static routes only when DB is unavailable
    return staticRoutes;
  }
}

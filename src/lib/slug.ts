import { prisma } from "@/lib/db";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80)
    .replace(/^-|-$/g, "");
}

export async function generateUniqueSlug(
  genericName: string,
  nameBrandName: string
): Promise<string> {
  const base = slugify(`${genericName} vs ${nameBrandName}`);

  const existing = await prisma.productComparison.findFirst({
    where: { slug: base },
    select: { id: true },
  });

  if (!existing) {
    return base;
  }

  let counter = 2;
  while (true) {
    const candidate = `${base}-${counter}`;
    const collision = await prisma.productComparison.findFirst({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!collision) {
      return candidate;
    }
    counter++;
  }
}

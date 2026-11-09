import Link from "next/link";
import { FileText, PlusCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface RecentEvidence {
  id: string; title: string; type: string; createdAt: Date;
  comparison: { slug: string; genericProductName: string; nameBrandProductName: string };
}

interface RecentComparison {
  id: string; slug: string; genericProductName: string; nameBrandProductName: string; createdAt: Date;
}

interface RecentActivityProps {
  evidence: RecentEvidence[];
  comparisons: RecentComparison[];
}

type ActivityItem = {
  type: "evidence" | "comparison";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  timestamp: Date;
};

export function RecentActivity({ evidence, comparisons }: RecentActivityProps) {
  const items: ActivityItem[] = [
    ...evidence.map((e) => ({
      type: "evidence" as const,
      id: `evidence-${e.id}`,
      title: `“${e.title}”`,
      subtitle: `${e.comparison.genericProductName} vs ${e.comparison.nameBrandProductName}`,
      href: `/compare/${e.comparison.slug}`,
      timestamp: e.createdAt,
    })),
    ...comparisons.map((c) => ({
      type: "comparison" as const,
      id: `comparison-${c.id}`,
      title: `${c.genericProductName} vs ${c.nameBrandProductName}`,
      subtitle: "New comparison",
      href: `/compare/${c.slug}`,
      timestamp: c.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  return (
    <section aria-labelledby="recent-activity-heading">
      <SectionHeading id="recent-activity-heading" eyebrow="Latest" title="Recent Contributions" />

      {items.length === 0 ? (
        <div className="mt-8 card p-8 text-center">
          <p className="text-muted">No activity yet. Be the first to contribute!</p>
        </div>
      ) : (
        <ol className="mt-8 card divide-y divide-line overflow-hidden">
          {items.map((item) => {
            const Icon = item.type === "evidence" ? FileText : PlusCircle;
            return (
              <li key={item.id}>
                <Link href={item.href} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-surface-2">
                  <span
                    className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                      item.type === "evidence" ? "bg-violet-100 text-violet-800" : "bg-good-bg text-good"
                    }`}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-subtle">
                      {item.type === "evidence" ? "Evidence" : "Comparison"}
                    </span>
                    <span className="mt-0.5 block font-medium leading-snug text-ink line-clamp-1">{item.title}</span>
                    {item.type === "evidence" && (
                      <span className="mt-0.5 block text-sm text-muted line-clamp-1">{item.subtitle}</span>
                    )}
                  </span>
                  <time dateTime={new Date(item.timestamp).toISOString()} className="shrink-0 pt-0.5 text-xs tabular-nums text-subtle">
                    {formatRelativeTime(item.timestamp)}
                  </time>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

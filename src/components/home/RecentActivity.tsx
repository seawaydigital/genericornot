import Link from "next/link";

interface RecentEvidence {
  id: string;
  title: string;
  type: string;
  createdAt: Date;
  comparison: {
    slug: string;
    genericProductName: string;
    nameBrandProductName: string;
  };
}

interface RecentComparison {
  id: string;
  slug: string;
  genericProductName: string;
  nameBrandProductName: string;
  createdAt: Date;
}

interface RecentActivityProps {
  evidence: RecentEvidence[];
  comparisons: RecentComparison[];
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

type ActivityItem =
  | { type: "evidence"; id: string; text: string; href: string; timestamp: Date }
  | { type: "comparison"; id: string; text: string; href: string; timestamp: Date };

export function RecentActivity({ evidence, comparisons }: RecentActivityProps) {
  const items: ActivityItem[] = [
    ...evidence.map((e) => ({
      type: "evidence" as const,
      id: `evidence-${e.id}`,
      text: `New evidence: "${e.title}" on ${e.comparison.genericProductName} vs ${e.comparison.nameBrandProductName}`,
      href: `/compare/${e.comparison.slug}`,
      timestamp: e.createdAt,
    })),
    ...comparisons.map((c) => ({
      type: "comparison" as const,
      id: `comparison-${c.id}`,
      text: `New comparison: ${c.genericProductName} vs ${c.nameBrandProductName}`,
      href: `/compare/${c.slug}`,
      timestamp: c.createdAt,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <section aria-labelledby="recent-activity-heading">
      <h2
        id="recent-activity-heading"
        className="text-2xl font-bold text-white mb-6"
      >
        🆕 Recent Contributions
      </h2>

      {items.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-500 text-sm">No activity yet. Be the first to contribute!</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 p-4">
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className="mt-0.5 flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border"
                  style={
                    item.type === "evidence"
                      ? { color: "#a78bfa", borderColor: "#7c3aed33", backgroundColor: "#7c3aed1a" }
                      : { color: "#34d399", borderColor: "#05966933", backgroundColor: "#0596691a" }
                  }
                >
                  {item.type === "evidence" ? "Evidence" : "Comparison"}
                </span>
                <Link
                  href={item.href}
                  className="text-sm text-gray-300 hover:text-white transition-colors line-clamp-2"
                >
                  {item.text}
                </Link>
              </div>
              <time
                dateTime={new Date(item.timestamp).toISOString()}
                className="flex-shrink-0 text-xs text-gray-500"
              >
                {formatRelativeTime(item.timestamp)}
              </time>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Camera,
  CircleHelp,
  ExternalLink,
  Factory,
  FlaskConical,
  MessageSquareText,
  ShieldCheck,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { formatDate } from "@/lib/format";

interface EvidenceUser {
  username: string;
}

interface Evidence {
  id: string;
  type: string;
  title: string;
  content: string;
  url?: string | null;
  confidence?: string | null;
  createdAt: Date | string;
  user: EvidenceUser;
}

interface EvidenceListProps {
  evidence: Evidence[];
}

const evidenceTypeConfig: Record<string, { label: string; Icon: LucideIcon; tint: string }> = {
  MANUFACTURER_INFO: { label: "Manufacturer Info", Icon: Factory, tint: "bg-amber-100 text-amber-900" },
  INGREDIENT_COMPARISON: { label: "Ingredients", Icon: FlaskConical, tint: "bg-sky-100 text-sky-900" },
  PHOTO: { label: "Photo", Icon: Camera, tint: "bg-violet-100 text-violet-900" },
  VIDEO_LINK: { label: "Video", Icon: Video, tint: "bg-rose-100 text-rose-900" },
  OTHER: { label: "Experience", Icon: MessageSquareText, tint: "bg-teal-100 text-teal-900" },
};

const fallbackType = { label: "Evidence", Icon: MessageSquareText, tint: "bg-paper-deep text-muted" };

const confidenceConfig: Record<string, { label: string; Icon: LucideIcon; className: string }> = {
  CONFIRMED: { label: "Confirmed", Icon: BadgeCheck, className: "bg-good-bg text-good ring-good-line" },
  COMMUNITY: { label: "Community Reported", Icon: Users, className: "bg-brand-50 text-brand ring-brand-100" },
  UNVERIFIED: { label: "Unverified", Icon: CircleHelp, className: "bg-neutral-bg text-neutral ring-neutral-line" },
};

function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Only render links we know are http(s); anything else is shown as text. */
function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function EvidenceList({ evidence }: EvidenceListProps) {
  const [showAll, setShowAll] = useState(false);

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="eyebrow">What we know</p>
        <h2 className="mt-1.5 font-display text-3xl leading-none tracking-tight text-ink">
          Evidence{" "}
          {evidence.length > 0 && <span className="font-sans text-base font-normal text-subtle">({evidence.length})</span>}
        </h2>
      </div>
      <p className="inline-flex items-center gap-1.5 text-xs text-muted">
        <ShieldCheck aria-hidden="true" className="h-4 w-4 text-good" />
        Every entry is reviewed before it appears
      </p>
    </div>
  );

  if (evidence.length === 0) {
    return (
      <section className="card p-6 sm:p-8">
        {header}
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-surface-2 p-6 text-center">
          <p className="text-muted">No evidence yet. Know something about how these compare? Add it below.</p>
        </div>
      </section>
    );
  }

  const visible = showAll ? evidence : evidence.slice(0, 3);
  const hasMore = evidence.length > 3;

  return (
    <section className="card p-6 sm:p-8">
      {header}
      <ol className="mt-6 space-y-4">
        {visible.map((entry) => {
          const typeConfig = evidenceTypeConfig[entry.type] ?? fallbackType;
          const conf = confidenceConfig[entry.confidence ?? "UNVERIFIED"] ?? confidenceConfig.UNVERIFIED;
          const host = entry.url && isHttpUrl(entry.url) ? hostname(entry.url) : null;
          return (
            <li key={entry.id}>
              <article className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                <span className={`hidden h-10 w-10 shrink-0 place-items-center rounded-xl sm:grid ${typeConfig.tint}`}>
                  <typeConfig.Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{typeConfig.label}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${conf.className}`}
                    >
                      <conf.Icon aria-hidden="true" className="h-3.5 w-3.5" />
                      {conf.label}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold leading-snug text-ink">{entry.title}</h3>
                  <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed text-muted">{entry.content}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
                    <span>
                      by <span className="font-semibold text-muted">{entry.user.username}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDate(entry.createdAt)}</span>
                    {entry.url && host && (
                      <a
                        href={entry.url}
                        target="_blank"
                        // User-supplied link: no referrer, no SEO credit, no opener access.
                        rel="nofollow ugc noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-brand-500 hover:text-brand"
                      >
                        View source ({host})
                        <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-line-strong hover:bg-surface-2"
        >
          Show all ({evidence.length})
        </button>
      )}
    </section>
  );
}

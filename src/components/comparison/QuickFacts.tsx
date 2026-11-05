import { BadgeCheck, CircleHelp, Factory, FlaskConical, Users, Video, type LucideIcon } from "lucide-react";

type ConfidenceLevel = "CONFIRMED" | "COMMUNITY" | "UNVERIFIED";

interface Evidence {
  type: string;
  confidence?: string | null;
}

interface QuickFactsProps {
  evidence: Evidence[];
}

interface Fact {
  label: string;
  Icon: LucideIcon;
  confidence: ConfidenceLevel;
}

const CONFIDENCE_ORDER: ConfidenceLevel[] = ["CONFIRMED", "COMMUNITY", "UNVERIFIED"];

function bestConfidence(evidences: Evidence[]): ConfidenceLevel {
  for (const level of CONFIDENCE_ORDER) {
    if (evidences.some((e) => (e.confidence ?? "UNVERIFIED") === level)) return level;
  }
  return "UNVERIFIED";
}

const confidenceBadge: Record<ConfidenceLevel, { label: string; Icon: LucideIcon; color: string }> = {
  CONFIRMED: { label: "Confirmed", Icon: BadgeCheck, color: "text-good" },
  COMMUNITY: { label: "Community", Icon: Users, color: "text-brand-500" },
  UNVERIFIED: { label: "Unverified", Icon: CircleHelp, color: "text-subtle" },
};

export function QuickFacts({ evidence }: QuickFactsProps) {
  const byType = (type: string) => evidence.filter((e) => e.type === type);

  const facts: Fact[] = [];
  const mfrEvidence = byType("MANUFACTURER_INFO");
  if (mfrEvidence.length > 0) {
    facts.push({ label: "Manufacturer Info", Icon: Factory, confidence: bestConfidence(mfrEvidence) });
  }
  const ingEvidence = byType("INGREDIENT_COMPARISON");
  if (ingEvidence.length > 0) {
    facts.push({ label: "Ingredients Compared", Icon: FlaskConical, confidence: bestConfidence(ingEvidence) });
  }
  const vidEvidence = byType("VIDEO_LINK");
  if (vidEvidence.length > 0) {
    facts.push({ label: "Video Review", Icon: Video, confidence: bestConfidence(vidEvidence) });
  }

  return (
    <section className="card p-6">
      <h2 className="text-sm font-semibold text-ink">Quick Facts</h2>
      {facts.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No details yet — be the first to contribute!</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {facts.map((fact) => {
            const badge = confidenceBadge[fact.confidence];
            return (
              <li key={fact.label} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-paper text-ink">
                  <fact.Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-ink">{fact.label}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${badge.color}`}>
                  <badge.Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {badge.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

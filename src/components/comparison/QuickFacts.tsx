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
  icon: string;
  confidence: ConfidenceLevel;
}

const CONFIDENCE_ORDER: ConfidenceLevel[] = ["CONFIRMED", "COMMUNITY", "UNVERIFIED"];

function bestConfidence(evidences: Evidence[]): ConfidenceLevel {
  for (const level of CONFIDENCE_ORDER) {
    if (evidences.some((e) => (e.confidence ?? "UNVERIFIED") === level)) return level;
  }
  return "UNVERIFIED";
}

const confidenceBadge: Record<ConfidenceLevel, { label: string; color: string }> = {
  CONFIRMED: { label: "Confirmed", color: "text-emerald-700" },
  COMMUNITY: { label: "Community", color: "text-blue-700" },
  UNVERIFIED: { label: "Unverified", color: "text-gray-400" },
};

export function QuickFacts({ evidence }: QuickFactsProps) {
  const byType = (type: string) => evidence.filter((e) => e.type === type);

  const facts: Fact[] = [];

  const mfrEvidence = byType("MANUFACTURER_INFO");
  if (mfrEvidence.length > 0) {
    facts.push({ label: "Same Manufacturer", icon: "\u2713", confidence: bestConfidence(mfrEvidence) });
  }
  const ingEvidence = byType("INGREDIENT_COMPARISON");
  if (ingEvidence.length > 0) {
    facts.push({ label: "Ingredients Compared", icon: "\u2713", confidence: bestConfidence(ingEvidence) });
  }
  const vidEvidence = byType("VIDEO_LINK");
  if (vidEvidence.length > 0) {
    facts.push({ label: "Video Review", icon: "\u2713", confidence: bestConfidence(vidEvidence) });
  }

  if (facts.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h2 className="text-gray-900 font-semibold text-base mb-3">Quick Facts</h2>
        <p className="text-gray-400 text-sm">
          No details yet — be the first to contribute!
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-gray-900 font-semibold text-base mb-4">Quick Facts</h2>
      <div className="grid grid-cols-3 gap-3">
        {facts.map((fact) => {
          const badge = confidenceBadge[fact.confidence];
          return (
            <div
              key={fact.label}
              className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl p-3 text-center"
            >
              <span className="text-emerald-600 font-bold text-lg">{fact.icon}</span>
              <span className="text-gray-600 text-xs font-medium leading-snug">{fact.label}</span>
              <span className={`text-xs ${badge.color}`}>{badge.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

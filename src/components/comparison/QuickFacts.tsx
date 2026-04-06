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
  CONFIRMED: { label: "Confirmed", color: "text-emerald-400" },
  COMMUNITY: { label: "Community", color: "text-blue-400" },
  UNVERIFIED: { label: "Unverified", color: "text-gray-500" },
};

export function QuickFacts({ evidence }: QuickFactsProps) {
  const byType = (type: string) => evidence.filter((e) => e.type === type);

  const facts: Fact[] = [];

  const mfrEvidence = byType("MANUFACTURER_INFO");
  if (mfrEvidence.length > 0) {
    facts.push({ label: "Same Manufacturer", icon: "✓", confidence: bestConfidence(mfrEvidence) });
  }
  const ingEvidence = byType("INGREDIENT_COMPARISON");
  if (ingEvidence.length > 0) {
    facts.push({ label: "Ingredients Compared", icon: "✓", confidence: bestConfidence(ingEvidence) });
  }
  const vidEvidence = byType("VIDEO_LINK");
  if (vidEvidence.length > 0) {
    facts.push({ label: "Video Review", icon: "✓", confidence: bestConfidence(vidEvidence) });
  }

  if (facts.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold text-base mb-3">Quick Facts</h2>
        <p className="text-gray-500 text-sm">
          No details yet — be the first to contribute!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-base">Quick Facts</h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {facts.map((fact) => {
          const badge = confidenceBadge[fact.confidence];
          return (
            <div
              key={fact.label}
              className="flex flex-col items-center gap-2 bg-gray-800/50 rounded-lg p-3 text-center"
            >
              <span className="text-emerald-400 font-bold text-lg">{fact.icon}</span>
              <span className="text-gray-300 text-xs font-medium leading-snug">{fact.label}</span>
              <span className={`text-xs ${badge.color}`}>{badge.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

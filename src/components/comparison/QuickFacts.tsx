interface Evidence {
  type: string;
}

interface QuickFactsProps {
  evidence: Evidence[];
}

interface Fact {
  label: string;
  icon: string;
}

export function QuickFacts({ evidence }: QuickFactsProps) {
  const types = new Set(evidence.map((e) => e.type));

  const facts: Fact[] = [];

  if (types.has("MANUFACTURER_INFO")) {
    facts.push({ label: "Same Manufacturer", icon: "✓" });
  }
  if (types.has("INGREDIENT_COMPARISON")) {
    facts.push({ label: "Ingredients Compared", icon: "✓" });
  }
  if (types.has("VIDEO_LINK")) {
    facts.push({ label: "Video Review", icon: "✓" });
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
        <span className="text-xs text-gray-500">community reported</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex flex-col items-center gap-2 bg-gray-800/50 rounded-lg p-3 text-center"
          >
            <span className="text-emerald-400 font-bold text-lg">{fact.icon}</span>
            <span className="text-gray-300 text-xs font-medium leading-snug">{fact.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

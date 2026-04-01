"use client";

import { Opportunity } from "@/lib/types";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const categoryColors: Record<string, string> = {
  market: "bg-blue-900/50 text-blue-300 border-blue-800",
  technology: "bg-purple-900/50 text-purple-300 border-purple-800",
  partnership: "bg-green-900/50 text-green-300 border-green-800",
  product: "bg-orange-900/50 text-orange-300 border-orange-800",
  investment: "bg-yellow-900/50 text-yellow-300 border-yellow-800",
  other: "bg-zinc-800/50 text-zinc-300 border-zinc-700",
};

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    value >= 0.7
      ? "bg-green-500"
      : value >= 0.4
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const catStyle =
    categoryColors[opportunity.category] || categoryColors.other;

  return (
    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-100">
          {opportunity.title}
        </h3>
        <span
          className={`text-xs px-2 py-0.5 rounded border shrink-0 ${catStyle}`}
        >
          {opportunity.category}
        </span>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed">
        {opportunity.summary}
      </p>

      <div>
        <p className="text-xs text-zinc-500 mb-1">Confidence</p>
        <ConfidenceBar value={opportunity.confidence} />
      </div>

      {opportunity.sources.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 mb-1">Sources</p>
          <ul className="space-y-0.5">
            {opportunity.sources.map((src, i) => (
              <li key={i} className="text-xs text-zinc-400 truncate">
                {src.startsWith("http") ? (
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {src}
                  </a>
                ) : (
                  src
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {opportunity.risks.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 mb-1">Risks</p>
          <ul className="space-y-0.5">
            {opportunity.risks.map((risk, i) => (
              <li key={i} className="text-xs text-red-400/80">
                • {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {opportunity.nextSteps.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 mb-1">Next Steps</p>
          <ul className="space-y-0.5">
            {opportunity.nextSteps.map((step, i) => (
              <li key={i} className="text-xs text-zinc-300">
                {i + 1}. {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

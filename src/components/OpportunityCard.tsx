"use client";

import { Opportunity } from "@/lib/types";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const categoryConfig: Record<string, { bg: string; text: string }> = {
  market: { bg: "bg-blue-500/10", text: "text-blue-400" },
  technology: { bg: "bg-violet-500/10", text: "text-violet-400" },
  partnership: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  product: { bg: "bg-orange-500/10", text: "text-orange-400" },
  investment: { bg: "bg-amber-500/10", text: "text-amber-400" },
  other: { bg: "bg-zinc-500/10", text: "text-zinc-400" },
};

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const gradient =
    value >= 0.7
      ? "from-emerald-500 to-emerald-400"
      : value >= 0.4
        ? "from-amber-500 to-yellow-400"
        : "from-red-500 to-red-400";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400 w-8 text-right tabular-nums font-medium">{pct}%</span>
    </div>
  );
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const cat = categoryConfig[opportunity.category] || categoryConfig.other;

  return (
    <div className="glass gradient-border rounded-xl p-5 space-y-4 hover:bg-white/[0.04] transition-smooth">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-100 leading-snug">
          {opportunity.title}
        </h3>
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${cat.bg} ${cat.text}`}>
          {opportunity.category}
        </span>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed">
        {opportunity.summary}
      </p>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1.5 font-medium">Confidence</p>
        <ConfidenceBar value={opportunity.confidence} />
      </div>

      {opportunity.sources.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1.5 font-medium">Sources</p>
          <ul className="space-y-1">
            {opportunity.sources.map((src, i) => (
              <li key={i} className="text-xs text-zinc-400 truncate">
                {src.startsWith("http") ? (
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
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
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1.5 font-medium">Risks</p>
          <ul className="space-y-1">
            {opportunity.risks.map((risk, i) => (
              <li key={i} className="text-xs text-red-400/80 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-red-400/60 mt-1.5 shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {opportunity.nextSteps.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1.5 font-medium">Next Steps</p>
          <ul className="space-y-1">
            {opportunity.nextSteps.map((step, i) => (
              <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

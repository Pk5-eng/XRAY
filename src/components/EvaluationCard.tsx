"use client";

import { Evaluation } from "@/lib/types";

interface EvaluationCardProps {
  evaluation: Evaluation;
}

function ScoreBadge({ score }: { score: number }) {
  const config =
    score >= 8
      ? { gradient: "from-emerald-500 to-emerald-400", shadow: "shadow-emerald-500/20" }
      : score >= 5
        ? { gradient: "from-amber-500 to-yellow-400", shadow: "shadow-amber-500/20" }
        : { gradient: "from-red-500 to-red-400", shadow: "shadow-red-500/20" };

  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold text-white bg-gradient-to-br ${config.gradient} shadow-lg ${config.shadow}`}
    >
      {score}
    </span>
  );
}

export default function EvaluationCard({ evaluation }: EvaluationCardProps) {
  return (
    <div className="glass rounded-xl p-4 flex items-start gap-4 hover:bg-white/[0.04] transition-smooth">
      <ScoreBadge score={evaluation.score} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-200">
          {evaluation.criterion}
        </p>
        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
          {evaluation.reasoning}
        </p>
      </div>
    </div>
  );
}

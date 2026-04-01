"use client";

import { Evaluation } from "@/lib/types";

interface EvaluationCardProps {
  evaluation: Evaluation;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8
      ? "bg-green-900/50 text-green-300 border-green-800"
      : score >= 5
        ? "bg-yellow-900/50 text-yellow-300 border-yellow-800"
        : "bg-red-900/50 text-red-300 border-red-800";

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded text-sm font-bold border ${color}`}
    >
      {score}
    </span>
  );
}

export default function EvaluationCard({ evaluation }: EvaluationCardProps) {
  return (
    <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-950 flex items-start gap-3">
      <ScoreBadge score={evaluation.score} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-300">
          {evaluation.criterion}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
          {evaluation.reasoning}
        </p>
      </div>
    </div>
  );
}

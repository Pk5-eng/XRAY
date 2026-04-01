"use client";

import { TraceEntry } from "@/lib/types";
import { useEffect, useRef } from "react";

interface TraceLogProps {
  entries: TraceEntry[];
}

const typeConfig: Record<TraceEntry["type"], { color: string; bg: string; label: string }> = {
  system: { color: "text-zinc-400", bg: "bg-zinc-500/10", label: "SYS" },
  tool_call: { color: "text-indigo-400", bg: "bg-indigo-500/10", label: "CALL" },
  tool_result: { color: "text-emerald-400", bg: "bg-emerald-500/10", label: "RESULT" },
  thinking: { color: "text-amber-400", bg: "bg-amber-500/10", label: "THINK" },
  human_request: { color: "text-purple-400", bg: "bg-purple-500/10", label: "HUMAN?" },
  human_response: { color: "text-purple-300", bg: "bg-purple-500/10", label: "HUMAN>" },
  evaluation: { color: "text-orange-400", bg: "bg-orange-500/10", label: "EVAL" },
  error: { color: "text-red-400", bg: "bg-red-500/10", label: "ERR" },
  web_search: { color: "text-cyan-400", bg: "bg-cyan-500/10", label: "SEARCH" },
};

export default function TraceLog({ entries }: TraceLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  if (entries.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          Agent Trace
        </h3>
        <p className="text-xs text-zinc-600">Waiting for agent to start...</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Agent Trace
        </h3>
        <span className="text-xs text-zinc-600 tabular-nums">{entries.length} events</span>
      </div>
      <div className="overflow-y-auto max-h-[420px] p-3 space-y-1 font-mono text-xs">
        {entries.map((entry) => {
          const cfg = typeConfig[entry.type];
          return (
            <div key={entry.id} className="flex gap-2 leading-relaxed group hover:bg-white/[0.02] rounded px-1 -mx-1 py-0.5 transition-colors">
              <span className="text-zinc-600 shrink-0 w-14 text-right tabular-nums">
                {new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span
                className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${cfg.color} ${cfg.bg}`}
              >
                {cfg.label}
              </span>
              <span className="text-zinc-300 break-all">{entry.content}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

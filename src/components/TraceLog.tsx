"use client";

import { TraceEntry } from "@/lib/types";
import { useEffect, useRef } from "react";

interface TraceLogProps {
  entries: TraceEntry[];
}

const typeColors: Record<TraceEntry["type"], string> = {
  system: "text-zinc-500",
  tool_call: "text-blue-400",
  tool_result: "text-green-400",
  thinking: "text-yellow-400",
  human_request: "text-purple-400",
  human_response: "text-purple-300",
  evaluation: "text-orange-400",
  error: "text-red-400",
  web_search: "text-cyan-400",
};

const typeLabels: Record<TraceEntry["type"], string> = {
  system: "SYS",
  tool_call: "CALL",
  tool_result: "RESULT",
  thinking: "THINK",
  human_request: "HUMAN?",
  human_response: "HUMAN>",
  evaluation: "EVAL",
  error: "ERR",
  web_search: "SEARCH",
};

export default function TraceLog({ entries }: TraceLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  if (entries.length === 0) {
    return (
      <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950">
        <h3 className="text-sm font-medium text-zinc-400 mb-2">Agent Trace</h3>
        <p className="text-xs text-zinc-600">Waiting for agent to start...</p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950 flex flex-col">
      <div className="px-4 py-2 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-400">
          Agent Trace{" "}
          <span className="text-zinc-600">({entries.length})</span>
        </h3>
      </div>
      <div className="overflow-y-auto max-h-[400px] p-3 space-y-1 font-mono text-xs">
        {entries.map((entry) => (
          <div key={entry.id} className="flex gap-2 leading-relaxed">
            <span className="text-zinc-600 shrink-0 w-16 text-right">
              {new Date(entry.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span
              className={`shrink-0 w-14 text-right font-semibold ${typeColors[entry.type]}`}
            >
              {typeLabels[entry.type]}
            </span>
            <span className="text-zinc-300 break-all">{entry.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

"use client";

import { SessionMemory } from "@/lib/types";

interface MemoryPanelProps {
  sessions: SessionMemory[];
  onClear: () => void;
}

export default function MemoryPanel({ sessions, onClear }: MemoryPanelProps) {
  if (sessions.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Session Memory
        </h3>
        <p className="text-xs text-zinc-600">No prior sessions stored.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Session Memory
          <span className="text-zinc-600">({sessions.length})</span>
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-zinc-600 hover:text-red-400 transition-smooth"
        >
          Clear all
        </button>
      </div>
      <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="rounded-lg p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 space-y-2 transition-smooth"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-300 truncate">
                {session.query}
              </p>
              <span className="text-[10px] text-zinc-600 shrink-0 ml-2 tabular-nums">
                {new Date(session.timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-3 text-[10px] text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
                {session.opportunities.length} opportunities
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-orange-400/60" />
                {session.evaluations.length} evaluations
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-indigo-400/60" />
                {session.traceLength} traces
              </span>
            </div>
            {session.opportunities.length > 0 && (
              <div className="text-[10px] text-zinc-500 truncate">
                {session.opportunities.map((o) => o.title).join(" · ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

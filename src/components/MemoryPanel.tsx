"use client";

import { SessionMemory } from "@/lib/types";

interface MemoryPanelProps {
  sessions: SessionMemory[];
  onClear: () => void;
}

export default function MemoryPanel({ sessions, onClear }: MemoryPanelProps) {
  if (sessions.length === 0) {
    return (
      <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950">
        <h3 className="text-sm font-medium text-zinc-400 mb-2">
          Session Memory
        </h3>
        <p className="text-xs text-zinc-600">No prior sessions stored.</p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950">
      <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">
          Session Memory{" "}
          <span className="text-zinc-600">({sessions.length})</span>
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="border border-zinc-800 rounded p-2 space-y-1"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-300 truncate">
                {session.query}
              </p>
              <span className="text-xs text-zinc-600 shrink-0 ml-2">
                {new Date(session.timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-3 text-xs text-zinc-500">
              <span>{session.opportunities.length} opportunities</span>
              <span>{session.evaluations.length} evaluations</span>
              <span>{session.traceLength} trace entries</span>
            </div>
            {session.opportunities.length > 0 && (
              <div className="text-xs text-zinc-500">
                {session.opportunities
                  .map((o) => o.title)
                  .join(" • ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

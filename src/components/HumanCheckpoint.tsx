"use client";

import { useState } from "react";
import { HumanCheckpoint as HumanCheckpointType } from "@/lib/types";

interface HumanCheckpointProps {
  checkpoint: HumanCheckpointType;
  onAnswer: (answer: string) => void;
}

export default function HumanCheckpoint({
  checkpoint,
  onAnswer,
}: HumanCheckpointProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onAnswer(input.trim());
    setInput("");
  };

  return (
    <div className="border-2 border-purple-700 rounded-lg p-4 bg-purple-950/30 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
        <h3 className="text-sm font-semibold text-purple-300">
          Agent Paused — Human Input Required
        </h3>
      </div>

      <p className="text-sm text-zinc-300 leading-relaxed">
        {checkpoint.question}
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your response..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-medium rounded transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

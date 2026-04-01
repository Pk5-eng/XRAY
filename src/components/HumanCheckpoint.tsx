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
    <div className="relative rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10" />
      <div className="absolute inset-0 border border-purple-500/30 rounded-xl" />
      <div className="relative p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3">
            <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-50" />
            <div className="relative w-3 h-3 bg-purple-400 rounded-full" />
          </div>
          <h3 className="text-sm font-semibold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
            Agent Paused — Human Input Required
          </h3>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed pl-6">
          {checkpoint.question}
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 pl-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 glass rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-smooth"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white text-sm font-medium rounded-lg transition-smooth shadow-lg shadow-purple-500/20 disabled:shadow-none"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

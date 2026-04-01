"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Opportunity,
  Evaluation,
  TraceEntry,
  HumanCheckpoint as HumanCheckpointType,
  AnthropicMessage,
  ContentBlock,
  ToolUseBlock,
  SessionMemory,
  AgentConfig,
} from "@/lib/types";
import { loadSessions, saveSession, clearMemory, formatMemoryForAgent } from "@/lib/memory";
import TraceLog from "@/components/TraceLog";
import OpportunityCard from "@/components/OpportunityCard";
import EvaluationCard from "@/components/EvaluationCard";
import HumanCheckpointComponent from "@/components/HumanCheckpoint";
import MemoryPanel from "@/components/MemoryPanel";

// ============================================================
// Agent configuration
// ============================================================
const DEFAULT_CONFIG: AgentConfig = {
  maxIterations: 25,
  model: "claude-sonnet-4-20250514",
  temperature: 0.7,
};

// ============================================================
// Helper: generate unique IDs
// ============================================================
let idCounter = 0;
function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

// ============================================================
// Main page component
// ============================================================
export default function XrayPage() {
  // --- React state (triggers re-renders) ---
  const [query, setQuery] = useState("");
  const [running, setRunning] = useState(false);
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [checkpoint, setCheckpoint] = useState<HumanCheckpointType | null>(null);
  const [sessions, setSessions] = useState<SessionMemory[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- Refs for loop-internal state (avoids stale closures) ---
  const scratchpadRef = useRef<string>("");
  const traceRef = useRef<TraceEntry[]>([]);
  const evalCountRef = useRef<number>(0);

  // Load sessions from localStorage on mount
  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  // --- Trace helper: push entry to ref AND state ---
  const addTrace = useCallback(
    (type: TraceEntry["type"], content: string, metadata?: Record<string, unknown>) => {
      const entry: TraceEntry = {
        id: uid("trace"),
        timestamp: Date.now(),
        type,
        content,
        metadata,
      };
      traceRef.current = [...traceRef.current, entry];
      setTrace([...traceRef.current]);
    },
    []
  );

  // --- HITL pause: returns a Promise that resolves when human answers ---
  const waitForHuman = useCallback(
    (question: string, toolUseId: string): Promise<string> => {
      return new Promise<string>((resolve) => {
        // Set the checkpoint — this renders the HumanCheckpoint component.
        // The Promise stays pending until handleHumanAnswer calls resolve.
        setCheckpoint({ question, toolUseId, resolve });
      });
    },
    []
  );

  // --- Called by HumanCheckpoint component on form submit ---
  const handleHumanAnswer = useCallback(
    (answer: string) => {
      if (checkpoint) {
        addTrace("human_response", answer);
        checkpoint.resolve(answer); // This resumes the agent loop
        setCheckpoint(null);
      }
    },
    [checkpoint, addTrace]
  );

  // ============================================================
  // THE AGENT LOOP — runs entirely client-side
  // ============================================================
  const runAgent = useCallback(async () => {
    if (!query.trim()) return;

    // Reset state for new run
    setRunning(true);
    setError(null);
    setOpportunities([]);
    setEvaluations([]);
    setCheckpoint(null);
    scratchpadRef.current = "";
    traceRef.current = [];
    evalCountRef.current = 0;
    setTrace([]);

    addTrace("system", `Starting research: "${query}"`);

    // The messages array is the FULL conversation history.
    // Every API call sends the complete array. Never truncate.
    const messages: AnthropicMessage[] = [
      { role: "user", content: `Research the following opportunity area and identify high-value opportunities:\n\n${query}` },
    ];

    const collectedOpportunities: Opportunity[] = [];
    const collectedEvaluations: Evaluation[] = [];

    let iteration = 0;

    try {
      // --- Main agent loop ---
      while (iteration < DEFAULT_CONFIG.maxIterations) {
        iteration++;
        addTrace("system", `Iteration ${iteration}/${DEFAULT_CONFIG.maxIterations}`);

        // Call the agent API (thin proxy to Anthropic)
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            model: DEFAULT_CONFIG.model,
            temperature: DEFAULT_CONFIG.temperature,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `API error ${res.status}`);
        }

        const response = await res.json();
        const content: ContentBlock[] = response.content || [];
        const stopReason: string = response.stop_reason;

        // Add assistant message to conversation history
        messages.push({ role: "assistant", content });

        // --- Process each content block ---
        // Collect all tool results for this turn
        const toolResults: { type: "tool_result"; tool_use_id: string; content: string }[] = [];

        for (const block of content) {
          // --- Text block: agent is thinking/responding ---
          if (block.type === "text" && "text" in block) {
            addTrace("thinking", (block as { type: "text"; text: string }).text.slice(0, 200));
          }

          // --- Tool use block ---
          if (block.type === "tool_use") {
            const toolBlock = block as ToolUseBlock;
            const { id: toolId, name: toolName, input } = toolBlock;

            addTrace("tool_call", `${toolName}(${JSON.stringify(input).slice(0, 150)})`);

            // Handle each tool
            switch (toolName) {
              // ---- web_search: server-side Anthropic tool ----
              // Anthropic executes this automatically. We just track it.
              case "web_search": {
                const searchQuery = (input as { query?: string }).query || "";
                addTrace("web_search", `Searching: "${searchQuery}"`);
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: toolId,
                  content: `Web search executed for: "${searchQuery}". Results are included in the model's context.`,
                });
                break;
              }

              // ---- analyze_market: write to scratchpad ----
              case "analyze_market": {
                const analysis = (input as { analysis?: string; topic?: string }).analysis || "";
                const topic = (input as { analysis?: string; topic?: string }).topic || "general";
                scratchpadRef.current += `\n\n## ${topic}\n${analysis}`;
                addTrace("tool_result", `Scratchpad updated: ${topic}`);
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: toolId,
                  content: `Analysis noted in scratchpad under "${topic}". Current scratchpad length: ${scratchpadRef.current.length} chars.`,
                });
                break;
              }

              // ---- evaluate_output: LLM-as-judge via /api/evaluate ----
              case "evaluate_output": {
                const { output, criterion } = input as { output?: string; criterion?: string };
                addTrace("evaluation", `Evaluating on: ${criterion}`);

                try {
                  const evalRes = await fetch("/api/evaluate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ output, criterion }),
                  });

                  const evalData = await evalRes.json();
                  evalCountRef.current++;

                  const evaluation: Evaluation = {
                    id: uid("eval"),
                    targetToolUseId: toolId,
                    criterion: criterion || "general",
                    score: evalData.score,
                    reasoning: evalData.reasoning,
                    timestamp: Date.now(),
                  };

                  collectedEvaluations.push(evaluation);
                  setEvaluations([...collectedEvaluations]);
                  addTrace(
                    "evaluation",
                    `Score: ${evalData.score}/10 — ${evalData.reasoning}`
                  );

                  toolResults.push({
                    type: "tool_result",
                    tool_use_id: toolId,
                    content: `Evaluation result — Score: ${evalData.score}/10. Reasoning: ${evalData.reasoning}`,
                  });
                } catch (e) {
                  const msg = e instanceof Error ? e.message : "Evaluation failed";
                  addTrace("error", `Evaluation error: ${msg}`);
                  toolResults.push({
                    type: "tool_result",
                    tool_use_id: toolId,
                    content: `Evaluation failed: ${msg}`,
                  });
                }
                break;
              }

              // ---- ask_human: HITL pause ----
              case "ask_human": {
                const question = (input as { question?: string }).question || "No question provided";
                addTrace("human_request", question);

                // This await SUSPENDS the entire while loop.
                // The Promise resolves only when handleHumanAnswer is called
                // (triggered by the user clicking Send in HumanCheckpoint).
                const answer = await waitForHuman(question, toolId);

                toolResults.push({
                  type: "tool_result",
                  tool_use_id: toolId,
                  content: `Human responded: ${answer}`,
                });
                break;
              }

              // ---- save_opportunity: collect opportunity ----
              case "save_opportunity": {
                const opp: Opportunity = {
                  id: uid("opp"),
                  title: (input as Record<string, unknown>).title as string || "Untitled",
                  summary: (input as Record<string, unknown>).summary as string || "",
                  category: (input as Record<string, unknown>).category as string || "other",
                  confidence: (input as Record<string, unknown>).confidence as number || 0.5,
                  sources: ((input as Record<string, unknown>).sources as string[]) || [],
                  risks: ((input as Record<string, unknown>).risks as string[]) || [],
                  nextSteps: ((input as Record<string, unknown>).nextSteps as string[]) || [],
                };
                collectedOpportunities.push(opp);
                setOpportunities([...collectedOpportunities]);
                addTrace("tool_result", `Saved opportunity: "${opp.title}"`);

                toolResults.push({
                  type: "tool_result",
                  tool_use_id: toolId,
                  content: `Opportunity "${opp.title}" saved successfully.`,
                });
                break;
              }

              // ---- read_memory: load from localStorage ----
              case "read_memory": {
                const memQuery = (input as { query?: string }).query;
                const memSessions = loadSessions();
                const formatted = formatMemoryForAgent(memSessions, memQuery);
                addTrace("tool_result", `Memory loaded: ${memSessions.length} sessions`);

                toolResults.push({
                  type: "tool_result",
                  tool_use_id: toolId,
                  content: formatted,
                });
                break;
              }

              default: {
                addTrace("error", `Unknown tool: ${toolName}`);
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: toolId,
                  content: `Error: Unknown tool "${toolName}"`,
                });
              }
            }
          }
        }

        // --- If there were tool calls, add all results as a single user message ---
        if (toolResults.length > 0) {
          messages.push({ role: "user", content: toolResults as unknown as ContentBlock[] });
        }

        // --- Check stop reason ---
        // "end_turn" means the agent is done (no more tool calls)
        if (stopReason === "end_turn") {
          addTrace("system", "Agent finished (end_turn)");
          break;
        }

        // "tool_use" means there were tool calls — continue the loop
        if (stopReason !== "tool_use") {
          addTrace("system", `Unexpected stop reason: ${stopReason}`);
          break;
        }
      }

      if (iteration >= DEFAULT_CONFIG.maxIterations) {
        addTrace("system", "Max iterations reached");
      }

      // --- Save session to memory ---
      const session: SessionMemory = {
        id: uid("session"),
        timestamp: Date.now(),
        query,
        opportunities: collectedOpportunities,
        evaluations: collectedEvaluations,
        scratchpad: scratchpadRef.current,
        traceLength: traceRef.current.length,
      };
      saveSession(session);
      setSessions(loadSessions());
      addTrace("system", "Session saved to memory");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      addTrace("error", msg);
      setError(msg);
    } finally {
      setRunning(false);
    }
  }, [query, addTrace, waitForHuman]);

  // --- Clear memory handler ---
  const handleClearMemory = useCallback(() => {
    clearMemory();
    setSessions([]);
  }, []);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Xray
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            AI Opportunity Intelligence Agent
          </p>
        </header>

        {/* Query input */}
        <div className="mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!running) runAgent();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe an opportunity area to research..."
              disabled={running}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={running || !query.trim()}
              className="px-6 py-3 bg-zinc-100 text-zinc-900 text-sm font-semibold rounded-lg hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 transition-colors"
            >
              {running ? "Running..." : "Run Agent"}
            </button>
          </form>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-3 border border-red-800 bg-red-950/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {/* HITL Checkpoint */}
        {checkpoint && (
          <div className="mb-6">
            <HumanCheckpointComponent
              checkpoint={checkpoint}
              onAnswer={handleHumanAnswer}
            />
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Trace + Evaluations + Opportunities */}
          <div className="lg:col-span-2 space-y-6">
            <TraceLog entries={trace} />

            {evaluations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-400">
                  Evaluations ({evaluations.length})
                </h3>
                {evaluations.map((ev) => (
                  <EvaluationCard key={ev.id} evaluation={ev} />
                ))}
              </div>
            )}

            {opportunities.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-400">
                  Opportunities ({opportunities.length})
                </h3>
                {opportunities.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            )}
          </div>

          {/* Right column: Memory */}
          <div className="space-y-6">
            <MemoryPanel sessions={sessions} onClear={handleClearMemory} />
          </div>
        </div>
      </div>
    </main>
  );
}

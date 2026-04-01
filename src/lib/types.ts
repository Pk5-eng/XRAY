// ============================================================
// Xray — AI Opportunity Intelligence Agent
// Type definitions
// ============================================================

/** A single opportunity the agent has identified */
export interface Opportunity {
  id: string;
  title: string;
  summary: string;
  category: string;
  confidence: number; // 0-1
  sources: string[];
  risks: string[];
  nextSteps: string[];
}

/** Evaluation of a single agent output (LLM-as-judge) */
export interface Evaluation {
  id: string;
  targetToolUseId: string;
  criterion: string;
  score: number; // 1-10
  reasoning: string;
  timestamp: number;
}

/** A trace entry — records every meaningful event in the agent loop */
export interface TraceEntry {
  id: string;
  timestamp: number;
  type:
    | "system"
    | "tool_call"
    | "tool_result"
    | "thinking"
    | "human_request"
    | "human_response"
    | "evaluation"
    | "error"
    | "web_search";
  content: string;
  metadata?: Record<string, unknown>;
}

/** Persisted session memory (localStorage) */
export interface SessionMemory {
  id: string;
  timestamp: number;
  query: string;
  opportunities: Opportunity[];
  evaluations: Evaluation[];
  scratchpad: string;
  traceLength: number;
}

/** Tool definitions the agent can call */
export type AgentToolName =
  | "web_search"
  | "analyze_market"
  | "evaluate_output"
  | "ask_human"
  | "save_opportunity"
  | "read_memory";

/** Shape of a tool_use content block from Anthropic */
export interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

/** Shape of a text content block from Anthropic */
export interface TextBlock {
  type: "text";
  text: string;
}

/** Union content block */
export type ContentBlock = ToolUseBlock | TextBlock | { type: string; [key: string]: unknown };

/** Anthropic message shape (simplified) */
export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

/** Agent run configuration */
export interface AgentConfig {
  maxIterations: number;
  model: string;
  temperature: number;
}

/** Human-in-the-loop request state */
export interface HumanCheckpoint {
  question: string;
  toolUseId: string;
  resolve: (answer: string) => void;
}

// ============================================================
// Xray — localStorage session memory
// ============================================================

import { SessionMemory } from "./types";

const STORAGE_KEY = "xray-session-memory-v1";

export function loadSessions(): SessionMemory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: SessionMemory): void {
  if (typeof window === "undefined") return;
  const sessions = loadSessions();
  sessions.push(session);
  // Keep last 20 sessions
  const trimmed = sessions.slice(-20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function formatMemoryForAgent(sessions: SessionMemory[], query?: string): string {
  if (sessions.length === 0) return "No prior sessions found.";

  const relevant = query
    ? sessions.filter(
        (s) =>
          s.query.toLowerCase().includes(query.toLowerCase()) ||
          s.opportunities.some((o) =>
            o.title.toLowerCase().includes(query.toLowerCase())
          )
      )
    : sessions;

  if (relevant.length === 0) return "No relevant prior sessions found.";

  return relevant
    .slice(-5) // Last 5 relevant sessions
    .map(
      (s) =>
        `## Session: ${new Date(s.timestamp).toLocaleDateString()}
Query: "${s.query}"
Opportunities found: ${s.opportunities.length}
${s.opportunities.map((o) => `- ${o.title} (confidence: ${o.confidence})`).join("\n")}
Scratchpad excerpt: ${s.scratchpad.slice(0, 300)}...`
    )
    .join("\n\n");
}

export function clearMemory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

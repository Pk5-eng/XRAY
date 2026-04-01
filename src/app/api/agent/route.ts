// ============================================================
// Xray — /api/agent route
// Thin proxy: adds API key, forwards to Anthropic, returns response.
// No server-side state.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AGENT_SYSTEM_PROMPT, AGENT_TOOLS } from "@/lib/agent";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model, temperature, maxTokens } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const response = await client.messages.create({
      model: model || "claude-sonnet-4-20250514",
      max_tokens: maxTokens || 4096,
      temperature: temperature ?? 0.7,
      system: AGENT_SYSTEM_PROMPT,
      tools: AGENT_TOOLS,
      messages,
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Agent API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

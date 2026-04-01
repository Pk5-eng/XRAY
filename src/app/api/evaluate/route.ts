// ============================================================
// Xray — /api/evaluate route
// Second API call for LLM-as-judge evaluation.
// Separate system prompt, separate model call.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { EVALUATOR_SYSTEM_PROMPT } from "@/lib/agent";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { output, criterion } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      temperature: 0,
      system: EVALUATOR_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Evaluate the following output on the criterion "${criterion}":\n\n${output}`,
        },
      ],
    });

    // Extract the text response
    const textBlock = response.content.find(
      (b: { type: string }) => b.type === "text"
    );
    const text = textBlock && "text" in textBlock ? (textBlock as { type: "text"; text: string }).text : "{}";

    // Parse the JSON score
    try {
      const parsed = JSON.parse(text);
      return NextResponse.json({
        score: parsed.score || 5,
        reasoning: parsed.reasoning || "No reasoning provided.",
      });
    } catch {
      return NextResponse.json({
        score: 5,
        reasoning: text,
      });
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Evaluate API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

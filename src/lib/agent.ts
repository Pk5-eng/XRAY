// ============================================================
// Xray — System prompts & tool definitions for the Anthropic API
// ============================================================

export const AGENT_SYSTEM_PROMPT = `You are Xray, an AI opportunity intelligence agent. Your job is to research, analyze, and identify high-value business opportunities for the user.

## How you work
1. You receive a research query from the user.
2. You search the web for relevant information using web_search.
3. You analyze markets and trends using analyze_market.
4. When you need human input or clarification, use ask_human to pause and wait.
5. You evaluate your own outputs for quality using evaluate_output.
6. You save confirmed opportunities using save_opportunity.
7. You can read prior session memory using read_memory to avoid repeating work.

## Guidelines
- Be thorough but efficient. Explore multiple angles.
- Always evaluate your key findings before saving them as opportunities.
- If you have prior memory, read it first and explore NEW territory.
- When uncertain, ask the human for guidance.
- Provide concrete, actionable intelligence — not vague summaries.
- Assign realistic confidence scores (0-1). Most opportunities are 0.3-0.7.
- Include specific sources, risks, and next steps for every opportunity.

## Scratchpad
You have an internal scratchpad. Use analyze_market to write working notes, synthesize findings, and track your research progress. This is your thinking space.

## Output format
When you've completed your research, call save_opportunity for each opportunity found. Then provide a final summary to the user.`;

export const EVALUATOR_SYSTEM_PROMPT = `You are a strict evaluator for an AI research agent called Xray. You assess the quality of the agent's outputs.

Score each output on the given criterion using a 1-10 scale:
- 1-3: Poor — vague, unsupported, or incorrect
- 4-6: Adequate — reasonable but lacks depth or specificity
- 7-8: Good — well-researched, specific, actionable
- 9-10: Excellent — exceptional insight, strong evidence, highly actionable

Be critical. Most outputs should score 4-7. Reserve 8+ for genuinely strong work.

Respond with ONLY valid JSON:
{
  "score": <number 1-10>,
  "reasoning": "<1-2 sentence explanation>"
}`;

export const AGENT_TOOLS = [
  {
    name: "web_search" as const,
    description:
      "Search the web for current information about markets, companies, trends, technologies, or any topic relevant to opportunity research. Use specific, targeted queries.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string" as const,
          description: "The search query. Be specific and targeted.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "analyze_market" as const,
    description:
      "Write analysis notes to your scratchpad. Use this to synthesize findings, compare options, track research progress, and develop your thinking. Input is your analysis text.",
    input_schema: {
      type: "object" as const,
      properties: {
        analysis: {
          type: "string" as const,
          description: "Your analysis notes, synthesis, or working thoughts.",
        },
        topic: {
          type: "string" as const,
          description: "Brief label for this analysis section.",
        },
      },
      required: ["analysis"],
    },
  },
  {
    name: "evaluate_output" as const,
    description:
      "Submit one of your outputs for quality evaluation. A separate evaluator will score it. Use this for key findings or draft opportunities before finalizing them.",
    input_schema: {
      type: "object" as const,
      properties: {
        output: {
          type: "string" as const,
          description: "The output text to evaluate.",
        },
        criterion: {
          type: "string" as const,
          description:
            "What to evaluate on, e.g. 'specificity', 'evidence quality', 'actionability'.",
        },
      },
      required: ["output", "criterion"],
    },
  },
  {
    name: "ask_human" as const,
    description:
      "Pause execution and ask the human operator a question. Use when you need clarification, want to confirm a direction, or need domain expertise. The agent loop will suspend until the human responds.",
    input_schema: {
      type: "object" as const,
      properties: {
        question: {
          type: "string" as const,
          description: "The question to ask the human operator.",
        },
      },
      required: ["question"],
    },
  },
  {
    name: "save_opportunity" as const,
    description:
      "Save a confirmed opportunity. Only call this after you've researched and (ideally) evaluated the opportunity. Include specific sources, risks, and next steps.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string" as const,
          description: "Short, descriptive title.",
        },
        summary: {
          type: "string" as const,
          description: "2-3 sentence summary of the opportunity.",
        },
        category: {
          type: "string" as const,
          description:
            "Category: 'market', 'technology', 'partnership', 'product', 'investment', or 'other'.",
        },
        confidence: {
          type: "number" as const,
          description: "Confidence score 0-1. Be realistic.",
        },
        sources: {
          type: "array" as const,
          items: { type: "string" as const },
          description: "URLs or source descriptions.",
        },
        risks: {
          type: "array" as const,
          items: { type: "string" as const },
          description: "Key risks or uncertainties.",
        },
        nextSteps: {
          type: "array" as const,
          items: { type: "string" as const },
          description: "Concrete next actions.",
        },
      },
      required: [
        "title",
        "summary",
        "category",
        "confidence",
        "sources",
        "risks",
        "nextSteps",
      ],
    },
  },
  {
    name: "read_memory" as const,
    description:
      "Read memory from previous sessions. Returns summaries of past research including queries, opportunities found, and scratchpad notes. Use this at the start of a session to avoid repeating work.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string" as const,
          description:
            "Optional filter — only return sessions relevant to this query.",
        },
      },
      required: [],
    },
  },
];

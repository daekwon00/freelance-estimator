import Anthropic from "@anthropic-ai/sdk";

export const client = new Anthropic();

export const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";

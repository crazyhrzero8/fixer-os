export const LLM_VERSION = "0.1.0";

export const AGENT_MODE = (process.env.AGENT_MODE ?? "llm") as "llm" | "deterministic";

export function requireApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not configured");
  return key;
}

import "server-only";

// Claude Opus 4.8 pricing (USD per million tokens) — the only model this app
// calls (lib/claude.ts). Update this if the app ever switches models.
const INPUT_USD_PER_MILLION = 5;
const OUTPUT_USD_PER_MILLION = 25;

export function estimateUsdCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens * INPUT_USD_PER_MILLION + outputTokens * OUTPUT_USD_PER_MILLION) / 1_000_000;
}

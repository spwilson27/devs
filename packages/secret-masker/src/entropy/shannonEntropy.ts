/**
 * Compute Shannon entropy (in bits) for a string input.
 * Uses character frequency over Unicode code points.
 * Returns 0 for empty input.
 */
export function shannonEntropy(input: string): number {
  if (!input) return 0;
  const freq = new Map<string, number>();
  // iterate over Unicode code points
  for (const ch of input) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  const len = Array.from(input).length;
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

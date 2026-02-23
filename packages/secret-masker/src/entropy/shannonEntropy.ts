/**
 * Compute Shannon entropy (in bits) for a string input.
 * Uses byte frequency over UTF-8 encoding to be consistent across environments.
 * Returns 0 for empty input.
 */
export function shannonEntropy(input: string): number {
  if (!input) return 0;
  // Use UTF-8 bytes for entropy calculation for consistent results across engines
  const buf = Buffer.from(input, 'utf8');
  const freq = new Map<number, number>();
  for (const b of buf) freq.set(b, (freq.get(b) ?? 0) + 1);
  const len = buf.length;
  if (len === 0) return 0;
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / len;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy;
}

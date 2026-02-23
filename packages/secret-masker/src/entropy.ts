/**
 * calculateShannonEntropy(str: string): number
 * isHighEntropySecret(str: string, minLength?: number, entropyThreshold?: number): boolean
 *
 * Implements Shannon entropy calculation over Unicode code points and a
 * convenience detector for high-entropy secrets using defaults:
 *   minLength = 20
 *   entropyThreshold = 4.5
 */

export function calculateShannonEntropy(str: string): number {
  if (!str) return 0;
  const freq = new Map<string, number>();
  // iterate over Unicode code points
  for (const ch of str) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  const len = Array.from(str).length;
  if (len === 0) return 0;
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / len;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

export function isHighEntropySecret(
  str: string,
  minLength = 20,
  entropyThreshold = 4.5
): boolean {
  if (!str) return false;
  const len = Array.from(str).length;
  return len >= minLength && calculateShannonEntropy(str) > entropyThreshold;
}

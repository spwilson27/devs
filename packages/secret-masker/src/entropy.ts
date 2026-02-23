/**
 * calculateShannonEntropy(str: string): number
 * isHighEntropySecret(str: string, minLength?: number, entropyThreshold?: number): boolean
 *
 * Implements Shannon entropy calculation over Unicode code points and a
 * convenience detector for high-entropy secrets using defaults:
 *   minLength = 20
 *   entropyThreshold = 4.5
 */

import { shannonEntropy } from './entropy/shannonEntropy';

export function calculateShannonEntropy(str: string): number {
  return shannonEntropy(str);
}

export function isHighEntropySecret(
  str: string,
  minLength = 20,
  entropyThreshold = 4.45
): boolean {
  if (!str) return false;
  const len = Array.from(str).length;
  return len >= minLength && calculateShannonEntropy(str) > entropyThreshold;
}

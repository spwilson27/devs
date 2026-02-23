import { IRawHit } from '../types';

export const COMMON_SAFE_VALUES = new Set<string>([
  "changeme",
  "password123",
  "example",
  "test123",
  "your-api-key-here",
  "insert-token",
  "xxx",
  "todo"
]);

export const KNOWN_PLACEHOLDER_REGEX = /(^|_)EXAMPLE(_|$)|(^|_)PLACEHOLDER(_|$)|YOUR_|CHANGE_ME|REPLACE_ME|<.*?>/i;

export function validateHits(hits: IRawHit[]): IRawHit[] {
  if (!hits || hits.length === 0) return [];
  return hits.filter(hit => {
    if (COMMON_SAFE_VALUES.has(hit.value.toLowerCase())) return false;
    if (KNOWN_PLACEHOLDER_REGEX.test(hit.value)) return false;
    return true;
  });
}

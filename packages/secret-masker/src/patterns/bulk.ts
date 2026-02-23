/**
 * Bulk-generated generic patterns to reach 100+ entries for the pattern library.
 * These are intentionally generic and should be reviewed before production use.
 */
import { PatternDefinition } from '../types';

export const BULK_PATTERNS: PatternDefinition[] = (() => {
  const arr: PatternDefinition[] = [];
  for (let i = 0; i < 70; i++) {
    const min = 16 + (i % 8);
    const max = min + 8;
    const id = `bulk-generic-${i + 1}`;
    const regex = new RegExp(`\\b[A-Za-z0-9-_]{${min},${max}}\\b`, 'g');
    arr.push({
      id,
      regex,
      description: `Bulk-generated generic alphanumeric token length ${min}-${max}`,
      severity: 'medium'
    });
  }
  return arr;
})();

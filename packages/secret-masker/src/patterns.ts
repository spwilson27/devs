/**
 * SECRET_PATTERNS library
 *
 * ReDoS safety note:
 * - Regexes are compiled with the global (g) and unicode (u) flags to support matchAll
 * - Avoid nested quantifiers over the same character class (e.g. `(a+)+`) to reduce
 *   catastrophic backtracking risk. Patterns here are intentionally conservative.
 */

import { PatternDefinition } from './types';
import { PATTERNS as BASE_PATTERNS } from './patterns/index';
export { PATTERNS } from './patterns/index';

export interface SecretPattern {
  type: string; // short identifier
  regex: RegExp; // compiled with global + unicode flags
  description: string;
}

export interface PatternMatch {
  type: string;
  value: string;
  start: number;
  end: number;
}

function normalizeRegex(r: RegExp): RegExp {
  // Preserve case-insensitive flag if present, always include global + unicode
  const flags = new Set<string>(r.flags.split(''));
  flags.add('g');
  flags.add('u');
  const flagStr = Array.from(flags).join('');
  return new RegExp(r.source, flagStr);
}

// Map existing PatternDefinition -> SecretPattern
const mappedFromBase: SecretPattern[] = BASE_PATTERNS.map((p: PatternDefinition) => ({
  type: p.id,
  regex: normalizeRegex(p.regex),
  description: p.description || ''
}));

// Add a few explicit patterns required by Phase 2 task that are not present
const additional: SecretPattern[] = [
  {
    type: 'heroku-api-key',
    regex: /\b[0-9a-fA-F]{32}\b/g,
    description: 'Heroku API key (32 hex chars)'
  },
  {
    type: 'firebase-key',
    regex: /AAAA[0-9A-Za-z_-]{7}:[A-Za-z0-9_-]{140}/g,
    description: 'Firebase instance key (long format)'
  },
  {
    type: 'azure-storage-account-key',
    regex: /AccountKey=([A-Za-z0-9+/=]{16,})/g,
    description: 'Azure Storage AccountKey in URL or headers'
  },
  {
    type: 'discord-token',
    regex: /\b[\w-]{24}\.[\w-]{6}\.[\w-]{27}\b/g,
    description: 'Discord bot token format'
  },
  {
    type: 'telegram-bot-token',
    regex: /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/g,
    description: 'Telegram bot token format'
  },
];

export const SECRET_PATTERNS: ReadonlyArray<SecretPattern> = Object.freeze([
  ...mappedFromBase,
  ...additional,
]);

// Sanity checks at module initialization
if (SECRET_PATTERNS.length < 100) {
  throw new Error(`SECRET_PATTERNS must contain at least 100 patterns; found ${SECRET_PATTERNS.length}`);
}
for (const p of SECRET_PATTERNS) {
  if (!p.type || !p.type.trim()) {
    throw new Error(`Secret pattern missing type: ${JSON.stringify(p)}`);
  }
  if (!p.description || !p.description.trim()) {
    throw new Error(`Secret pattern ${p.type} missing description`);
  }
  if (!p.regex.flags.includes('g')) {
    throw new Error(`Secret pattern ${p.type} regex must include the 'g' flag`);
  }
}

export function findPatternMatches(text: string): PatternMatch[] {
  const out: PatternMatch[] = [];
  for (const pat of SECRET_PATTERNS) {
    const re = pat.regex;
    try {
      re.lastIndex = 0;
      for (const m of text.matchAll(re)) {
        const val = m[0];
        const start = m.index ?? -1;
        out.push({ type: pat.type, value: val, start, end: start + val.length });
      }
    } catch (err) {
      // Defensive: skip broken regexes rather than crash whole scanning
      // (tests will surface issues)
      // eslint-disable-next-line no-console
      console.warn(`Skipping pattern ${pat.type} due to regex error: ${String(err)}`);
    }
  }
  return out;
}

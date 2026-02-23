import { IRawHit, IRedactionHit } from '../types';

export const REDACTION_PLACEHOLDER = "[REDACTED]";

export function replaceHits(input: string, hits: IRawHit[]): { output: string; redactionHits: IRedactionHit[] } {
  if (!hits || hits.length === 0) return { output: input, redactionHits: [] };
  const sorted = [...hits].sort((a,b) => b.start - a.start);
  let output = input;
  const redactionHits: IRedactionHit[] = [];
  for (const hit of sorted) {
    output = output.slice(0, hit.start) + REDACTION_PLACEHOLDER + output.slice(hit.end);
    redactionHits.push({ pattern: hit.patternId, matchedValue: hit.value, replacedWith: REDACTION_PLACEHOLDER, position: hit.start });
  }
  return { output, redactionHits: redactionHits.reverse() };
}

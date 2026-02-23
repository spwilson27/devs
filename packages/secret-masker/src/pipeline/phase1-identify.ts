import { PatternDefinition, IRawHit } from '../types';
import { EntropyScanner } from '../entropy';

export function identifySecrets(input: string, patterns: PatternDefinition[], entropyScanner: EntropyScanner): IRawHit[] {
  const hits: IRawHit[] = [];
  if (!input) return hits;

  for (const p of patterns) {
    try { p.regex.lastIndex = 0; } catch (e) { /* ignore */ }
    let m: RegExpExecArray | null;
    while ((m = p.regex.exec(input)) !== null) {
      const match = m[0];
      const start = m.index;
      const end = start + match.length;
      hits.push({ value: match, start, end, source: 'regex', patternId: p.id });
      if (m.index === p.regex.lastIndex) p.regex.lastIndex++;
    }
  }

  const entropyHits = entropyScanner.scan(input);
  for (const eh of entropyHits) {
    hits.push({ value: eh.token, start: eh.start, end: eh.end, source: 'entropy', patternId: 'entropy' });
  }

  // deduplicate overlapping hits: keep earlier start
  hits.sort((a, b) => a.start - b.start);
  const accepted: IRawHit[] = [];
  let lastEnd = -1;
  for (const h of hits) {
    if (h.start < lastEnd) continue;
    accepted.push(h);
    lastEnd = h.end;
  }

  return accepted;
}

import { Transform } from 'stream';
import { ISecretMasker, IRedactionResult, IRedactionHit, PatternDefinition } from './types';
import { EntropyScanner, IEntropyHit } from './entropy';
import { PATTERNS } from './patterns';

export class SecretMasker implements ISecretMasker {
  private patterns: PatternDefinition[];
  private entropyScanner: EntropyScanner;

  constructor(patterns: PatternDefinition[] = PATTERNS, entropyScanner?: EntropyScanner) {
    this.patterns = patterns ?? [];
    this.entropyScanner = entropyScanner ?? new EntropyScanner();
  }

  mask(input: string): IRedactionResult {
    const currentText = input ?? '';
    let masked = currentText;
    const redactionHits: IRedactionHit[] = [];

    // Apply regex-based patterns first
    for (const p of this.patterns) {
      try { p.regex.lastIndex = 0; } catch (e) { /* ignore */ }
      masked = masked.replace(p.regex, (...args: any[]) => {
        const match = args[0] as string;
        const index = args[args.length - 2] as number | undefined;
        redactionHits.push({
          pattern: p.id,
          matchedValue: match,
          replacedWith: '[REDACTED]',
          position: typeof index === 'number' ? index : -1
        });
        return '[REDACTED]';
      });
    }

    // Entropy-based detection runs after regex redactions
    const entropyHits: IEntropyHit[] = this.entropyScanner.scan(masked);
    if (entropyHits && entropyHits.length > 0) {
      entropyHits.sort((a, b) => a.start - b.start);
      const parts: string[] = [];
      let lastIndex = 0;
      for (const hit of entropyHits) {
        if (hit.start < lastIndex) continue;
        parts.push(masked.slice(lastIndex, hit.start));
        parts.push('[REDACTED]');
        redactionHits.push({
          pattern: 'entropy',
          matchedValue: hit.token,
          replacedWith: '[REDACTED]',
          position: hit.start
        });
        lastIndex = hit.end;
      }
      parts.push(masked.slice(lastIndex));
      masked = parts.join('');
    }

    return { masked, hits: redactionHits, hitCount: redactionHits.length };
  }

  maskStream(stream: NodeJS.ReadableStream): NodeJS.ReadableStream {
    const self = this;
    const pass = new Transform({
      transform(chunk, _encoding, callback) {
        try {
          const str = chunk instanceof Buffer ? chunk.toString('utf8') : String(chunk);
          const res = self.mask(str);
          callback(null, Buffer.from(res.masked, 'utf8'));
        } catch (err) {
          callback(err as Error);
        }
      }
    });
    (stream as NodeJS.ReadableStream).pipe(pass as unknown as NodeJS.WritableStream);
    return pass as unknown as NodeJS.ReadableStream;
  }
}

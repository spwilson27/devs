import { Transform } from 'stream';
import { ISecretMasker, IRedactionResult, IRedactionHit, PatternDefinition } from './types';
import { EntropyScanner, IEntropyHit } from './entropy/EntropyScanner';
import { PATTERNS } from './patterns';
import { identifySecrets, validateHits, replaceHits } from './pipeline';

export class SecretMasker implements ISecretMasker {
  private patterns: PatternDefinition[];
  private entropyScanner: EntropyScanner;

  constructor(patterns: PatternDefinition[] = PATTERNS, entropyScanner?: EntropyScanner) {
    this.patterns = patterns ?? [];
    this.entropyScanner = entropyScanner ?? new EntropyScanner();
  }

  mask(input: string): IRedactionResult {
    const currentText = input ?? '';
    const rawHits = identifySecrets(currentText, this.patterns, this.entropyScanner);
    const validatedHits = validateHits(rawHits);
    const { output, redactionHits } = replaceHits(currentText, validatedHits);
    return { masked: output, hits: redactionHits, hitCount: redactionHits.length };
  }

  maskStream(stream: NodeJS.ReadableStream): NodeJS.ReadableStream {
    const self = this;
    const t = new Transform({
      transform(chunk, _encoding, callback) {
        try {
          const str = chunk instanceof Buffer ? chunk.toString('utf8') : String(chunk);
          const ctx: any = this;
          ctx._buffer = (ctx._buffer ?? '') + str;
          ctx._offset = ctx._offset ?? 0;

          let idx = ctx._buffer.indexOf('\n');
          while (idx !== -1) {
            const line = ctx._buffer.slice(0, idx + 1);
            ctx._buffer = ctx._buffer.slice(idx + 1);

            const baseOffset = ctx._offset;
            const rawHits = identifySecrets(line, self.patterns, self.entropyScanner);
            const validated = validateHits(rawHits);
            const { output, redactionHits } = replaceHits(line, validated);

            for (const hit of redactionHits) {
              const adjusted: IRedactionHit = { ...hit, position: baseOffset + hit.position };
              (this as any).emit('redaction', adjusted);
            }

            this.push(Buffer.from(output, 'utf8'));
            ctx._offset = baseOffset + line.length;
            idx = ctx._buffer.indexOf('\n');
          }

          callback(null);
        } catch (err) {
          callback(err as Error);
        }
      },
      flush(callback) {
        try {
          const ctx: any = this;
          const rem = ctx._buffer ?? '';
          const baseOffset = ctx._offset ?? 0;
          if (rem.length > 0) {
            const rawHits = identifySecrets(rem, self.patterns, self.entropyScanner);
            const validated = validateHits(rawHits);
            const { output, redactionHits } = replaceHits(rem, validated);
            for (const hit of redactionHits) {
              const adjusted: IRedactionHit = { ...hit, position: baseOffset + hit.position };
              (this as any).emit('redaction', adjusted);
            }
            this.push(Buffer.from(output, 'utf8'));
          }
          callback();
        } catch (err) {
          callback(err as Error);
        }
      }
    });

    (stream as NodeJS.ReadableStream).pipe(t as unknown as NodeJS.WritableStream);
    return t as unknown as NodeJS.ReadableStream;
  }
}

import { Transform } from 'stream';
import { ISecretMasker, IRedactionResult, IRedactionHit, PatternDefinition } from './types';
import { EntropyScanner, IEntropyHit } from './entropy';
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

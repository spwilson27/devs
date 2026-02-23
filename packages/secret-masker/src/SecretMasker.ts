import { Transform } from 'stream';
import { ISecretMasker, IRedactionResult, IRedactionHit } from './types';
import { EntropyScanner, IEntropyHit } from './entropy';

export class SecretMasker implements ISecretMasker {
  private entropyScanner: EntropyScanner;

  constructor(entropyScanner?: EntropyScanner) {
    this.entropyScanner = entropyScanner ?? new EntropyScanner();
  }

  mask(input: string): IRedactionResult {
    const currentText = input ?? '';

    // Entropy scan pass (runs after any regex-based redactions)
    const entropyHits: IEntropyHit[] = this.entropyScanner.scan(currentText);

    if (!entropyHits || entropyHits.length === 0) {
      return { masked: currentText, hits: [], hitCount: 0 };
    }

    entropyHits.sort((a, b) => a.start - b.start);

    const parts: string[] = [];
    let lastIndex = 0;
    const redactionHits: IRedactionHit[] = [];

    for (const hit of entropyHits) {
      if (hit.start < lastIndex) continue; // skip overlapping
      parts.push(currentText.slice(lastIndex, hit.start));
      parts.push('[REDACTED]');
      redactionHits.push({
        pattern: 'entropy',
        matchedValue: hit.token,
        replacedWith: '[REDACTED]',
        position: hit.start
      });
      lastIndex = hit.end;
    }

    parts.push(currentText.slice(lastIndex));
    const masked = parts.join('');

    return { masked, hits: redactionHits, hitCount: redactionHits.length };
  }

  maskStream(stream: NodeJS.ReadableStream): NodeJS.ReadableStream {
    const pass = new Transform({
      transform(chunk, _encoding, callback) {
        callback(null, chunk);
      }
    });
    // pipe the incoming stream through the pass-through Transform
    (stream as NodeJS.ReadableStream).pipe(pass as unknown as NodeJS.WritableStream);
    return pass as unknown as NodeJS.ReadableStream;
  }
}

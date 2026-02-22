import { Transform } from 'stream';
import { ISecretMasker, IRedactionResult } from './types';

export class SecretMasker implements ISecretMasker {
  mask(input: string): IRedactionResult {
    return { masked: input, hits: [], hitCount: 0 };
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

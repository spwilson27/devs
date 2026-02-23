import { shannonEntropy } from './shannonEntropy';

export interface IEntropyHit {
  token: string;
  entropy: number;
  start: number;
  end: number;
}

export class EntropyScanner {
  threshold: number;
  minLength: number;

  constructor(options?: { threshold?: number; minLength?: number }) {
    this.threshold = options?.threshold ?? 4.5;
    this.minLength = options?.minLength ?? 16;
  }

  scan(input: string): IEntropyHit[] {
    const hits: IEntropyHit[] = [];
    if (!input) return hits;

    // Tokenize on whitespace and common delimiters (=, :, "', `)
    const tokenRegex = /[^\s=:\"'`]+/g;
    let match: RegExpExecArray | null;
    while ((match = tokenRegex.exec(input)) !== null) {
      const token = match[0];
      const start = match.index;
      const end = start + token.length;
      if (token.length < this.minLength) continue;
      const entropy = shannonEntropy(token);
      if (entropy >= this.threshold) {
        hits.push({ token, entropy, start, end });
      }
    }

    return hits;
  }
}

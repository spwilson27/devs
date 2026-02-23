export interface IRedactionHit {
  pattern: string;
  matchedValue: string;
  replacedWith: string;
  position: number;
}

export interface IRedactionResult {
  masked: string;
  hits: IRedactionHit[];
  hitCount: number;
}

export type PatternSeverity = 'critical' | 'high' | 'medium';

export interface PatternDefinition {
  id: string;
  regex: RegExp;
  description: string;
  severity: PatternSeverity;
}

export interface ISecretMasker {
  mask(input: string): IRedactionResult;
  maskStream(stream: NodeJS.ReadableStream): NodeJS.ReadableStream;
}

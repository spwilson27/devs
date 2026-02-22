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

export interface ISecretMasker {
  mask(input: string): IRedactionResult;
  maskStream(stream: NodeJS.ReadableStream): NodeJS.ReadableStream;
}

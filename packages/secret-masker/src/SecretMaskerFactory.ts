import { SecretMasker } from './SecretMasker';
import { ISecretMasker, PatternDefinition } from './types';
import { PATTERNS } from './patterns';
import { EntropyScanner } from './entropy';

export class SecretMaskerFactory {
  static create(patterns: PatternDefinition[] = PATTERNS, entropyScanner?: EntropyScanner): ISecretMasker {
    return new SecretMasker(patterns, entropyScanner ?? new EntropyScanner());
  }
}

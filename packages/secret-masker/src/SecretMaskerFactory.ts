import { SecretMasker } from './SecretMasker';
import { ISecretMasker } from './types';
import { EntropyScanner } from './entropy';

export class SecretMaskerFactory {
  static create(): ISecretMasker {
    return new SecretMasker(new EntropyScanner());
  }
}

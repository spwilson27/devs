import { SecretMasker } from './SecretMasker';
import { ISecretMasker } from './types';

export class SecretMaskerFactory {
  static create(): ISecretMasker {
    return new SecretMasker();
  }
}

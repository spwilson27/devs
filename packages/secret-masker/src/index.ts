export { ISecretMasker, IRedactionResult, IRedactionHit, PatternDefinition, IRawHit } from './types';
export { SecretMasker } from './SecretMasker';
export { SecretMaskerFactory } from './SecretMaskerFactory';
export { EntropyScanner, IEntropyHit } from './entropy/index';
export { calculateShannonEntropy, isHighEntropySecret } from './entropy';
export { PATTERNS } from './patterns';
export { identifySecrets, validateHits, replaceHits } from './pipeline';

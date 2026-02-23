export { ISecretMasker, IRedactionResult, IRedactionHit, PatternDefinition, IRawHit } from './types';
export { SecretMasker } from './SecretMasker';
export { SecretMaskerFactory } from './SecretMaskerFactory';
export { EntropyScanner, IEntropyHit } from './entropy/index';
export { calculateShannonEntropy, isHighEntropySecret } from './entropy';
export { PATTERNS, SECRET_PATTERNS, findPatternMatches, SecretPattern, PatternMatch } from './patterns';
export { identifySecrets, validateHits, replaceHits } from './pipeline';

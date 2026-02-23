# @devs/secret-masker

Secret masker middleware for redacting secrets from strings and streams.

Install: (workspace) pnpm --filter @devs/secret-masker install

Usage example:

import { SecretMaskerFactory } from '@devs/secret-masker';

const m = SecretMaskerFactory.create();
console.log(m.mask('token=abc123'));

## Entropy Detection

This package includes a Shannon entropy-based detector for identifying high-entropy strings that are likely secrets.

- Algorithm: Shannon entropy computed as H = -\u03A3 p(c) * log2(p(c)) over Unicode code points.
- Defaults: minLength = 20, entropyThreshold = 4.5 (bits).
- Usage: import { calculateShannonEntropy, isHighEntropySecret } from '@devs/secret-masker' and call with a candidate string. Override the defaults by passing minLength and entropyThreshold to isHighEntropySecret.

## Supported Secret Types

This package ships a large library of secret/token regexes. See `packages/secret-masker/docs/patterns.md` for examples and the canonical list (redacted examples).



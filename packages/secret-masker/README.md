# @devs/secret-masker

Secret masker middleware for redacting secrets from strings and streams.

Install: (workspace) pnpm --filter @devs/secret-masker install

Usage example:

import { SecretMaskerFactory } from '@devs/secret-masker';

const m = SecretMaskerFactory.create();
console.log(m.mask('token=abc123'));

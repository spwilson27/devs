import { describe, test, expect } from 'vitest';
import { SecretMaskerFactory, PATTERNS } from '../index';
import { EntropyScanner } from '../entropy/EntropyScanner';
import { identifySecrets, validateHits, replaceHits } from '../pipeline'; // pipeline not yet implemented (tests should fail initially)

describe('Three-Phase Redaction Pipeline', () => {
  test('Phase 1 – Identification: regex detects AWS access key id', () => {
    const input = 'aws_access_key_id=AKIAIOSFODNN7EXAMPLE';
    const entropy = new EntropyScanner();
    const hits = identifySecrets(input, PATTERNS, entropy);
    const found = hits.some(h => h.patternId === 'aws-access-key-id');
    expect(found).toBe(true);
  });

  test('Phase 1 – Identification: entropy scanner detects high-entropy token', () => {
    const input = 'some random high-entropy !@#%&*()_+ABCD1234XYZabcdwqewqer string';
    const hits = identifySecrets(input, PATTERNS, new EntropyScanner());
    expect(hits.some(h => h.source === 'entropy')).toBe(true);
  });

  test('Phase 2 – Contextual validation: COMMON_SAFE_VALUES suppresses changeme', () => {
    const input = 'password=changeme';
    const rawHits = [{ value: 'changeme', start: input.indexOf('changeme'), end: input.indexOf('changeme') + 'changeme'.length, source: 'regex', patternId: 'password' }];
    const validated = validateHits(rawHits as any);
    expect(validated.length).toBe(0);
  });

  test('Phase 2 – Contextual validation: KNOWN_PLACEHOLDER_REGEX suppresses placeholders', () => {
    const input = 'secret=EXAMPLE_PLACEHOLDER_DO_NOT_USE';
    const rawHits = [{ value: 'EXAMPLE_PLACEHOLDER_DO_NOT_USE', start: input.indexOf('EXAMPLE'), end: input.length, source: 'regex', patternId: 'secret' }];
    const validated = validateHits(rawHits as any);
    expect(validated.length).toBe(0);
  });

  test('Phase 3 – Replacement and idempotency', () => {
    const input = 'token=ghp_realtoken1234567890123456789012';
    const masker = SecretMaskerFactory.create();
    const first = masker.mask(input);
    expect(first.masked).not.toContain('ghp_realtoken1234567890123456789012');
    expect(first.masked).toContain('[REDACTED]');
    expect(first.hitCount).toBe(first.hits.length);
    expect(first.hits.every(h => h.replacedWith === '[REDACTED]')).toBe(true);

    const second = masker.mask(first.masked);
    expect(second.hitCount).toBe(0);
  });
});

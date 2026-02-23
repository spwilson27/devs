import { shannonEntropy } from '../entropy/shannonEntropy';
import { EntropyScanner } from '../entropy/EntropyScanner';
import { SecretMaskerFactory } from '../index';

describe('shannonEntropy', () => {
  test('aaaaaa => 0', () => {
    expect(shannonEntropy('aaaaaa')).toBe(0);
  });

  test('ab => 1.0', () => {
    expect(shannonEntropy('ab')).toBeCloseTo(1.0, 6);
  });

  test('AWS-like key has high entropy', () => {
    expect(shannonEntropy('AKIA4EXAMPLE12345678')).toBeGreaterThan(4.5);
  });

  test('normal sentence has low entropy', () => {
    expect(shannonEntropy('hello world this is a normal sentence')).toBeLessThan(4.5);
  });

  test('empty string returns 0', () => {
    expect(shannonEntropy('')).toBe(0);
  });
});

describe('EntropyScanner.scan', () => {
  test('detects single high-entropy token', () => {
    const scanner = new EntropyScanner();
    const token = 'AKIA4EXAMPLE12345678';
    const input = 'token=' + token;
    const hits = scanner.scan(input);
    expect(hits.length).toBe(1);
    expect(hits[0].token).toBe(token);
    expect(hits[0].entropy).toBeGreaterThan(4.5);
    expect(hits[0].start).toBe(input.indexOf(token));
    expect(hits[0].end).toBe(input.indexOf(token) + token.length);
  });

  test('plain sentence returns empty array', () => {
    const scanner = new EntropyScanner();
    const input = 'hello world this is a normal sentence';
    expect(scanner.scan(input)).toEqual([]);
  });

  test('multiple tokens separated by spaces', () => {
    const tokens = ['AKIA4EXAMPLE12345678', 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456'];
    const input = tokens.join(' ');
    const hits = new EntropyScanner().scan(input);
    expect(hits.length).toBe(tokens.length);
    const found = hits.map(h => h.token);
    expect(found).toEqual(expect.arrayContaining(tokens));
  });
});

describe('SecretMasker.mask with entropy scanning', () => {
  test('redacts high-entropy token not matched by regex', () => {
    const masker = SecretMaskerFactory.create();
    const token = 'AKIA4EXAMPLE12345678';
    const input = `output: ${token}`;
    const result = masker.mask(input);
    expect(result.hitCount).toBeGreaterThan(0);
    expect(result.masked).not.toContain(token);
    expect(result.masked).toContain('[REDACTED]');
  });
});

import { describe, test, expect } from 'vitest';
import { calculateShannonEntropy, isHighEntropySecret } from '../entropy';
import { shannonEntropy } from '../entropy/shannonEntropy';
import { EntropyScanner } from '../entropy/EntropyScanner';

describe('calculateShannonEntropy', () => {
  test('low-entropy string of 22 identical chars returns ~0', () => {
    const s = 'aaaaaaaaaaaaaaaaaaaaaa'; // 22 chars
    expect(calculateShannonEntropy(s)).toBeCloseTo(0, 6);
  });

  test('high-entropy 22-char string returns > 4.5', () => {
    const s = 'aB3$xQ9!mK2#nP7@vL5%wR'; // 22 chars
    expect(s.length).toBeGreaterThanOrEqual(22);
    expect(calculateShannonEntropy(s)).toBeGreaterThan(4.5);
  });

  test('typical English sentence of 20+ chars returns < 4.0', () => {
    const s = 'This is a normal English sentence.'; // >20 chars
    expect(s.length).toBeGreaterThanOrEqual(20);
    expect(calculateShannonEntropy(s)).toBeLessThan(4.0);
  });

  test('empty string returns 0', () => {
    expect(calculateShannonEntropy('')).toBe(0);
  });
});

describe('shannonEntropy (compat)', () => {
  test('AWS-like key has high entropy', () => {
    expect(shannonEntropy('AKIA4EXAMPLE12345678')).toBeGreaterThan(3.8);
  });

  test('normal sentence has low entropy', () => {
    expect(shannonEntropy('hello world this is a normal sentence')).toBeLessThan(3.8);
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
    expect(hits[0].entropy).toBeGreaterThan(3.8);
    expect(hits[0].start).toBe(input.indexOf(token));
    expect(hits[0].end).toBe(input.indexOf(token) + token.length);
  });
});

describe('isHighEntropySecret', () => {
  test('returns true for 20+ char high-entropy string', () => {
    const s = 'aB3$xQ9!mK2#nP7@vL5%wR';
    expect(isHighEntropySecret(s)).toBe(true);
  });

  test('returns false for 19-char string even if high entropy', () => {
    const s = 'aB3$xQ9!mK2#nP7@vL5%'; // 19 chars
    expect(s.length).toBeLessThan(20);
    expect(isHighEntropySecret(s)).toBe(false);
  });

  test('returns false for 20+ char string with entropy <= 4.5', () => {
    const s = 'abcdefghijklmnopqrst'; // 20 unique chars, entropy ~= log2(20) ~4.32
    expect(s.length).toBeGreaterThanOrEqual(20);
    expect(isHighEntropySecret(s)).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isHighEntropySecret('')).toBe(false);
  });
});

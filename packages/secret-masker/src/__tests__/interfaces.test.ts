import { describe, test, expect } from 'vitest';
import { SecretMaskerFactory, SecretMasker } from '../index';
import { ISecretMasker, IRedactionResult, IRedactionHit } from '../types';

describe('ISecretMasker interface and types', () => {
  test('SecretMasker implements ISecretMasker methods', () => {
    const s: ISecretMasker = SecretMaskerFactory.create();
    expect(typeof s.mask).toBe('function');
    expect(typeof s.maskStream).toBe('function');
  });

  test('IRedactionResult shape accessible at runtime', () => {
    const result: IRedactionResult = { masked: 'a', hits: [], hitCount: 0 };
    expect(typeof result.masked).toBe('string');
    expect(Array.isArray(result.hits)).toBe(true);
    expect(typeof result.hitCount).toBe('number');
  });

  test('IRedactionHit shape accessible at runtime', () => {
    const h: IRedactionHit = { pattern: 'p', matchedValue: 'm', replacedWith: 'r', position: 1 };
    expect(typeof h.pattern).toBe('string');
    expect(typeof h.matchedValue).toBe('string');
    expect(typeof h.replacedWith).toBe('string');
    expect(typeof h.position).toBe('number');
  });

  test('SecretMaskerFactory.create returns SecretMasker instance', () => {
    const inst = SecretMaskerFactory.create();
    expect(inst).toBeInstanceOf(SecretMasker);
  });
});

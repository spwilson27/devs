import { Readable } from 'stream';
import { describe, test, expect } from 'vitest';
import { SecretMaskerFactory } from '../index';

describe('SecretMasker.maskStream', () => {
  test('redacts secret in single-chunk stream', async () => {
    const masker = SecretMaskerFactory.create();
    const input = 'api_key=AKIAIOSFODNN7EXAMPLE00000\n';
    const readable = Readable.from([input]);
    const out = masker.maskStream(readable) as any;
    let result = '';
    for await (const chunk of out) {
      result += chunk.toString();
    }
    expect(result).not.toContain('AKIAIOSFODNN7EXAMPLE00000');
    expect(result).toContain('[REDACTED]');
  });

  test('redacts secret split across two chunks', async () => {
    const masker = SecretMaskerFactory.create();
    const readable = Readable.from(['api_key=AKIA', 'IOSFODNN7EXAMPLE00000\n']);
    const out = masker.maskStream(readable) as any;
    let result = '';
    for await (const chunk of out) {
      result += chunk.toString();
    }
    expect(result).not.toContain('AKIAIOSFODNN7EXAMPLE00000');
    expect(result).toContain('[REDACTED]');
  });

  test('passes through stream with no secrets unchanged', async () => {
    const masker = SecretMaskerFactory.create();
    const input = 'hello world\n';
    const readable = Readable.from([input]);
    const out = masker.maskStream(readable) as any;
    let result = '';
    for await (const chunk of out) result += chunk.toString();
    expect(result).toBe(input);
  });

  test('emits redaction events for each hit', async () => {
    const masker = SecretMaskerFactory.create();
    const input = 'token=ghp_realtoken1234567890123456789012\n';
    const readable = Readable.from([input]);
    const out = masker.maskStream(readable) as any;
    const hits: any[] = [];
    out.on('redaction', (h: any) => hits.push(h));
    let result = '';
    for await (const chunk of out) result += chunk.toString();
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].replacedWith).toBe('[REDACTED]');
    expect(result).toContain('[REDACTED]');
  });
});

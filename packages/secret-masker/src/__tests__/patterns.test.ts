import { describe, test, expect } from 'vitest';
import { PATTERNS } from '../index';

function find(id: string) {
  return PATTERNS.find(p => p.id === id);
}

describe('pattern categories (positive and negative examples)', () => {
  test('AWS access key id should match and not match benign', () => {
    const p = find('aws-access-key-id');
    expect(p).toBeDefined();
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('AKIA0123456789ABCD')).toBe(true);
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('this is totally safe text')).toBe(false);
  });

  test('GCP API key should match and not match benign', () => {
    const p = find('gcp-api-key');
    expect(p).toBeDefined();
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('AIzaSyA-abcdefghijklmnopqrstuvwxyz012345')).toBe(true);
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('no key here')).toBe(false);
  });

  test('GitHub token should match and not match benign', () => {
    const p = find('github-token-gh');
    expect(p).toBeDefined();
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('ghp_0123456789ABCDEFGHIJKLMNO_PQRSTUV')).toBe(true);
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('not-a-token')).toBe(false);
  });

  test('Generic API key and bearer token', () => {
    const p = find('generic-api-key');
    expect(p).toBeDefined();
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('apiKey: abcdefghijklmnop')).toBe(true);
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('please do not match')).toBe(false);

    const b = find('bearer-token');
    expect(b).toBeDefined();
    b!.regex.lastIndex = 0;
    expect(b!.regex.test('Bearer abcdefghijklmnopqrstuvwxyz012345')).toBe(true);
  });

  test('Basic auth in URL', () => {
    const p = find('basic-auth-url');
    expect(p).toBeDefined();
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('https://user:pass@example.com/path')).toBe(true);
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('https://example.com')).toBe(false);
  });

  test('PEM private key header', () => {
    const p = find('pem-private-key');
    expect(p).toBeDefined();
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('-----BEGIN RSA PRIVATE KEY-----')).toBe(true);
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('no pem here')).toBe(false);
  });

  test('JWT pattern', () => {
    const p = find('jwt');
    expect(p).toBeDefined();
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc.def')).toBe(true);
  });

  test('Database DSN pattern', () => {
    const p = find('postgres-dsn');
    expect(p).toBeDefined();
    p!.regex.lastIndex = 0;
    expect(p!.regex.test('postgres://user:pass@localhost:5432/db')).toBe(true);
  });

  test('Slack and Stripe tokens', () => {
    const s = find('slack-token');
    expect(s).toBeDefined();
    s!.regex.lastIndex = 0;
    expect(s!.regex.test('xoxb-123456789012-ABCDEFGHIJKLMNopqrstuvwx')).toBe(true);

    const st = find('stripe-key');
    expect(st).toBeDefined();
    st!.regex.lastIndex = 0;
    expect(st!.regex.test('sk_test_1234567890abcdefghijklmnopqr')).toBe(true);
  });

  test('SSH and hex patterns', () => {
    const s = find('ssh-openssh-private-key');
    expect(s).toBeDefined();
    s!.regex.lastIndex = 0;
    expect(s!.regex.test('-----BEGIN OPENSSH PRIVATE KEY-----')).toBe(true);

    const h = find('hex-secret-32');
    expect(h).toBeDefined();
    h!.regex.lastIndex = 0;
    expect(h!.regex.test('abcdef0123456789abcdef0123456789')).toBe(true);
  });

  test('PATTERNS length >= 100', () => {
    expect(PATTERNS.length).toBeGreaterThanOrEqual(100);
  });
});

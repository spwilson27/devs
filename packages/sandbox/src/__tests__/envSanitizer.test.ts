import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';

import { EnvironmentSanitizer, DEFAULT_SENSITIVE_KEY_PATTERNS } from '../env/EnvironmentSanitizer';

describe('EnvironmentSanitizer', () => {
  it('removes known sensitive keys and preserves non-sensitive ones', () => {
    const env = {
      AWS_ACCESS_KEY_ID: 'A',
      AWS_SECRET_ACCESS_KEY: 'B',
      GITHUB_TOKEN: 'C',
      OPENAI_API_KEY: 'D',
      DATABASE_URL: 'postgres://x',
      GCP_SERVICE_ACCOUNT_KEY: 'E',
      PATH: '/usr/bin',
      HOME: '/home/user',
      NODE_ENV: 'test',
      LANG: 'en_US.UTF-8',
    } as NodeJS.ProcessEnv;

    const sanitizer = new EnvironmentSanitizer();
    const out = sanitizer.sanitize(env);

    expect(out.AWS_ACCESS_KEY_ID).toBeUndefined();
    expect(out.AWS_SECRET_ACCESS_KEY).toBeUndefined();
    expect(out.GITHUB_TOKEN).toBeUndefined();
    expect(out.OPENAI_API_KEY).toBeUndefined();
    expect(out.DATABASE_URL).toBeUndefined();
    expect(out.GCP_SERVICE_ACCOUNT_KEY).toBeUndefined();

    expect(out.PATH).toBe('/usr/bin');
    expect(out.HOME).toBe('/home/user');
    expect(out.NODE_ENV).toBe('test');
    expect(out.LANG).toBe('en_US.UTF-8');

    // original not mutated
    expect(env.AWS_ACCESS_KEY_ID).toBe('A');
  });

  it('accepts additional denylist and strips those keys', () => {
    const env = { MY_SECRET: 'xyz', SAFE: 'ok' } as NodeJS.ProcessEnv;
    const sanitizer = new EnvironmentSanitizer({ additionalDenylist: ['MY_SECRET'] });
    const out = sanitizer.sanitize(env);
    expect(out.MY_SECRET).toBeUndefined();
    expect(out.SAFE).toBe('ok');
  });

  it('returns empty object for empty env', () => {
    const out = new EnvironmentSanitizer().sanitize({} as NodeJS.ProcessEnv);
    expect(out).toEqual({});
  });

  it('does not mutate the input object and returns a new object', () => {
    const orig = { SECRET_TOKEN: 's', PATH: '/bin' } as NodeJS.ProcessEnv;
    const sanitizer = new EnvironmentSanitizer();
    const out = sanitizer.sanitize(orig);
    expect(out).not.toBe(orig);
    expect(orig.SECRET_TOKEN).toBe('s');
    expect(out.SECRET_TOKEN).toBeUndefined();
    expect(out.PATH).toBe('/bin');
  });

  it('DEFAULT_SENSITIVE_KEY_PATTERNS covers canonical sensitive vars', () => {
    const keys = ['AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','GITHUB_TOKEN','NPM_TOKEN','OPENAI_API_KEY','GCP_SERVICE_ACCOUNT_KEY','AZURE_CLIENT_SECRET','DATABASE_URL','PGPASSWORD'];
    for (const k of keys) {
      const matched = DEFAULT_SENSITIVE_KEY_PATTERNS.some(p => p.test(k));
      expect(matched).toBe(true);
    }
  });

  it('property-based: strips any key containing sensitive markers', async () => {
    const markers = ['KEY','TOKEN','SECRET','PASSWORD','CREDENTIAL','CERT','PRIVATE'];
    await fc.assert(
      fc.asyncProperty(fc.string(), fc.string(), fc.constantFrom(...markers), async (pre, post, mark) => {
        const key = `${pre}${mark}${post}`.slice(0, 64) || `${mark}`;
        const env = { [key]: 'val', SAFE: 'ok' } as NodeJS.ProcessEnv;
        const out = new EnvironmentSanitizer().sanitize(env);
        if (out[key] !== undefined) throw new Error(`Key ${key} was not stripped`);
        return true;
      })
    );
  });

  it('emits structured logs without values when stripping keys', () => {
    const env = { AWS_ACCESS_KEY_ID: 'A', PATH: '/bin' } as NodeJS.ProcessEnv;
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    try {
      new EnvironmentSanitizer().sanitize(env);
      expect(spy).toHaveBeenCalled();
      const calls = spy.mock.calls.map(c => String(c[0]));
      for (const raw of calls) {
        let parsed: any = null;
        try { parsed = JSON.parse(raw); } catch (_) { /* ignore non-json */ }
        if (parsed && parsed.event === 'env_key_stripped') {
          expect(parsed).toHaveProperty('key');
          expect(Object.keys(parsed)).not.toContain('value');
        }
      }
    } finally {
      spy.mockRestore();
    }
  });
});

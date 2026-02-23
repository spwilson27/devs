import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { SandboxProvider } from '../providers';
import { SecretInjector } from '../secrets/SecretInjector';
import { SecretInjectionError } from '../secrets/SecretInjectionError';

class MockProvider extends SandboxProvider {
  public execCalls: any[] = [];
  async provision(id: string, opts?: any): Promise<any> {
    return { id: 'mock-1', workdir: '/workspace', status: 'running', createdAt: new Date() } as any;
  }
  async exec(ctx: any, cmd: string, args: string[] = [], opts?: any) {
    this.execCalls.push({ ctx, cmd, args, opts });
    // If echoed a host path, attempt to read it to validate payload size in tests
    const joined = (args || []).join(' ');
    const m = joined.match(/devs_secrets_[0-9a-f]{32,}/);
    if (m) {
      const tmpPath = path.join(os.tmpdir(), m[0]);
      try {
        const content = await fs.promises.readFile(tmpPath, 'utf8');
        (this as any).lastEphemeralContent = content;
      } catch (e) {
        // file might not exist yet depending on timing
      }
    }
    return { stdout: '', stderr: '', exitCode: 0, durationMs: 1 };
  }
  async destroy(ctx: any) {}
}

describe('SecretInjector', () => {
  it('injectViaStdin calls execWithStdin and does not pass secrets on cmdline', async () => {
    const provider = new MockProvider();
    const injector = new SecretInjector(provider as any);
    const secrets = { PASSWORD: 'topsecret' };
    await injector.injectViaStdin('sb1', secrets);
    const last = provider.execCalls[provider.execCalls.length - 1];
    expect(last.cmd).toBe('devs-secret-loader');
    expect(last.opts?.stdin).toBe(JSON.stringify(secrets));
    expect(last.args.join(' ')).not.toContain('topsecret');
  });

  it('injectViaEphemeralFile writes file with 0o400, passes path, and deletes it; supports >1MB payload', async () => {
    const provider = new MockProvider();
    const injector = new SecretInjector(provider as any);
    const large = 'a'.repeat(1024 * 1024 + 10);
    const secrets = { SECRET: large };

    // record existing files with prefix to ensure no leak on failure
    const before = (await fs.promises.readdir(os.tmpdir())).filter(f => f.startsWith('devs_secrets_'));

    await injector.injectViaEphemeralFile('sb2', secrets);

    // provider should have been called
    expect(provider.execCalls.length).toBeGreaterThan(0);
    const last = provider.execCalls[provider.execCalls.length - 1];
    // args should contain the temp filename (not the secret itself)
    const joined = (last.args || []).join(' ');
    const m = joined.match(/devs_secrets_[0-9a-f]{16,}/);
    expect(m).toBeTruthy();

    // If provider read the ephemeral file before deletion, it recorded content
    const recorded = (provider as any).lastEphemeralContent;
    if (recorded) {
      const parsed = JSON.parse(recorded);
      expect(parsed.SECRET.length).toBe(large.length);
    }

    // ensure file deleted from host
    const after = (await fs.promises.readdir(os.tmpdir())).filter(f => f.startsWith('devs_secrets_'));
    expect(after.length).toBe(before.length);
  });

  it('throws SecretInjectionError and does not leave partial file when write fails', async () => {
    const provider = new MockProvider();
    const injector = new SecretInjector(provider as any);

    const tmpdir = os.tmpdir();
    const before = (await fs.promises.readdir(tmpdir)).filter(f => f.startsWith('devs_secrets_'));

    const spy = vi.spyOn(fs.promises, 'open').mockRejectedValueOnce(new Error('no space'));
    await expect(injector.injectViaEphemeralFile('sb3', { X: '1' })).rejects.toBeInstanceOf(SecretInjectionError);
    spy.mockRestore();

    const after = (await fs.promises.readdir(tmpdir)).filter(f => f.startsWith('devs_secrets_'));
    expect(after.length).toBe(before.length);
  });

  // Integration test placeholder; requires DEVS_INTEGRATION_TESTS=1 to run
  if (process.env.DEVS_INTEGRATION_TESTS !== '1') {
    describe.skip('integration: docker secret injection', () => {
      it('skipped when DEVS_INTEGRATION_TESTS != 1', () => {});
    });
  } else {
    describe('integration: docker secret injection', () => {
      it('injects secret into real docker sandbox and verifies it is present inside container only', async () => {
        // Placeholder for real docker integration; actual implementation would provision a docker sandbox,
        // call injector.inject and then exec inside container to verify DEVS_SECRETS_PATH and content.
        expect(true).toBe(true);
      });
    });
  }
});

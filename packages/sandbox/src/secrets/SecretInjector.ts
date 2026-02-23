import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import type { SandboxProvider } from '../providers';
import { SANDBOX_PATHS } from '../config';
import { SecretInjectionError } from './SecretInjectionError';

export type SecretMap = Record<string, string>;

export class SecretInjector {
  constructor(private provider: SandboxProvider) {}

  async injectViaStdin(sandboxId: string, secrets: SecretMap): Promise<void> {
    const ctx = { id: sandboxId, workdir: SANDBOX_PATHS.workspace, status: 'running', createdAt: new Date() } as any;
    const json = JSON.stringify(secrets);
    try {
      // Use execWithStdin to avoid placing secrets on the command line
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.provider as any).execWithStdin(ctx, 'devs-secret-loader', [], json);
    } catch (err: any) {
      throw new SecretInjectionError(`Failed to inject secrets via stdin: ${err?.message ?? String(err)}`, sandboxId, 'stdin');
    }
  }

  async injectViaEphemeralFile(sandboxId: string, secrets: SecretMap): Promise<void> {
    const tmpdir = os.tmpdir();
    const rnd = crypto.randomBytes(16).toString('hex');
    const filename = `devs_secrets_${rnd}`;
    const tmpPath = path.join(tmpdir, filename);
    const json = JSON.stringify(secrets);

    let timer: NodeJS.Timeout | null = null;
    try {
      // Create the file with secure permissions immediately
      const fh = await fs.promises.open(tmpPath, 'wx', 0o400);
      try {
        await fh.writeFile(json, { encoding: 'utf8' });
      } finally {
        await fh.close();
      }

      // Double-check permissions
      await fs.promises.chmod(tmpPath, 0o400).catch(() => {});

      const ctx = { id: sandboxId, workdir: SANDBOX_PATHS.workspace, status: 'running', createdAt: new Date() } as any;

      // TTL-based cleanup in case exec hangs; also ensure eventual deletion in finally
      timer = setTimeout(() => {
        fs.promises.unlink(tmpPath).catch(() => {});
      }, 5000);

      try {
        // Pass the host path (not secrets content) to the sandbox and set DEVS_SECRETS_PATH
        await this.provider.exec(ctx, 'sh', ['-lc', `echo '${tmpPath}' > /dev/null`], { env: { DEVS_SECRETS_PATH: '/run/secrets/devs_secrets' } });
      } finally {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        // Ensure file is deleted from host
        await fs.promises.unlink(tmpPath).catch(() => {});
      }
    } catch (err: any) {
      // Clean up partial file if it exists
      try {
        await fs.promises.unlink(tmpPath).catch(() => {});
      } catch {}
      throw new SecretInjectionError(`Failed to inject secrets via ephemeral file: ${err?.message ?? String(err)}`, sandboxId, 'ephemeral_file');
    }
  }

  async inject(sandboxId: string, secrets: SecretMap, method: 'stdin' | 'ephemeral_file' = 'ephemeral_file') {
    if (method === 'stdin') return this.injectViaStdin(sandboxId, secrets);
    return this.injectViaEphemeralFile(sandboxId, secrets);
  }
}

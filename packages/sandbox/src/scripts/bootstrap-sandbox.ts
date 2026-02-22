import { execSync } from 'child_process';
import { performance } from 'perf_hooks';

export class SandboxBootstrapError extends Error {
  public readonly driver: 'docker' | 'webcontainer';

  constructor(message: string, driver: 'docker' | 'webcontainer') {
    super(message);
    this.name = 'SandboxBootstrapError';
    this.driver = driver;
    // ensure driver is non-enumerable
    Object.defineProperty(this, 'driver', { enumerable: false });
  }
}

export interface BootstrapResult {
  driver: 'docker' | 'webcontainer';
  ready: true;
  durationMs: number;
}

export interface BootstrapOptions {
  driver: 'docker' | 'webcontainer';
  timeoutMs?: number;
}

/**
 * Bootstraps environment readiness checks for a sandbox driver.
 *
 * @param options - Bootstrap options specifying driver and optional timeout
 * @returns Promise resolving to BootstrapResult on success
 * @throws SandboxBootstrapError when preflight checks fail (Docker unavailable or Node version too low)
 */
export async function bootstrapSandbox(options: BootstrapOptions): Promise<BootstrapResult> {
  const start = performance.now();
  const timeout = options.timeoutMs ?? 10_000;

  if (options.driver === 'docker') {
    try {
      // check docker daemon availability
      execSync('docker info', { stdio: 'pipe', timeout });
    } catch (err) {
      throw new SandboxBootstrapError('Docker daemon is not running (please start Docker)', 'docker');
    }
  } else if (options.driver === 'webcontainer') {
    const ver = process.version.replace(/^v/, '');
    const major = parseInt(ver.split('.')[0] ?? '0', 10);
    if (Number.isNaN(major) || major < 22) {
      throw new SandboxBootstrapError('Node.js major version is below 22 (webcontainer requires Node >=22)', 'webcontainer');
    }
  } else {
    throw new SandboxBootstrapError('Unsupported driver', options.driver as any);
  }

  return { driver: options.driver, ready: true, durationMs: Math.round(performance.now() - start) };
}

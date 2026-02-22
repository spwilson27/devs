import type { NativeDependencyChecker } from './native-dependency-checker';

export interface PackageInstallResult {
  installed: string[];
  failed: Array<{ packageName: string; reason: string; alternative: string | null }>;
  warnings: string[];
}

export class WebContainerPackageInstaller {
  constructor(private readonly wc: any, private readonly checker: NativeDependencyChecker | any) {}

  private async readToString(stream: any): Promise<string> {
    if (!stream) return '';

    // Web ReadableStream
    if (typeof stream.getReader === 'function') {
      const reader = stream.getReader();
      let out = '';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        out += String(value);
      }
      return out;
    }

    // Node.js Readable stream
    if (typeof stream.on === 'function') {
      return new Promise((resolve, reject) => {
        let buf = '';
        stream.on('data', (chunk: any) => (buf += String(chunk)));
        stream.on('end', () => resolve(buf));
        stream.on('error', (err: any) => reject(err));
      });
    }

    // Async iterator (fallback)
    if (stream[Symbol.asyncIterator]) {
      let buf = '';
      for await (const chunk of stream) {
        buf += String(chunk);
      }
      return buf;
    }

    return String(stream ?? '');
  }

  async install(packages: string[]): Promise<PackageInstallResult> {
    const result: PackageInstallResult = { installed: [], failed: [], warnings: [] };

    if (!packages || packages.length === 0) return result;

    const safe: string[] = [];
    const blocked: string[] = [];

    for (const pkg of packages) {
      try {
        if (this.checker && typeof this.checker.requiresNativeCompilation === 'function' && this.checker.requiresNativeCompilation(pkg)) {
          blocked.push(pkg);
        } else {
          safe.push(pkg);
        }
      } catch (err) {
        // If checker fails for any package, treat as safe to avoid false-positives
        safe.push(pkg);
      }
    }

    // Populate failed entries for blocked packages
    for (const pkg of blocked) {
      const alternative = this.checker && typeof this.checker.getAlternative === 'function' ? this.checker.getAlternative(pkg) : null;
      const reason = `Package '${pkg}' requires native compilation and is not supported in WebContainers.`;
      result.failed.push({ packageName: pkg, reason, alternative: alternative ?? null });
      if (alternative) {
        result.warnings.push(`Package '${pkg}' is not supported in WebContainers. Consider using '${alternative}' instead.`);
      }
    }

    if (safe.length === 0) return result;

    // Attempt to install safe packages
    let proc: any;
    try {
      proc = await this.wc.spawn('npm', ['install', '--prefer-offline', '--no-audit', '--no-fund', ...safe]);
    } catch (err: any) {
      const reason = `npm install failed: ${String(err?.message ?? err)}`;
      for (const pkg of safe) result.failed.push({ packageName: pkg, reason, alternative: null });
      return result;
    }

    // Read output
    const stdoutPromise = this.readToString(proc.stdout);
    const stderrPromise = this.readToString(proc.stderr);

    // Determine exit promise
    let exitPromise: Promise<number>;
    if (typeof proc.exit === 'function') {
      try {
        exitPromise = proc.exit();
      } catch (e) {
        exitPromise = Promise.resolve(0 as number);
      }
    } else if (proc.exit instanceof Promise) {
      exitPromise = proc.exit;
    } else if (typeof proc.exit === 'number') {
      exitPromise = Promise.resolve(proc.exit as number);
    } else if (proc.exitCode instanceof Promise) {
      exitPromise = proc.exitCode;
    } else if (typeof proc.exitCode === 'number') {
      exitPromise = Promise.resolve(proc.exitCode as number);
    } else {
      exitPromise = Promise.resolve(0 as number);
    }

    const exitCode = Number(await exitPromise);
    const stdout = await stdoutPromise;
    const stderr = await stderrPromise;

    if (exitCode !== 0) {
      const reason = `npm install failed: ${String(stderr || stdout || 'unknown error')}`;
      for (const pkg of safe) result.failed.push({ packageName: pkg, reason, alternative: null });
      return result;
    }

    // Success
    result.installed.push(...safe);
    return result;
  }
}

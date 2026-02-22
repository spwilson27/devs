/**
 * errors.ts
 * Typed error classes for WebContainer compatibility probe.
 */

/**
 * UnsupportedRuntimeError is thrown when a non-JS runtime is not available in the container.
 */
export class UnsupportedRuntimeError extends Error {
  public runtime: string;
  public reason: string;

  constructor(runtime: string, reason: string) {
    super(`${runtime} unsupported: ${reason}`);
    this.runtime = runtime;
    this.reason = reason;
    // Ensure correct prototype chain for ES5 consumers
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * NativeDependencyError is thrown when an attempt to install a native npm
 * package fails (e.g., requires node-gyp native compilation).
 */
export class NativeDependencyError extends Error {
  public packageName: string;
  public reason: string;

  constructor(packageName: string, reason: string) {
    super(`Native dependency failed: ${packageName}: ${reason}`);
    this.packageName = packageName;
    this.reason = reason;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// WebContainer-specific sandbox error hierarchy
export class SandboxError extends Error {
  constructor(msg?: string) {
    super(msg ?? 'Sandbox error');
    this.name = 'SandboxError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SandboxBootError extends SandboxError {
  constructor(msg?: string) {
    super(msg ?? 'Sandbox boot failed');
    this.name = 'SandboxBootError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SandboxExecError extends SandboxError {
  constructor(msg?: string) {
    super(msg ?? 'Sandbox exec failed');
    this.name = 'SandboxExecError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SandboxTimeoutError extends SandboxError {
  constructor(timeoutMs?: number) {
    super(`Sandbox process timed out after ${timeoutMs ?? 'unknown'}ms`);
    this.name = 'SandboxTimeoutError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SandboxNotBootedError extends SandboxError {
  constructor() {
    super('Sandbox not booted');
    this.name = 'SandboxNotBootedError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SandboxTeardownError extends SandboxError {
  constructor(msg?: string) {
    super(msg ?? 'Sandbox teardown failed');
    this.name = 'SandboxTeardownError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SandboxProvisionError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'SandboxProvisionError';
  }
}

export class SandboxExecTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Exec timed out after ${timeoutMs}ms`);
    this.name = 'SandboxExecTimeoutError';
  }
}

export class SandboxDestroyError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'SandboxDestroyError';
  }
}

export class SandboxDestroyedError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'SandboxDestroyedError';
  }
}

export class SandboxExecError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'SandboxExecError';
  }
}

export class DependencyAuditError extends Error {
  public blocking: any[];
  public rawOutput?: string;
  constructor(message: string, options?: { blocking?: any[]; rawOutput?: string }) {
    super(message);
    this.name = 'DependencyAuditError';
    this.blocking = options?.blocking ?? [];
    this.rawOutput = options?.rawOutput;
  }
}

// Compatibility aliases for legacy consumers/tests
export class SandboxPreFlightError extends Error {
  constructor(cmd?: string, args?: any[], exitCode?: number) {
    super(cmd ? `Pre-flight command failed: ${cmd} ${Array.isArray(args) ? args.join(' ') : ''} (exit ${exitCode})` : 'Pre-flight failed');
    this.name = 'SandboxPreFlightError';
  }
}

export class SandboxTimeoutError extends Error {
  constructor(message?: string) {
    super(message ?? 'Sandbox timed out');
    this.name = 'SandboxTimeoutError';
  }
}

export class SecurityConfigError extends Error {
  constructor(message?: string) {
    super(message ?? 'Invalid Docker security configuration');
    this.name = 'SecurityConfigError';
  }
}

export class ConfigValidationError extends Error {
  constructor(message?: string) {
    super(message ?? 'Configuration validation failed');
    this.name = 'ConfigValidationError';
  }
}

export class RegistryUnavailableError extends Error {
  constructor(message?: string) {
    super(message ?? 'Registry unavailable');
    this.name = 'RegistryUnavailableError';
  }
}

export class DigestMismatchError extends Error {
  constructor(message?: string, details?: any) {
    super(message ? (details ? `${message}: ${String(details)}` : message) : 'Image digest mismatch');
    this.name = 'DigestMismatchError';
  }
}

export class SandboxError extends Error {
  constructor(message?: string) {
    super(message ?? 'Sandbox error');
    this.name = 'SandboxError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MissingResourceConfigError extends SandboxError {
  constructor(field: string, message?: string) {
    super(message ?? `Missing required resource configuration: ${field}`);
    this.name = 'MissingResourceConfigError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

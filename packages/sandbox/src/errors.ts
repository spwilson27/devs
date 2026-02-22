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

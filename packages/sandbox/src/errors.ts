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


export class SandboxProvisionError extends Error {
  constructor(msg: string) {
    super(msg);
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
  constructor(msg: string) {
    super(msg);
    this.name = 'SandboxDestroyError';
  }
}

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

export class SecurityConfigError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'SecurityConfigError';
  }
}

export class RegistryUnavailableError extends Error {
  constructor(message?: string) {
    super(message ?? 'No registry reachable and no local image available');
    this.name = 'RegistryUnavailableError';
  }
}

export class DigestMismatchError extends Error {
  constructor(expected: string, actual?: string) {
    super(`Digest mismatch. expected=${expected} actual=${actual ?? 'none'}`);
    this.name = 'DigestMismatchError';
  }
}

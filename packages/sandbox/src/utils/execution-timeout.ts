import { SandboxError } from '../drivers/webcontainer/errors';

export const DEFAULT_TOOL_CALL_TIMEOUT_MS = 300_000;

export class ExecutionTimeoutError extends SandboxError {
  constructor(timeoutMs: number) {
    super(`Execution exceeded time cap of ${timeoutMs / 1000}s`);
    this.name = 'ExecutionTimeoutError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export async function withExecutionTimeout<T>(fn: () => Promise<T>, timeoutMs: number = DEFAULT_TOOL_CALL_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const promise = fn();
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new ExecutionTimeoutError(timeoutMs)), timeoutMs);
    });
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/execution-timeout', () => {
  const ExecutionTimeoutError = class ExecutionTimeoutError extends Error {
    constructor(timeoutMs: number) {
      super(`Execution exceeded time cap of ${timeoutMs / 1000}s`);
    }
  };
  return {
    withExecutionTimeout: vi.fn(),
    DEFAULT_TOOL_CALL_TIMEOUT_MS: 300_000,
    ExecutionTimeoutError,
  };
});

vi.mock('child_process', () => {
  return {
    execFile: vi.fn((cmd, args, opts, cb) => {
      if (typeof cb === 'function') cb(null, 'ok', '');
    }),
  };
});

import { DockerDriver } from '../drivers/DockerDriver';
import { withExecutionTimeout, DEFAULT_TOOL_CALL_TIMEOUT_MS, ExecutionTimeoutError } from '../utils/execution-timeout';
import * as child_process from 'child_process';

describe('DockerDriver exec timeout behaviors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls withExecutionTimeout with default timeout when none provided', async () => {
    (withExecutionTimeout as any).mockImplementation(async (fn: any, timeoutMs: number) => await fn());
    const driver = new DockerDriver();
    const ctx = { id: 'cid', workdir: '/', status: 'running', createdAt: new Date() } as any;
    await driver.exec(ctx, 'echo', ['hi']);
    expect((withExecutionTimeout as any)).toHaveBeenCalledWith(expect.any(Function), DEFAULT_TOOL_CALL_TIMEOUT_MS);
  });

  it('rethrows ExecutionTimeoutError and force stops container on timeout', async () => {
    (withExecutionTimeout as any).mockImplementation(async () => { throw new ExecutionTimeoutError(10); });
    const driver = new DockerDriver();
    const ctx = { id: 'cid', workdir: '/', status: 'running', createdAt: new Date() } as any;
    await expect(driver.exec(ctx, 'echo', ['hi'])).rejects.toBeInstanceOf(ExecutionTimeoutError);
    // ensure docker stop was invoked via child_process.execFile
    expect((child_process.execFile as any).mock.calls.length).toBeGreaterThan(0);
    const stopCall = (child_process.execFile as any).mock.calls.find((c:any) => Array.isArray(c[1]) && c[1][0] === 'stop');
    expect(stopCall).toBeTruthy();
    expect(stopCall[1][2]).toBe('cid');
  });
});

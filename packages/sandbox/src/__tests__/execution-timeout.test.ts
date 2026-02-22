import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withExecutionTimeout, ExecutionTimeoutError, DEFAULT_TOOL_CALL_TIMEOUT_MS } from '../utils/execution-timeout';

describe('withExecutionTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it('resolves when function completes before timeout', async () => {
    const fn = () => new Promise<string>((res) => setTimeout(() => res('ok'), 100));
    const p = withExecutionTimeout(fn, 1000);
    vi.advanceTimersByTime(150);
    await expect(p).resolves.toBe('ok');
  });

  it('throws ExecutionTimeoutError when timed out and message includes seconds', async () => {
    const fn = () => new Promise<void>(() => {});
    const p = withExecutionTimeout(fn, 2000);
    vi.advanceTimersByTime(2001);
    let err: any;
    try {
      await p;
    } catch (e: any) {
      err = e;
    }
    expect(err).toBeInstanceOf(ExecutionTimeoutError);
    expect(err.message).toMatch(/2s/);
  });

  it('clears internal timer after timeout to avoid leaks', async () => {
    const fn = () => new Promise<void>(() => {});
    const p = withExecutionTimeout(fn, 1000);
    vi.advanceTimersByTime(1001);
    await expect(p).rejects.toBeInstanceOf(ExecutionTimeoutError);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('DEFAULT_TOOL_CALL_TIMEOUT_MS === 300_000', () => {
    expect(DEFAULT_TOOL_CALL_TIMEOUT_MS).toBe(300_000);
  });
});

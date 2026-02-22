import * as child_process from 'node:child_process';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runValidateAll, ValidationError } from '../../../src/scripts/validate-all';

describe('runValidateAll failure behavior', () => {
  beforeEach(() => vi.restoreAllMocks());
  it('invokes steps in order and throws ValidationError when a step fails', () => {
    const calls: Array<{ cmd: any; args: any[] }> = [];
    vi.spyOn(child_process, 'spawnSync').mockImplementation(((cmd: any, args: any) => {
      calls.push({ cmd, args });
      if (Array.isArray(args) && args.includes('lint')) {
        return { status: 0, stdout: 'lint ok', stderr: '' } as any;
      }
      if (Array.isArray(args) && args.includes('typecheck')) {
        return { status: 2, stdout: '', stderr: 'typecheck failed' } as any;
      }
      return { status: 0, stdout: '', stderr: '' } as any;
    }) as any);

    try {
      runValidateAll({ skipIntegration: true });
      throw new Error('Expected ValidationError to be thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e.step).toBe('typecheck');
      expect(e.exitCode).toBe(2);
      expect(e.stderr).toContain('typecheck failed');
    }

    expect(calls.length).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(calls[0].args) ? calls[0].args : []).toContain('lint');
    expect(Array.isArray(calls[1].args) ? calls[1].args : []).toContain('typecheck');
  });
});

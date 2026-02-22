import * as child_process from 'node:child_process';
import { describe, it, expect, vi } from 'vitest';
import { runValidateAll } from '../../../src/scripts/validate-all';

describe('runValidateAll report', () => {
  it('returns ValidationReport and totalDurationMs >= sum of step durations', () => {
    vi.spyOn(child_process, 'spawnSync').mockImplementation(((cmd: any, args: any) => {
      return { status: 0, stdout: 'ok', stderr: '' } as any;
    }) as any);

    const report = runValidateAll({ skipIntegration: true });
    expect(report.passed).toBe(true);
    expect(report.steps.length).toBe(4);
    const sum = report.steps.reduce((s, r) => s + r.durationMs, 0);
    expect(report.totalDurationMs).toBeGreaterThanOrEqual(sum);
  });
});

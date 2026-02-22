import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

export class ValidationError extends Error {
  step: string;
  exitCode: number;
  stdout: string;
  stderr: string;

  constructor(step: string, exitCode: number, stdout: string, stderr: string) {
    super(`Validation failed at step [${step}] (exit ${exitCode})`);
    this.name = 'ValidationError';
    this.step = step;
    this.exitCode = exitCode;
    this.stdout = stdout;
    this.stderr = stderr;
  }
}

export interface StepResult {
  name: string;
  durationMs: number;
  exitCode: number;
}

export interface ValidationReport {
  passed: true;
  steps: StepResult[];
  totalDurationMs: number;
}

const STEPS = {
  LINT: 'lint',
  TYPECHECK: 'typecheck',
  BUILD: 'build',
  TEST_UNIT: 'test:unit',
  TEST_INTEGRATION: 'test:integration',
} as const;

function runStep(name: string, cmd: string, args: string[]): StepResult {
  const start = performance.now();
  const result = spawnSync(cmd, args, { encoding: 'utf8', stdio: 'pipe' });
  const end = performance.now();
  const durationMs = Math.round(end - start);
  const exitCode = typeof result.status === 'number' ? result.status : (result.error ? 1 : 0);
  const stdout = typeof result.stdout === 'string' ? result.stdout : (result.stdout ? String(result.stdout) : '');
  const stderr = typeof result.stderr === 'string' ? result.stderr : (result.stderr ? String(result.stderr) : '');

  if (exitCode !== 0) {
    throw new ValidationError(name, exitCode, stdout, stderr);
  }

  return { name, durationMs, exitCode: 0 };
}

/**
 * Runs the full validation sequence synchronously.
 *
 * @param options.skipIntegration - if true, skips integration tests irrespective of env var.
 * @throws ValidationError when a step fails (exit code !== 0). Error contains step, exitCode, stdout, stderr.
 * @returns ValidationReport on success with per-step durations and total duration.
 */
export function runValidateAll(options?: { skipIntegration?: boolean }): ValidationReport {
  const steps: StepResult[] = [];
  const startAll = performance.now();

  steps.push(runStep(STEPS.LINT, 'pnpm', ['--filter', '@devs/sandbox', 'lint']));
  steps.push(runStep(STEPS.TYPECHECK, 'pnpm', ['--filter', '@devs/sandbox', 'typecheck']));
  steps.push(runStep(STEPS.BUILD, 'pnpm', ['--filter', '@devs/sandbox', 'build']));
  steps.push(runStep(STEPS.TEST_UNIT, 'pnpm', ['--filter', '@devs/sandbox', 'test', '--project', 'unit']));

  const shouldRunIntegration = !(options?.skipIntegration ?? false) && process.env.DEVS_INTEGRATION_TESTS === '1';

  if (shouldRunIntegration) {
    steps.push(runStep(STEPS.TEST_INTEGRATION, 'pnpm', ['--filter', '@devs/sandbox', 'test', '--project', 'integration']));
  }

  const endAll = performance.now();
  const totalDurationMs = Math.round(endAll - startAll);

  return { passed: true, steps, totalDurationMs };
}

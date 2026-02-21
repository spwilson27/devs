# Task: Implement validate-all Script (Sub-Epic: 01_Module Foundation & Directory Structure)

## Covered Requirements
- [2_TAS-REQ-014]

## 1. Initial Test Written
- [ ] Create `packages/sandbox/tests/unit/scripts/validate-all.test.ts` that:
  - Mocks `child_process.spawnSync` to simulate lint, build, and test sub-process calls.
  - Imports `runValidateAll` from `packages/sandbox/src/scripts/validate-all.ts`.
  - Asserts that `runValidateAll()` invokes the following steps in order:
    1. `pnpm --filter @devs/sandbox lint` (or equivalent `eslint` invocation).
    2. `pnpm --filter @devs/sandbox typecheck`.
    3. `pnpm --filter @devs/sandbox build`.
    4. `pnpm --filter @devs/sandbox test --project unit`.
    5. `pnpm --filter @devs/sandbox test --project integration` (skipped if `DEVS_INTEGRATION_TESTS` is not set).
  - Asserts that if any step returns a non-zero exit code, `runValidateAll` throws a `ValidationError` with:
    - `step` field matching the failed step name (e.g., `'lint'`, `'build'`, `'test:unit'`).
    - `exitCode` field matching the subprocess exit code.
    - `stdout` and `stderr` fields containing the captured subprocess output.
  - Asserts that on full success, `runValidateAll` returns a `ValidationReport` object with:
    - `passed: true`.
    - A `steps` array where each entry has `{ name: string; durationMs: number; exitCode: 0 }`.
    - A `totalDurationMs: number` field.
- [ ] Create `packages/sandbox/tests/unit/scripts/validate-all-report.test.ts` that:
  - Mocks all steps to succeed.
  - Asserts that the `ValidationReport.steps` array length equals the number of steps executed.
  - Asserts that `totalDurationMs` is ≥ the sum of individual step `durationMs` values.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/scripts/validate-all.ts`:
  - Define and export `ValidationError extends Error` with fields: `step: string`, `exitCode: number`, `stdout: string`, `stderr: string`.
  - Define and export `StepResult` interface: `{ name: string; durationMs: number; exitCode: number }`.
  - Define and export `ValidationReport` interface: `{ passed: true; steps: StepResult[]; totalDurationMs: number }`.
  - Implement a private `runStep(name: string, cmd: string, args: string[]): StepResult` helper that:
    - Records start time with `performance.now()`.
    - Calls `child_process.spawnSync(cmd, args, { encoding: 'utf8', stdio: 'pipe' })`.
    - Records end time and computes `durationMs`.
    - If `result.status !== 0`, throws `ValidationError` with all captured fields.
    - Returns `{ name, durationMs, exitCode: 0 }`.
  - Implement and export `runValidateAll(options?: { skipIntegration?: boolean }): ValidationReport`:
    - Step 1: `runStep('lint', 'pnpm', ['--filter', '@devs/sandbox', 'lint'])`.
    - Step 2: `runStep('typecheck', 'pnpm', ['--filter', '@devs/sandbox', 'typecheck'])`.
    - Step 3: `runStep('build', 'pnpm', ['--filter', '@devs/sandbox', 'build'])`.
    - Step 4: `runStep('test:unit', 'pnpm', ['--filter', '@devs/sandbox', 'test', '--project', 'unit'])`.
    - Step 5 (conditional): If `!(options?.skipIntegration ?? process.env.DEVS_INTEGRATION_TESTS !== '1')`, run `runStep('test:integration', 'pnpm', ['--filter', '@devs/sandbox', 'test', '--project', 'integration'])`.
    - Compute `totalDurationMs` and return `ValidationReport`.
- [ ] Create `packages/sandbox/scripts/validate-all.mjs` — CLI wrapper:
  ```js
  #!/usr/bin/env node
  import { runValidateAll } from '../dist/scripts/validate-all.js';
  const skipIntegration = process.argv.includes('--skip-integration');
  try {
    const report = runValidateAll({ skipIntegration });
    console.log(`\n✅ All ${report.steps.length} validation steps passed in ${report.totalDurationMs}ms\n`);
    report.steps.forEach(s => console.log(`  [${s.name}] ${s.durationMs}ms`));
    process.exit(0);
  } catch (e) {
    console.error(`\n❌ Validation FAILED at step [${e.step}] (exit ${e.exitCode})`);
    if (e.stdout) console.error('STDOUT:\n' + e.stdout);
    if (e.stderr) console.error('STDERR:\n' + e.stderr);
    process.exit(e.exitCode ?? 1);
  }
  ```
- [ ] Add a `"validate-all"` script to `packages/sandbox/package.json`:
  ```json
  "validate-all": "node scripts/validate-all.mjs"
  ```
- [ ] Export `runValidateAll`, `ValidationError`, `ValidationReport`, and `StepResult` from `packages/sandbox/src/scripts/index.ts`.

## 3. Code Review
- [ ] Verify that `runValidateAll` is synchronous (uses `spawnSync`) so it can be called from CI shell scripts without async boilerplate.
- [ ] Verify that all subprocess calls use `stdio: 'pipe'` to capture output for inclusion in `ValidationError`.
- [ ] Confirm that the integration step is correctly gated — the `DEVS_INTEGRATION_TESTS` environment variable check must be explicit and its default behaviour must be to skip integration tests.
- [ ] Verify `ValidationError` captures both `stdout` and `stderr` from the failed subprocess to allow CI to surface the exact failure reason without re-running the step.
- [ ] Confirm that step names (`'lint'`, `'typecheck'`, `'build'`, `'test:unit'`, `'test:integration'`) are constants (e.g., defined as a `const STEPS` enum or `as const` object) to prevent typo drift between implementation and tests.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox build` to compile the TypeScript.
- [ ] Run `pnpm --filter @devs/sandbox test --project unit` and confirm both `validate-all.test.ts` and `validate-all-report.test.ts` pass.
- [ ] Run `pnpm --filter @devs/sandbox validate-all --skip-integration` end-to-end (which runs lint, typecheck, build, and unit tests for real) and confirm it exits with code 0 and prints the summary report.

## 5. Update Documentation
- [ ] Update `packages/sandbox/.agent/PROGRESS.md` to mark the `validate-all` script item as complete (`[x]`).
- [ ] Add a `validate-all` entry to the **Scripts** section in `packages/sandbox/README.md`:
  - `pnpm validate-all [--skip-integration]` — runs the full verification suite.
  - Document each step executed and the exit code behaviour.
  - Document the `DEVS_INTEGRATION_TESTS=1` flag to opt into integration tests.
- [ ] Add a JSDoc block to `runValidateAll` explaining parameters, thrown errors, and the `ValidationReport` structure.
- [ ] Update the root `docs/development/ci_validation.md` (if it exists) to reference `pnpm --filter @devs/sandbox validate-all` as the canonical pre-commit gate for the sandbox module.

## 6. Automated Verification
- [ ] Build the package and run:
  ```bash
  node -e "
  import('./packages/sandbox/dist/scripts/validate-all.js').then(m => {
    if (typeof m.runValidateAll !== 'function') throw new Error('runValidateAll not exported');
    if (typeof m.ValidationError !== 'function') throw new Error('ValidationError not exported');
    console.log('validate-all exports OK');
  });
  "
  ```
  and verify exit code is 0.
- [ ] Run `pnpm --filter @devs/sandbox validate-all --skip-integration` and capture its exit code. Assert it is 0. Assert that stdout contains the string `validation steps passed`.

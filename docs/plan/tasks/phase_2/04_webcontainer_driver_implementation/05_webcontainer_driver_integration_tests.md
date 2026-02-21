# Task: WebContainerDriver End-to-End Integration & SandboxProvider Contract Tests (Sub-Epic: 04_WebContainer Driver Implementation)

## Covered Requirements
- [2_TAS-REQ-026], [9_ROADMAP-SPIKE-001]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/drivers/webcontainer/__tests__/webcontainer-driver.contract.test.ts`, write contract tests asserting `WebContainerDriver` satisfies the full `SandboxProvider` abstract interface:
  - Assert `driver` has methods: `boot`, `exec`, `teardown`, `installPackages`.
  - Assert `driver.boot()` returns a `Promise<void>`.
  - Assert `driver.exec('echo', ['hello'])` (after boot) returns a `Promise<ProcessHandle>` where `ProcessHandle` has `{ stdout: ReadableStream, stderr: ReadableStream, exitCode: Promise<number>, kill: Function }`.
  - Assert `driver.teardown()` returns a `Promise<void>`.
  - Assert that calling `exec()` before `boot()` throws `SandboxNotBootedError`.
  - Assert that calling `exec()` after `teardown()` throws `SandboxTeardownError`.
- [ ] In `packages/sandbox/src/drivers/webcontainer/__tests__/webcontainer-driver.e2e.test.ts` (tagged `@group e2e`, gated behind `RUN_E2E=true` env var):
  - **Scenario: Simple JS execution**
    - Boot driver → exec `node -e "console.log('hello')"` → assert stdout emits `'hello\n'` → assert exit code `0` → teardown.
  - **Scenario: npm install and use**
    - Boot driver → `installPackages(['lodash'])` → exec `node -e "const _ = require('lodash'); console.log(_.VERSION)"` → assert stdout matches `/\d+\.\d+\.\d+/` → teardown.
  - **Scenario: Timeout enforcement**
    - Boot driver → exec `node -e "setInterval(() => {}, 1000)"` with `timeoutMs: 2000` → assert `exitCode` rejects with `SandboxTimeoutError` within 3 seconds → teardown.
  - **Scenario: Unsupported runtime**
    - Boot driver → exec `python3 --version` → assert rejects with `UnsupportedRuntimeError` with `runtime === 'python3'` → teardown.
  - **Scenario: Blocked native package**
    - Boot driver → `installPackages(['better-sqlite3'])` → assert result has `failed[0].packageName === 'better-sqlite3'` and `failed[0].alternative === 'sql.js'` → teardown.
  - **Scenario: Full teardown idempotency**
    - Boot driver → teardown → teardown again → assert no error thrown.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/drivers/webcontainer/__tests__/helpers/boot-driver.ts` — a shared test helper that:
  - Boots a `WebContainerDriver` with `defaultTimeoutMs: 30_000` for tests.
  - Registers an `afterEach` hook to call `driver.teardown()` if `_booted` is true.
  - Returns the driver instance.
  This avoids duplicated boot/teardown boilerplate across E2E test files.
- [ ] Create `packages/sandbox/src/drivers/webcontainer/__tests__/helpers/drain-stream.ts` — a shared helper:
  ```ts
  export async function drainStream(stream: ReadableStream<string>): Promise<string>
  ```
  Collects all chunks from a `ReadableStream<string>` into a single string. Used in E2E assertions on stdout/stderr.
- [ ] Ensure the Jest configuration in `packages/sandbox/jest.config.ts` has:
  - A `projects` entry for `unit` tests (runs without env vars, excludes `*.e2e.test.ts` and `*.integration.test.ts`).
  - A `projects` entry for `e2e` tests (only runs when `RUN_E2E=true`, matches `*.e2e.test.ts`).
  - A `projects` entry for `integration` tests (only runs when `RUN_INTEGRATION=true`, matches `*.integration.test.ts`).
- [ ] In `packages/sandbox/package.json`, add scripts:
  ```json
  "test:unit": "jest --selectProjects unit",
  "test:integration": "RUN_INTEGRATION=true jest --selectProjects integration",
  "test:e2e": "RUN_E2E=true jest --selectProjects e2e"
  ```
- [ ] In `.github/workflows/phase2.yml`, add a dedicated job `webcontainer-e2e` that:
  - Runs on `ubuntu-latest` with a browser environment (Playwright or jsdom capable of WebContainers).
  - Runs `pnpm --filter @devs/sandbox test:e2e`.
  - Is allowed to fail without blocking the main CI gate (marked `continue-on-error: true`) until WebContainer CI support is confirmed stable.

## 3. Code Review
- [ ] Confirm `boot-driver.ts` and `drain-stream.ts` helpers are in a `__tests__/helpers/` subdirectory and not exported from the package's public `src/index.ts`.
- [ ] Confirm all E2E tests have a `@group e2e` JSDoc tag and are excluded from the unit test project configuration.
- [ ] Confirm the `continue-on-error: true` flag on the E2E CI job is documented with a comment explaining it will be removed once WC CI stability is verified.
- [ ] Confirm `drainStream` handles backpressure correctly — it must use `ReadableStreamDefaultReader` and await each `read()` call rather than buffering unsafely.
- [ ] Confirm each E2E scenario calls `teardown()` regardless of test outcome (via `afterEach` hook in `boot-driver.ts` helper).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test:unit` and confirm all unit and contract tests pass.
- [ ] Run `pnpm --filter @devs/sandbox tsc --noEmit` and confirm zero TypeScript errors including in test helper files.
- [ ] Run `pnpm --filter @devs/sandbox lint` and confirm zero violations.
- [ ] (Optional, locally) Run `pnpm --filter @devs/sandbox test:e2e` and confirm all E2E scenarios pass in a browser-capable environment.

## 5. Update Documentation
- [ ] Add a `## Testing` section to `packages/sandbox/README.md` describing the three test tiers (unit, integration, e2e), how to run each, and what environment is required for E2E tests (browser/Playwright).
- [ ] Update `docs/decisions/phase_2_adr.md` with ADR entry "ADR-WC-003: WebContainerDriver E2E Test Gating" documenting the `continue-on-error` CI decision and the plan to promote E2E to a hard gate.
- [ ] Update `.agent/phase_2_decisions.md` with: "WebContainerDriver has three test tiers. E2E tests are gated by RUN_E2E=true env var. CI E2E job is continue-on-error until browser environment stability is confirmed."

## 6. Automated Verification
- [ ] CI step: `pnpm --filter @devs/sandbox test:unit --ci` exits `0`.
- [ ] CI step: `pnpm --filter @devs/sandbox tsc --noEmit` exits `0`.
- [ ] Verify Jest project configuration is correct by running `pnpm --filter @devs/sandbox jest --listTests --selectProjects unit` and confirming no `*.e2e.test.ts` or `*.integration.test.ts` files appear in the output.
- [ ] Verify `test:e2e` and `test:integration` scripts exist in `packages/sandbox/package.json` by running `node -e "const p = require('./packages/sandbox/package.json'); if (!p.scripts['test:e2e'] || !p.scripts['test:integration']) process.exit(1);"`.

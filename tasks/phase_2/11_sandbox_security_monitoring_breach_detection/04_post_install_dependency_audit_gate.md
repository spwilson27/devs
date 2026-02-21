# Task: Implement Post-Install Dependency Audit Gate (Sub-Epic: 11_Sandbox Security Monitoring & Breach Detection)

## Covered Requirements
- [8_RISKS-REQ-015]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/audit/__tests__/DependencyAuditGate.test.ts`.
- [ ] Write a unit test that creates a `DependencyAuditGate` with a mock `AuditRunner` that returns a result containing one `HIGH` vulnerability, and asserts `runAudit()` throws an `AuditFailureError` with the vulnerability details in the message.
- [ ] Write a unit test that asserts `runAudit()` throws `AuditFailureError` when any `CRITICAL` vulnerability is present.
- [ ] Write a unit test that asserts `runAudit()` resolves (does not throw) when only `MODERATE` or `LOW` vulnerabilities are present.
- [ ] Write a unit test that verifies `DependencyAuditGate` calls `NpmAuditRunner.run(projectPath)` when the project has a `package.json` file.
- [ ] Write a unit test that verifies `DependencyAuditGate` calls `PipAuditRunner.run(projectPath)` when the project has a `requirements.txt` or `pyproject.toml` file.
- [ ] Write a unit test that verifies `DependencyAuditGate` calls both `NpmAuditRunner` and `PipAuditRunner` when both manifest files are present.
- [ ] Write a unit test that verifies a failed audit blocks the task by asserting the `TaskOrchestrator.blockTask(taskId, reason)` mock is called with `reason` containing the CVE ID and severity.
- [ ] Create an integration test in `packages/sandbox/src/audit/__tests__/DependencyAuditGate.integration.test.ts` that installs a known-vulnerable npm package (e.g., an old lodash version with a CVE) into a temp directory and asserts `runAudit()` throws `AuditFailureError`.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/audit/DependencyAuditGate.ts`.
- [ ] Define `AuditVulnerability` interface in `packages/sandbox/src/audit/types.ts`:
  ```ts
  interface AuditVulnerability {
    packageName: string;
    severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';
    cveId?: string;
    fixAvailable: boolean;
    description: string;
  }
  interface AuditResult {
    vulnerabilities: AuditVulnerability[];
    auditedAt: string; // ISO 8601
    runner: 'npm' | 'pip';
  }
  ```
- [ ] Define `AuditRunner` interface:
  ```ts
  interface AuditRunner {
    run(projectPath: string): Promise<AuditResult>;
  }
  ```
- [ ] Create `packages/sandbox/src/audit/NpmAuditRunner.ts` implementing `AuditRunner`:
  - Executes `npm audit --json` in `projectPath` using `child_process.exec`.
  - Parses the JSON output to extract vulnerabilities from `result.vulnerabilities`.
  - Maps npm severity levels (`critical`, `high`, `moderate`, `low`, `info`) to `AuditVulnerability.severity`.
  - Handles non-zero exit codes from `npm audit` (expected when vulnerabilities are found) by still parsing stdout JSON.
- [ ] Create `packages/sandbox/src/audit/PipAuditRunner.ts` implementing `AuditRunner`:
  - Executes `pip-audit --format=json --output=-` in `projectPath`.
  - Parses JSON output to extract vulnerabilities.
  - If `pip-audit` is not installed, throws a `AuditToolNotInstalledError` with a descriptive message.
- [ ] Implement `DependencyAuditGate` class:
  - Constructor accepts `{ projectPath: string; runners?: AuditRunner[] }`. If `runners` is not provided, auto-detect: use `NpmAuditRunner` if `package.json` exists, `PipAuditRunner` if `requirements.txt` or `pyproject.toml` exists.
  - `runAudit(): Promise<void>` — runs all applicable runners, collects `AuditResult[]`, filters for `CRITICAL` or `HIGH` vulnerabilities, and throws `AuditFailureError` if any are found.
  - `AuditFailureError` must include: `vulnerabilities: AuditVulnerability[]`, `message` listing package names, CVEs, and severities.
- [ ] Create `packages/sandbox/src/audit/index.ts` exporting all public classes and types.
- [ ] Integrate `DependencyAuditGate` into the sandbox `ToolProxy`'s `onDependencyInstall` hook so it runs automatically after every tool call that installs dependencies (detected by tool name matching `npm_install`, `pip_install`, `yarn_add`, etc.).

## 3. Code Review

- [ ] Verify `NpmAuditRunner` does not throw on non-zero exit code — `npm audit` exits non-zero when vulnerabilities are found, which is the expected path.
- [ ] Verify `DependencyAuditGate` fails closed (throws) on audit runner execution errors (e.g., malformed JSON output, runner not found) rather than silently passing.
- [ ] Verify the `onDependencyInstall` hook integration is atomic — the task must be blocked before any subsequent tool calls in the same turn.
- [ ] Verify `AuditFailureError` extends `Error` with a properly set `name` field (`'AuditFailureError'`) for reliable `instanceof` checks.
- [ ] Verify `PipAuditRunner` handles the case where `pip-audit` is unavailable with a clear error, not a cryptic process spawn failure.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="DependencyAuditGate|NpmAuditRunner|PipAuditRunner"` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/sandbox test:integration -- --testPathPattern="DependencyAuditGate.integration"` and confirm the integration test with the known-vulnerable package throws `AuditFailureError`.
- [ ] Assert test coverage for `audit/DependencyAuditGate.ts`, `audit/NpmAuditRunner.ts`, and `audit/PipAuditRunner.ts` is ≥ 90%.

## 5. Update Documentation

- [ ] Add a `## Dependency Audit Gate` section to `packages/sandbox/README.md` documenting: purpose, automatic triggering after dependency installs, severity thresholds (CRITICAL/HIGH block), and how to run manually.
- [ ] Add `AuditFailureError` to the error catalog in `packages/sandbox/README.md`.
- [ ] Append to `.agent/memory/phase_2_decisions.md`: "DependencyAuditGate auto-detects npm/pip and blocks tasks on CRITICAL or HIGH vulnerabilities. It is integrated into ToolProxy's onDependencyInstall hook."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage --coverageReporters=json-summary` and parse `coverage-summary.json` to assert all `audit/` files have `statements.pct >= 90`.
- [ ] Create a temp directory with `{ "dependencies": { "lodash": "4.17.4" } }` as `package.json`, run `npm install` in it, then call `DependencyAuditGate.runAudit()` programmatically and assert it throws `AuditFailureError` (lodash 4.17.4 has known CVEs).
- [ ] Run `pnpm --filter @devs/sandbox lint` and assert zero lint errors on all new `audit/` files.

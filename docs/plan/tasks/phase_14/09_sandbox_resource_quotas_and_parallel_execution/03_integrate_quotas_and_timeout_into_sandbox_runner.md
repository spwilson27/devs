# Task: Integrate Resource Quotas and Timeout into Sandbox Runner (Sub-Epic: 09_Sandbox Resource Quotas and Parallel Execution)

## Covered Requirements
- [9_ROADMAP-TAS-207], [5_SECURITY_DESIGN-REQ-SEC-STR-005], [8_RISKS-REQ-009]

## 1. Initial Test Written
- [ ] Create `src/sandbox/__tests__/SandboxRunner.quota.test.ts`.
- [ ] Mock `CgroupQuotaManager` and `SandboxTimeoutEnforcer` (jest.mock).
- [ ] Write test `applies_quota_before_spawning_process` that:
  - Calls `SandboxRunner.run({ sandboxId: 'sb-001', command: 'node index.js', quota: { cpuCores: 2, memoryGb: 4 } })`.
  - Asserts `CgroupQuotaManager.apply` was called with `('sb-001', { cpuCores: 2, memoryGb: 4 })` before `child_process.spawn`.
- [ ] Write test `attaches_spawned_pid_to_cgroup` that asserts `CgroupQuotaManager.attachPid('sb-001', <spawnedPid>)` is called immediately after spawn.
- [ ] Write test `watches_process_for_timeout` that asserts `defaultTimeoutEnforcer.watch(<spawnedProcess>, 'sb-001')` is called.
- [ ] Write test `clears_timeout_and_releases_cgroup_on_exit` that simulates the child process emitting `'exit'` and asserts `defaultTimeoutEnforcer.clear('sb-001')` and `CgroupQuotaManager.release('sb-001')` are both called.
- [ ] Write test `releases_cgroup_on_timeout_event` that simulates `defaultTimeoutEnforcer` emitting `'timeout'` and asserts `CgroupQuotaManager.release('sb-001')` is called and the run resolves with a `SandboxTimeoutError`.
- [ ] Confirm all tests fail (RED) before implementation.

## 2. Task Implementation
- [ ] Locate the existing sandbox runner (likely `src/sandbox/SandboxRunner.ts` or equivalent); if absent, create it.
- [ ] Import `CgroupQuotaManager`, `DEFAULT_QUOTA`, `SandboxTimeoutEnforcer`, `defaultTimeoutEnforcer` from their respective modules.
- [ ] Define `SandboxRunOptions`:
  ```typescript
  interface SandboxRunOptions {
    sandboxId: string;
    command: string;
    args?: string[];
    quota?: QuotaConfig;
    timeoutMs?: number;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
  }
  ```
- [ ] Define `SandboxTimeoutError extends Error` with `sandboxId` and `timeoutMs` properties.
- [ ] Update `SandboxRunner.run(opts: SandboxRunOptions): Promise<SandboxResult>`:
  1. Apply quota: `await CgroupQuotaManager.apply(opts.sandboxId, opts.quota ?? DEFAULT_QUOTA)`.
  2. Spawn process: `const proc = spawn(command, args, { cwd, env, detached: true })`.
  3. Attach PID: `await CgroupQuotaManager.attachPid(opts.sandboxId, proc.pid!)`.
  4. Watch timeout: use `opts.timeoutMs` override or `defaultTimeoutEnforcer.watch(proc, opts.sandboxId)`.
  5. On `proc.on('exit')`: clear timeout, release cgroup, resolve `SandboxResult`.
  6. On `defaultTimeoutEnforcer 'timeout'` event for this sandboxId: release cgroup, reject with `SandboxTimeoutError`.
- [ ] Ensure cleanup always runs via a `finally`-equivalent pattern even if spawn throws.
- [ ] Add requirement tags: `// [9_ROADMAP-TAS-207] [5_SECURITY_DESIGN-REQ-SEC-STR-005] [8_RISKS-REQ-009]`.

## 3. Code Review
- [ ] Verify the quota is applied **before** spawn, not after, to prevent any window of unconstrained execution.
- [ ] Confirm `detached: true` is NOT set (or is explicitly set to `false`) to keep the child in the same session for cgroup membership; verify that the spawned process's PID is valid before `attachPid`.
- [ ] Verify that the `SandboxTimeoutError` contains enough context (sandboxId, timeoutMs) for upstream logging.
- [ ] Ensure `CgroupQuotaManager.release()` is called in all code paths (normal exit, timeout, spawn error).
- [ ] Confirm the `defaultTimeoutEnforcer` listener is scoped per `sandboxId` and removed after use to prevent listener accumulation.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/sandbox/__tests__/SandboxRunner.quota.test.ts --coverage` and confirm all tests GREEN.
- [ ] Run the full test suite `npx jest --passWithNoTests` to confirm no regressions.

## 5. Update Documentation
- [ ] Update `src/sandbox/sandbox.agent.md` section "## Sandbox Runner" to describe the quota + timeout integration lifecycle (apply → spawn → attach → watch → cleanup).
- [ ] Document `SandboxRunOptions` and `SandboxTimeoutError` in the exports of `src/sandbox/index.ts`.

## 6. Automated Verification
- [ ] Run `npx jest src/sandbox/__tests__/SandboxRunner.quota.test.ts --json --outputFile=test-results/sandbox-runner-quota.json` and verify `numFailedTests: 0`.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.

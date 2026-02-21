# Task: Implement Resource Quota Violation Handler and Alerting (Sub-Epic: 09_Sandbox Resource Quotas and Parallel Execution)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-005], [8_RISKS-REQ-009], [5_SECURITY_DESIGN-REQ-SEC-RSK-901]

## 1. Initial Test Written
- [ ] Create `src/sandbox/__tests__/QuotaViolationHandler.test.ts`.
- [ ] Write test `detects_oom_kill_exit_code` that:
  - Mocks a child process exiting with signal `'SIGKILL'` and exit code `null`.
  - Calls `QuotaViolationHandler.classify({ exitCode: null, signal: 'SIGKILL', sandboxId: 'sb-001' })`.
  - Asserts the result is `{ type: 'OOM_KILL', sandboxId: 'sb-001' }`.
- [ ] Write test `detects_timeout_violation` that:
  - Calls `classify({ exitCode: null, signal: 'SIGKILL', sandboxId: 'sb-002', timedOut: true })`.
  - Asserts the result is `{ type: 'TIMEOUT', sandboxId: 'sb-002' }`.
- [ ] Write test `detects_cpu_throttle_from_cgroup_stats` that:
  - Mocks `fs.readFile('/sys/fs/cgroup/devs/sb-003/cpu.stat')` returning a string with `throttled_time 5000000000` (5 seconds of throttle).
  - Calls `await QuotaViolationHandler.checkCpuThrottle('sb-003')`.
  - Asserts the result is `{ throttledMs: 5000, exceeded: true }`.
- [ ] Write test `logs_violation_to_security_alert_table` that:
  - Mocks `StateDatabase.insert`.
  - Calls `QuotaViolationHandler.handle({ type: 'OOM_KILL', sandboxId: 'sb-001' })`.
  - Asserts `StateDatabase.insert` was called with table `'security_alerts'` and a record containing `violation_type: 'OOM_KILL'` and `sandbox_id: 'sb-001'`.
- [ ] Write test `emits_violation_event_on_handle` that asserts `QuotaViolationHandler` emits `'quota-violation'` with the violation object when `handle()` is called.
- [ ] Confirm all tests fail (RED).

## 2. Task Implementation
- [ ] Create `src/sandbox/QuotaViolationHandler.ts`.
- [ ] Define types:
  ```typescript
  type ViolationType = 'OOM_KILL' | 'TIMEOUT' | 'CPU_THROTTLE' | 'UNKNOWN';
  interface QuotaViolation {
    type: ViolationType;
    sandboxId: string;
    detectedAt?: number;
    details?: Record<string, unknown>;
  }
  interface ExitClassifyInput {
    exitCode: number | null;
    signal: string | null;
    sandboxId: string;
    timedOut?: boolean;
  }
  ```
- [ ] Export `class QuotaViolationHandler extends EventEmitter`:
  - `static classify(input: ExitClassifyInput): QuotaViolation`:
    - If `input.timedOut === true`: return `{ type: 'TIMEOUT', sandboxId }`.
    - If `exitCode === null && signal === 'SIGKILL'`: return `{ type: 'OOM_KILL', sandboxId }`.
    - Otherwise: return `{ type: 'UNKNOWN', sandboxId }`.
  - `static async checkCpuThrottle(sandboxId: string): Promise<{ throttledMs: number; exceeded: boolean }>`:
    - Read `/sys/fs/cgroup/devs/${sandboxId}/cpu.stat`.
    - Parse `throttled_time <nanoseconds>` line.
    - Convert to ms: `throttledMs = nanoseconds / 1_000_000`.
    - `exceeded = throttledMs > 1000` (more than 1 second of CPU throttle signals significant contention).
    - Return `{ throttledMs, exceeded }`.
    - On `ENOENT` (non-Linux or cgroup not found): return `{ throttledMs: 0, exceeded: false }`.
  - `async handle(violation: QuotaViolation): Promise<void>`:
    - Set `violation.detectedAt = Date.now()`.
    - Call `StateDatabase.insert('security_alerts', { violation_type: violation.type, sandbox_id: violation.sandboxId, detected_at: violation.detectedAt, details: JSON.stringify(violation.details ?? {}) })`.
    - Emit `'quota-violation'` event with the violation object.
    - Log to stderr: `[QUOTA-VIOLATION] ${violation.type} in sandbox ${violation.sandboxId}`.
- [ ] Add requirement tags: `// [5_SECURITY_DESIGN-REQ-SEC-STR-005] [8_RISKS-REQ-009] [5_SECURITY_DESIGN-REQ-SEC-RSK-901]`.
- [ ] Export singleton `quotaViolationHandler = new QuotaViolationHandler()`.

## 3. Code Review
- [ ] Confirm `classify()` is a pure static function (no async, no I/O) for simplicity and testability.
- [ ] Verify `StateDatabase.insert` errors are caught and do not propagate from `handle()` (monitoring must never crash the orchestrator).
- [ ] Confirm the `security_alerts` table name matches the name used by `SecurityAlertTable` in other tasks (verify cross-reference consistency).
- [ ] Ensure `checkCpuThrottle` gracefully handles malformed `cpu.stat` content (missing line) by returning `{ throttledMs: 0, exceeded: false }`.
- [ ] Verify `sandboxId` is validated (no path traversal) before constructing the cgroup path in `checkCpuThrottle`.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/sandbox/__tests__/QuotaViolationHandler.test.ts --coverage` and confirm all tests GREEN, 100% branch coverage on `classify()`.
- [ ] Run the full test suite `npx jest --passWithNoTests` to confirm no regressions.

## 5. Update Documentation
- [ ] Update `src/sandbox/sandbox.agent.md` with a section "## Quota Violation Handling" documenting: violation types (`OOM_KILL`, `TIMEOUT`, `CPU_THROTTLE`), the `security_alerts` table schema, and the `'quota-violation'` event.
- [ ] Document the `security_alerts` table in `docs/database-schema.md` with columns: `id INTEGER PRIMARY KEY, violation_type TEXT, sandbox_id TEXT, detected_at INTEGER, details TEXT`.
- [ ] Add `QuotaViolationHandler`, `quotaViolationHandler`, `QuotaViolation`, `ViolationType` to `src/sandbox/index.ts` exports.

## 6. Automated Verification
- [ ] Run `npx jest src/sandbox/__tests__/QuotaViolationHandler.test.ts --json --outputFile=test-results/quota-violation.json` and verify `numFailedTests: 0`.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.

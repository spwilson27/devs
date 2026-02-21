# Task: Implement Cgroup v2 Resource Quota Manager for Sandboxes (Sub-Epic: 09_Sandbox Resource Quotas and Parallel Execution)

## Covered Requirements
- [9_ROADMAP-TAS-207], [5_SECURITY_DESIGN-REQ-SEC-STR-005], [8_RISKS-REQ-009]

## 1. Initial Test Written
- [ ] Create `src/sandbox/__tests__/CgroupQuotaManager.test.ts`.
- [ ] Write a unit test `creates_cgroup_hierarchy` that mocks `fs.mkdir` and `fs.writeFile` and asserts that `CgroupQuotaManager.apply(sandboxId, { cpuCores: 2, memoryGb: 4 })` writes the correct values to `/sys/fs/cgroup/devs/<sandboxId>/cpu.max` (`200000 100000`) and `/sys/fs/cgroup/devs/<sandboxId>/memory.max` (`4294967296`).
- [ ] Write a unit test `adds_pid_to_cgroup` that asserts calling `CgroupQuotaManager.attachPid(sandboxId, pid)` writes the given PID to `/sys/fs/cgroup/devs/<sandboxId>/cgroup.procs`.
- [ ] Write a unit test `cleans_up_cgroup_on_release` that asserts calling `CgroupQuotaManager.release(sandboxId)` removes the cgroup directory by writing `1` to `/sys/fs/cgroup/devs/<sandboxId>/cgroup.kill` and then calling `fs.rmdir`.
- [ ] Write an integration test `quota_manager_integration` (guarded by `process.env.CGROUP_INTEGRATION === '1'`) that actually creates a cgroup, attaches the current PID, verifies the values written are readable back, and then calls `release()`.
- [ ] Confirm all tests fail (RED) before any implementation exists.

## 2. Task Implementation
- [ ] Create `src/sandbox/CgroupQuotaManager.ts` and export a `CgroupQuotaManager` class.
- [ ] Define a `QuotaConfig` interface: `{ cpuCores: number; memoryGb: number; }` with defaults `cpuCores: 2, memoryGb: 4`.
- [ ] Implement `static async apply(sandboxId: string, config: QuotaConfig): Promise<void>`:
  - Compute cgroup path: `/sys/fs/cgroup/devs/${sandboxId}`.
  - Call `fs.mkdir(cgroupPath, { recursive: true })`.
  - Write CPU quota: `cpu.max` = `"${config.cpuCores * 100000} 100000"` (period 100ms).
  - Write memory limit: `memory.max` = `String(config.memoryGb * 1024 ** 3)`.
  - Write memory swap limit: `memory.swap.max` = `"0"` (disable swap).
- [ ] Implement `static async attachPid(sandboxId: string, pid: number): Promise<void>`:
  - Write `String(pid)` to `/sys/fs/cgroup/devs/${sandboxId}/cgroup.procs`.
- [ ] Implement `static async release(sandboxId: string): Promise<void>`:
  - Write `"1"` to `/sys/fs/cgroup/devs/${sandboxId}/cgroup.kill` (terminates all remaining processes).
  - Wait 100ms, then call `fs.rmdir` on the cgroup path.
  - Swallow `ENOENT` errors (idempotent).
- [ ] Detect if cgroup v2 is available at module load via checking `/sys/fs/cgroup/cgroup.controllers`; if absent (macOS dev environment), log a warning and no-op all operations.
- [ ] Export `QuotaConfig` type and `DEFAULT_QUOTA: QuotaConfig = { cpuCores: 2, memoryGb: 4 }`.
- [ ] Add JSDoc with requirement tag: `// [9_ROADMAP-TAS-207] [5_SECURITY_DESIGN-REQ-SEC-STR-005] [8_RISKS-REQ-009]`.

## 3. Code Review
- [ ] Verify all file system writes use `fs/promises` (never sync variants) to prevent event-loop blocking.
- [ ] Confirm the cgroup path is constructed from `sandboxId` only after sanitizing it (reject any path that contains `..` or `/`); throw `Error("Invalid sandboxId")` otherwise.
- [ ] Ensure the class has no mutable module-level state (purely static methods or a minimal instance).
- [ ] Confirm the no-op fallback on non-Linux hosts is clearly documented with a `// PLATFORM_FALLBACK` comment.
- [ ] Verify memory swap is disabled (`memory.swap.max = 0`) to prevent memory limit bypass via swap.
- [ ] Check that `release()` uses `cgroup.kill` before `rmdir` to avoid orphan processes.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/sandbox/__tests__/CgroupQuotaManager.test.ts --coverage` and confirm 100% line coverage, all tests GREEN.
- [ ] Run `CGROUP_INTEGRATION=1 npx jest src/sandbox/__tests__/CgroupQuotaManager.test.ts --testNamePattern=quota_manager_integration` on a Linux host (CI environment) and confirm the test passes.
- [ ] Run the full test suite `npx jest --passWithNoTests` to confirm no regressions.

## 5. Update Documentation
- [ ] Update `src/sandbox/sandbox.agent.md` (create if absent) with a section "## Cgroup v2 Quota Manager" describing: quota defaults (2 vCPUs, 4GB RAM, swap disabled), the cgroup path convention `/sys/fs/cgroup/devs/<sandboxId>/`, and the platform fallback behavior.
- [ ] Add an entry to `docs/security.md` under "Resource Isolation" referencing `CgroupQuotaManager` and its enforcement of requirements `9_ROADMAP-TAS-207`, `5_SECURITY_DESIGN-REQ-SEC-STR-005`, `8_RISKS-REQ-009`.
- [ ] Add `CgroupQuotaManager` to `src/sandbox/index.ts` exports.

## 6. Automated Verification
- [ ] Run `npx jest src/sandbox/__tests__/CgroupQuotaManager.test.ts --json --outputFile=test-results/cgroup-quota.json` and verify the output file exists with `numFailedTests: 0`.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.
- [ ] On a Linux CI runner: execute `CGROUP_INTEGRATION=1 npx jest src/sandbox/__tests__/CgroupQuotaManager.test.ts` and assert exit code `0`.

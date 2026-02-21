# Task: Instrument Sandbox Provisioning Latency Measurement (Sub-Epic: 28_Sandbox Provisioning and Entropy KPIs)

## Covered Requirements
- [1_PRD-REQ-MET-009], [9_ROADMAP-REQ-044]

## 1. Initial Test Written
- [ ] In `src/sandbox/__tests__/provisioning-latency.test.ts`, write unit tests for a `SandboxProvisioner` class:
  - `describe('SandboxProvisioner.provision()')`:
    - Test that `provision({ type: 'docker' })` resolves and records a `durationMs` value on the returned object.
    - Test that `provision({ type: 'webcontainer' })` resolves and records a `durationMs` value.
    - Test that a mock Docker provisioning path under 30,000ms is marked `status: 'ok'`.
    - Test that a mock Docker provisioning path over 30,000ms is marked `status: 'sla_breach'`.
    - Test that a mock WebContainer provisioning path under 10,000ms is marked `status: 'ok'`.
    - Test that a mock WebContainer provisioning path over 10,000ms is marked `status: 'sla_breach'`.
  - `describe('SandboxProvisioningKPI.record()')`:
    - Test that calling `record(result)` persists a row into the `sandbox_provisioning_kpis` SQLite table with columns: `id`, `sandbox_type`, `duration_ms`, `status`, `timestamp`.
    - Test that `getP95Latency(type)` returns the 95th-percentile value computed from the last 100 rows for the given `sandbox_type`.
- [ ] Write integration tests in `src/sandbox/__tests__/provisioning-latency.integration.test.ts`:
  - Spin up an in-memory SQLite database (using `better-sqlite3` with `:memory:`), apply the migration, insert 100 synthetic rows, and assert that `getP95Latency('docker')` returns the statistically correct value (±1ms tolerance).

## 2. Task Implementation
- [ ] Create `src/sandbox/provisioning-latency.ts`:
  - Export `SandboxType = 'docker' | 'webcontainer'`.
  - Export interface `ProvisionResult { sandboxType: SandboxType; durationMs: number; status: 'ok' | 'sla_breach'; timestamp: Date; }`.
  - Define `SLA_LIMITS: Record<SandboxType, number> = { docker: 30_000, webcontainer: 10_000 }`.
  - Implement `SandboxProvisioner` class with `async provision(opts: { type: SandboxType; bootstrapFn: () => Promise<void> }): Promise<ProvisionResult>`:
    - Record `start = performance.now()`.
    - Await `bootstrapFn()`.
    - Compute `durationMs = performance.now() - start`.
    - Derive `status` by comparing `durationMs` to `SLA_LIMITS[opts.type]`.
    - Return the `ProvisionResult`.
- [ ] Create `src/sandbox/provisioning-kpi.ts`:
  - Accept a `better-sqlite3` `Database` instance via constructor injection.
  - On construction, run `CREATE TABLE IF NOT EXISTS sandbox_provisioning_kpis (id TEXT PRIMARY KEY, sandbox_type TEXT NOT NULL, duration_ms REAL NOT NULL, status TEXT NOT NULL, timestamp TEXT NOT NULL)`.
  - Implement `record(result: ProvisionResult): void` — inserts a new row using `crypto.randomUUID()` for `id`.
  - Implement `getP95Latency(type: SandboxType): number` — queries the 100 most recent rows of the given type, sorts `duration_ms` ascending in JS, and returns the value at index `Math.floor(100 * 0.95) - 1` (or last index if fewer rows).
- [ ] Wire `SandboxProvisioner` and `SandboxProvisioningKPI` into the existing sandbox bootstrap entry point (e.g., `src/sandbox/bootstrap.ts`) so every sandbox spin-up is automatically measured and recorded.

## 3. Code Review
- [ ] Verify `SandboxProvisioner` never silently catches exceptions — any bootstrap failure must propagate after the latency record is written (with `status: 'sla_breach'`).
- [ ] Confirm `SandboxProvisioningKPI` uses a parameterised SQLite statement (not string interpolation) to prevent SQL injection.
- [ ] Ensure `performance.now()` is used (not `Date.now()`) for high-resolution timing.
- [ ] Confirm `SLA_LIMITS` constant is exported and referenced in tests (single source of truth).
- [ ] Verify the requirement tag `// [1_PRD-REQ-MET-009] [9_ROADMAP-REQ-044]` appears as a comment above the `SLA_LIMITS` constant and `provision()` method.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/sandbox/__tests__/provisioning-latency.test.ts` and confirm all unit tests pass.
- [ ] Run `pnpm test src/sandbox/__tests__/provisioning-latency.integration.test.ts` and confirm the P95 integration test passes.
- [ ] Run `pnpm tsc --noEmit` to confirm no TypeScript errors are introduced.

## 5. Update Documentation
- [ ] Create `src/sandbox/sandbox-provisioner.agent.md` documenting: purpose, SLA thresholds, the `ProvisionResult` interface, and how to query P95 latency from the KPI table.
- [ ] Update `docs/architecture/kpis.md` (create if absent) with a new section "Sandbox Provisioning Latency KPI" referencing the `sandbox_provisioning_kpis` table schema and SLA targets.
- [ ] Add an entry to the project's `CHANGELOG.md` under the current phase/version.

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/sandbox` and assert line coverage ≥ 90% for `provisioning-latency.ts` and `provisioning-kpi.ts`.
- [ ] Execute `node -e "const db = require('better-sqlite3')(':memory:'); require('./dist/sandbox/provisioning-kpi').SandboxProvisioningKPI; console.log('import ok')"` to verify the module compiles and imports cleanly.
- [ ] Confirm CI pipeline step `validate-all` exits 0 after the changes (run `pnpm run validate-all` or equivalent).

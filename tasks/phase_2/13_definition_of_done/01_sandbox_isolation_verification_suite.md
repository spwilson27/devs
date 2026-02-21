# Task: Sandbox Isolation Verification Suite (Sub-Epic: 13_Definition of Done)

## Covered Requirements
- [9_ROADMAP-DOD-P2], [9_ROADMAP-REQ-020]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/dod/sandbox-isolation.dod.test.ts`, write an integration test suite named `"[DoD-P2] Sandbox Isolation"`.
- [ ] Write a test `"should block 100% of unauthorized outbound TCP connections"`: spin up a `DockerDriver` sandbox, attempt connections to a non-whitelisted host (e.g., `8.8.8.8:80`, `evil.example.com:443`), and assert all attempts result in a `ECONNREFUSED` / `ETIMEDOUT` error and that no bytes are transmitted.
- [ ] Write a test `"should allow whitelisted outbound connections"`: attempt a connection from within the sandbox to a whitelisted registry host (e.g., `registry.npmjs.org:443`) and assert it succeeds (or at minimum, is not blocked by the egress proxy).
- [ ] Write a test `"should log every blocked egress attempt to the audit log"`: after attempting 5 different unauthorized connections, query the `state.sqlite` `agent_logs` table (or the egress proxy's own log store) and assert all 5 entries are present with fields: `timestamp`, `sandboxId`, `destinationHost`, `destinationPort`, `action: "BLOCKED"`.
- [ ] Write a test `"should persist blocked-egress count to state.sqlite dod_results table"`: after the isolation run completes, query `state.sqlite` and assert a row exists with `phase: "P2"`, `criterion: "SANDBOX_ISOLATION"`, `result: "PASS"`, `blockedCount >= 1`, `leakedCount: 0`.
- [ ] Ensure all tests start in a **RED** state (no implementation yet); confirm they fail with meaningful errors.

## 2. Task Implementation
- [ ] In `packages/sandbox/src/dod/sandbox-isolation-verifier.ts`, implement and export `class SandboxIsolationVerifier`.
  - Constructor accepts a `SandboxProvider` instance, a `DatabaseService` handle (pointing to `state.sqlite`), and an `EgressProxyClient`.
  - Method `runVerification(): Promise<SandboxIsolationResult>` that:
    1. Provisions a fresh ephemeral sandbox via `SandboxProvider.provision()`.
    2. Executes a pre-defined set of unauthorized outbound connection attempts (at minimum 5 distinct hosts/ports) inside the sandbox using the `FilesystemManager` exec interface.
    3. For each attempt, captures the outcome (blocked/allowed) from the `EgressProxyClient.getBlockLog(sandboxId)`.
    4. Calculates `blockedCount`, `leakedCount`, and `blockRate = blockedCount / totalAttempts`.
    5. Destroys the sandbox via `SandboxProvider.destroy()`.
    6. Persists result to `state.sqlite` table `dod_results` with columns `(phase TEXT, criterion TEXT, result TEXT, detail JSON, verified_at DATETIME)`.
    7. Returns `{ pass: blockRate === 1.0, blockedCount, leakedCount, blockRate }`.
- [ ] Create the `dod_results` table migration in `packages/core/src/db/migrations/` if it does not already exist. Include columns: `id INTEGER PRIMARY KEY`, `phase TEXT NOT NULL`, `criterion TEXT NOT NULL`, `result TEXT CHECK(result IN ('PASS','FAIL'))`, `detail TEXT`, `verified_at DATETIME DEFAULT CURRENT_TIMESTAMP`.
- [ ] Register `SandboxIsolationVerifier` in the Phase 2 DoD runner (to be wired in task `05`).

## 3. Code Review
- [ ] Verify `SandboxIsolationVerifier` does not hold any sandbox reference longer than needed; sandbox must be destroyed in a `finally` block.
- [ ] Verify blocked-egress detection relies on the `EgressProxyClient`, not on in-process mocks, to ensure the production egress path is exercised.
- [ ] Verify the `dod_results` write uses a database transaction so a partial result cannot be persisted.
- [ ] Verify no test uses `jest.mock` / `vi.mock` for the egress proxy or Docker runtime in the integration test suite — real containers must be used.
- [ ] Confirm `blockRate === 1.0` is a strict equality check (not `>= 0.99`) so that a single leaked packet causes a `FAIL`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test:integration -- --testPathPattern=dod/sandbox-isolation` and confirm all tests in the suite pass (GREEN).
- [ ] Confirm the test output reports `blockedCount >= 5` and `leakedCount === 0`.
- [ ] Confirm a `PASS` row is inserted into `state.sqlite` `dod_results` table by querying: `sqlite3 .devs/state.sqlite "SELECT * FROM dod_results WHERE phase='P2' AND criterion='SANDBOX_ISOLATION';"`.

## 5. Update Documentation
- [ ] In `packages/sandbox/.agent.md`, add a section `## DoD Verification` describing `SandboxIsolationVerifier`, its inputs/outputs, and the criterion it validates (`SANDBOX_ISOLATION`).
- [ ] Update `docs/phase_2_dod.md` (create if absent) with a table row: `| P2 | SANDBOX_ISOLATION | 100% blocked egress | SandboxIsolationVerifier | state.sqlite:dod_results |`.
- [ ] Commit the migration file alongside the verifier so schema changes are traceable.

## 6. Automated Verification
- [ ] Run the script `scripts/verify-dod.sh P2 SANDBOX_ISOLATION` (create this script if absent): it must query `state.sqlite` for `phase='P2' AND criterion='SANDBOX_ISOLATION' AND result='PASS'` and exit `0` on success, `1` on failure.
- [ ] This script is the canonical gate used by CI to block a Phase 3 start if this criterion is unmet.
- [ ] Confirm the CI pipeline (`.github/workflows/phase2-dod.yml` or equivalent) invokes this script as a required status check.

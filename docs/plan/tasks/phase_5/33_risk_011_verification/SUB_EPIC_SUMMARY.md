# Sub-Epic 33_Risk 011 Verification: Task Summary

## Requirement Coverage Matrix

| Requirement ID | Task File(s) | Status |
|----------------|--------------|--------|
| RISK-011-BR-002 | `01_server_handle_shutdown.md` | ✅ Covered |
| RISK-011-BR-003 | `02_e2e_test_config.md` | ✅ Covered |
| RISK-011-BR-004 | `02_e2e_test_config.md`, `03_discovery_file_lint.md` | ✅ Covered |
| MIT-011 | All 4 tasks | ✅ Covered |
| AC-RISK-011-01 | `04_verify_e2e_isolation_stress_test.md` | ✅ Covered |

## Task Execution Order

```
01_server_handle_shutdown.md (RISK-011-BR-002, MIT-011)
         │
         ▼
02_e2e_test_config.md (RISK-011-BR-003, RISK-011-BR-004, MIT-011)
         │
         ├──────────────┐
         ▼              ▼
03_discovery_file_lint.md    04_verify_e2e_isolation_stress_test.md
(RISK-011-BR-004, MIT-011)   (AC-RISK-011-01, MIT-011)
                             ^ Requires: 01, 02, 03
```

## Task Descriptions

### Task 01: ServerHandle Safe Shutdown Implementation
**File:** `docs/plan/tasks/phase_5/33_risk_011_verification/01_server_handle_shutdown.md`

**Purpose:** Implement graceful server process termination in test helpers to prevent port conflicts.

**Key Implementation Details:**
- `ServerHandle::drop()` sends SIGTERM to server process
- Waits up to 10 seconds for clean exit
- Sends SIGKILL if process still alive after timeout
- Blocks until process has definitely exited

**Verification:**
- Unit test with dummy process (sleep 100)
- Integration test with SIGTERM-ignoring process
- Confirms process termination and port release

---

### Task 02: E2E Test Concurrency and Discovery Configuration
**File:** `docs/plan/tasks/phase_5/33_risk_011_verification/02_e2e_test_config.md`

**Purpose:** Configure test infrastructure to ensure each E2E test has isolated server discovery.

**Key Implementation Details:**
- Set `test-threads = 1` in `.cargo/config.toml` for E2E test targets
- Create unique `TempDir` per test via `tempfile::TempDir::new()`
- Generate unique `DEVS_DISCOVERY_FILE` path inside each `TempDir`
- Store `TempDir` handle in `ServerHandle` for cleanup on drop

**Verification:**
- Assert `DEVS_DISCOVERY_FILE` is set and unique per test
- Verify path is inside test-specific `TempDir`
- Confirm no `EADDRINUSE` errors during test execution

---

### Task 03: Discovery File Path Lint
**File:** `docs/plan/tasks/phase_5/33_risk_011_verification/03_discovery_file_lint.md`

**Purpose:** Add automated lint check to prevent hardcoded discovery paths.

**Key Implementation Details:**
- Regex search across `tests/**/*.rs` for hardcoded paths
- Pattern: `/tmp/devs-test.addr` or similar hardcoded paths
- Integrated into `./do lint` workflow
- Fails CI if prohibited patterns detected

**Verification:**
- Create `violation.rs` with hardcoded path
- Run `./do lint` and confirm non-zero exit
- Verify error message references `RISK-011-BR-004`

---

### Task 04: E2E Isolation Stress Test
**File:** `docs/plan/tasks/phase_5/33_risk_011_verification/04_verify_e2e_isolation_stress_test.md`

**Purpose:** Validate E2E isolation under sustained sequential execution.

**Key Implementation Details:**
- Shell script `scripts/verify_isolation_stress.sh`
- Runs 100 sequential E2E tests with `--test-threads 1`
- Monitors for `EADDRINUSE` errors in output
- Verifies successful port binding on each server start

**Verification:**
- Script completes 100 iterations with exit code 0
- No `EADDRINUSE` errors in any run
- All server startup logs show successful port binding

---

## Shared Component Usage

### Consumers
This sub-epic **consumes** (does not own) these shared components:

1. **devs-grpc**
   - Provides `ServerHandle` struct
   - Provides test utilities (`start_server`, `TestServerConfig`)
   - Used by: All 4 tasks

2. **./do Entrypoint Script & CI Pipeline**
   - Provides `./do lint` infrastructure
   - Provides `./do test` infrastructure
   - Used by: Tasks 03, 04

### Owners
This sub-epic does **not own** any shared components from the SHARED COMPONENTS manifest. All implementation work is contained within test utilities and verification scripts.

---

## Requirement Specifications

### RISK-011-BR-002
> `ServerHandle::drop()` MUST send SIGTERM to the server process and wait up to 10 seconds for a clean exit before sending SIGKILL. It MUST NOT return until the process has exited.

**Rationale:** Ensures port release before next test begins, preventing `EADDRINUSE` errors.

---

### RISK-011-BR-003
> E2E test binaries that require a running server MUST set `test-threads = 1` in `.cargo/config.toml` for their test target.

**Rationale:** Prevents non-deterministic `EADDRINUSE` failures from concurrent test execution.

---

### RISK-011-BR-004
> The `DEVS_DISCOVERY_FILE` environment variable for each test server MUST be unique and within the test's `TempDir`. Using a hardcoded path is prohibited.

**Rationale:** Prevents tests from reading stale discovery files from previous test runs.

---

### MIT-011
> Mitigation implementation for RISK-011 (E2E test isolation failures).

**Implementation:** Combination of:
- Safe server shutdown (Task 01)
- Unique discovery paths (Task 02)
- Lint enforcement (Task 03)
- Stress verification (Task 04)

---

### AC-RISK-011-01
> 100 E2E tests run sequentially (`--test-threads 1`) without any `EADDRINUSE` errors or stale discovery file reads, verified by checking server startup logs for successful port binding.

**Acceptance Criteria:**
- 100 sequential test runs
- Zero `EADDRINUSE` errors
- Zero stale discovery file reads
- All server startups log successful port binding

---

## Traceability

All tasks follow the mandatory TDD format:
1. **Initial Test Written** - Failing test first
2. **Task Implementation** - Code to make tests pass
3. **Code Review** - Self-verification checklist
4. **Run Automated Tests** - Execute test suite
5. **Update Documentation** - Keep docs current
6. **Automated Verification** - Script-based confirmation

Each task includes `// Covers: REQ-ID` annotations in test code for traceability reporting via `target/traceability.json`.

---

## Related Sub-Epics

- **32_risk_010_verification**: Covers [RISK-011] parent risk and [RISK-011-BR-001] (helper function enforcement)
- **34_risk_011_verification**: Covers [AC-RISK-011-02], [AC-RISK-011-03], [AC-RISK-011-04] (type-level enforcement and API design)

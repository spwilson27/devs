# Sub-Epic: 33_Risk 011 Verification

## Overview
This sub-epic addresses **RISK-011**: E2E test isolation failures from shared server discovery files. The risk manifests when multiple E2E tests share the same server discovery file path, causing port conflicts (`EADDRINUSE`), stale discovery file reads, and non-deterministic test failures in CI.

## Covered Requirements
All requirements in this sub-epic are verified through automated tests and lint checks:

| Requirement ID | Type | Description | Covered By Task |
|----------------|------|-------------|-----------------|
| [RISK-011-BR-002] | Functional | `ServerHandle::drop()` MUST send SIGTERM, wait 10s, then SIGKILL | `01_server_handle_shutdown.md` |
| [RISK-011-BR-003] | Functional | E2E tests MUST set `test-threads = 1` in `.cargo/config.toml` | `02_e2e_test_config.md` |
| [RISK-011-BR-004] | Functional | `DEVS_DISCOVERY_FILE` MUST be unique per-test within `TempDir` | `02_e2e_test_config.md`, `03_discovery_file_lint.md` |
| [MIT-011] | Technical | Mitigation implementation for RISK-011 | All tasks |
| [AC-RISK-011-01] | Technical | 100 E2E tests run sequentially without `EADDRINUSE` errors | `04_verify_e2e_isolation_stress_test.md` |

## Task Breakdown

### Task 01: ServerHandle Safe Shutdown Implementation
**File:** `01_server_handle_shutdown.md`

Implements graceful server process termination in test helpers:
- SIGTERM → 10s wait → SIGKILL sequence
- Ensures port release before next test begins
- Prevents `EADDRINUSE` errors from lingering server processes

### Task 02: E2E Test Concurrency and Discovery Configuration
**File:** `02_e2e_test_config.md`

Configures test infrastructure for isolation:
- Sets `test-threads = 1` for E2E test targets
- Creates unique `TempDir` per test invocation
- Generates unique `DEVS_DISCOVERY_FILE` paths within each `TempDir`

### Task 03: Discovery File Path Lint
**File:** `03_discovery_file_lint.md`

Adds automated lint check to prevent regression:
- Scans `tests/**/*.rs` for hardcoded discovery paths
- Fails `./do lint` if prohibited patterns detected
- Enforces `RISK-011-BR-004` at CI level

### Task 04: E2E Isolation Stress Test
**File:** `04_verify_e2e_isolation_stress_test.md`

Validates isolation under sustained load:
- Runs 100 sequential E2E tests
- Verifies zero `EADDRINUSE` errors
- Confirms successful port binding on each server start

## Shared Components

### Consumers
This sub-epic **consumes** the following shared components:
- **devs-grpc**: Provides `ServerHandle` and test utilities
- **./do Entrypoint Script**: Provides lint and test infrastructure

### Owners
This sub-epic does **not own** any shared components from the SHARED COMPONENTS manifest.

## Dependencies
- **Internal:** Tasks 02, 03, and 04 depend on Task 01's `ServerHandle` implementation
- **External:** Requires `devs-grpc` crate with test utilities

## Verification Strategy
1. **Unit Tests:** Verify `ServerHandle::drop()` behavior with dummy processes
2. **Integration Tests:** Verify unique discovery file paths per test
3. **Lint Checks:** Automated detection of hardcoded paths in test code
4. **Stress Test:** 100 sequential runs without port conflicts

## Success Criteria
- [ ] All 5 requirements have `// Covers:` annotations in test code
- [ ] `./do lint` passes with no hardcoded discovery paths
- [ ] `./do test` passes with zero `EADDRINUSE` errors
- [ ] Stress test completes 100 iterations successfully
- [ ] `target/traceability.json` shows 100% coverage for RISK-011 requirements

## Related Sub-Epics
- **32_risk_010_verification**: Covers [RISK-011] and [RISK-011-BR-001] (helper function enforcement)
- **34_risk_011_verification**: Covers [AC-RISK-011-02], [AC-RISK-011-03], [AC-RISK-011-04] (type-level enforcement)

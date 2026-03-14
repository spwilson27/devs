# Sub-Epic 29_MIT-009: Bootstrap Phase Completion Verification

## Overview
This sub-epic completes the mitigation of **RISK-009** (Bootstrapping deadlock) by verifying that `devs` can successfully develop itself using its own workflow system. All tasks in this sub-epic follow Test-Driven Development (TDD) discipline.

## Requirements Covered
| Requirement ID | Description | Task |
|----------------|-------------|------|
| [MIT-009] | Primary mitigation: self-hosting verification | `05_execute_self_hosting_milestone.md` |
| [AC-RISK-009-01] | `devs submit presubmit-check` completes successfully | `03_implement_presubmit_e2e_test.md` |
| [AC-RISK-009-02] | All 6 standard workflow TOML files are valid | `01_verify_workflow_definitions.md` |
| [AC-RISK-009-03] | `./do presubmit` passes on Linux for all bootstrap crates | `04_verify_presubmit_passes_on_linux.md` |
| [AC-RISK-009-04] | No `// TODO: BOOTSTRAP-STUB` comments remain | `02_enforce_no_bootstrap_stubs.md` |

## Task Execution Order
Tasks must be executed in the following order due to dependencies:

```
01_verify_workflow_definitions.md
         │
         ▼
02_enforce_no_bootstrap_stubs.md
         │
         ▼
03_implement_presubmit_e2e_test.md
         │
         ▼
04_verify_presubmit_passes_on_linux.md
         │
         ▼
05_execute_self_hosting_milestone.md (Bootstrap Phase Complete)
```

## Task Summaries

### Task 01: Verify Standard Workflow Definitions
**File:** `01_verify_workflow_definitions.md`

Verifies that all 6 standard workflow TOML files exist and are valid:
- `tdd-red.toml`
- `tdd-green.toml`
- `presubmit-check.toml`
- `build-only.toml`
- `unit-test-crate.toml`
- `e2e-all.toml`

**Covers:** [AC-RISK-009-02]

**Shared Components:** devs-config (Consumer), devs-cli (Consumer)

---

### Task 02: Enforce No Bootstrap Stubs
**File:** `02_enforce_no_bootstrap_stubs.md`

Implements lint enforcement that fails if any `// TODO: BOOTSTRAP-STUB` comments remain in the codebase, and removes all existing stubs.

**Covers:** [AC-RISK-009-04]

**Shared Components:** ./do Entrypoint Script (Owner)

---

### Task 03: Implement presubmit E2E Test
**File:** `03_implement_presubmit_e2e_test.md`

Creates an end-to-end test that submits the `presubmit-check` workflow via `devs-cli` and verifies it completes with all stages in `Completed` status.

**Covers:** [AC-RISK-009-01]

**Shared Components:** devs-cli (Consumer), devs-server (Consumer), devs-grpc (Consumer), devs-scheduler (Consumer)

**Dependencies:** Task 01

---

### Task 04: Verify presubmit Passes on Linux
**File:** `04_verify_presubmit_passes_on_linux.md`

Ensures `./do presubmit` passes for all crates completed during Bootstrap Phase, with a CI verification script.

**Covers:** [AC-RISK-009-03]

**Shared Components:** ./do Entrypoint Script (Owner), devs-core (Consumer), devs-config (Consumer), devs-checkpoint (Consumer), devs-adapters (Consumer), devs-pool (Consumer), devs-executor (Consumer)

**Dependencies:** Task 01, Task 02

---

### Task 05: Execute Self-Hosting Milestone
**File:** `05_execute_self_hosting_milestone.md`

The culminating task: executes a full self-hosting attempt and documents the Bootstrap Phase completion with an ADR.

**Covers:** [MIT-009]

**Shared Components:** devs-server (Owner), devs-cli (Owner), devs-grpc (Owner), devs-scheduler (Owner), devs-checkpoint (Owner), ./do Entrypoint Script (Owner)

**Dependencies:** Task 01, Task 02, Task 03, Task 04

---

## Completion Criteria
This sub-epic is complete when:
1. All 5 tasks are marked complete.
2. `./do test` shows 100% traceability for all requirements in this sub-epic.
3. `./do lint` exits 0 (no BOOTSTRAP-STUB comments).
4. `./do presubmit` exits 0 on Linux.
5. `docs/adr/0010-bootstrap-complete.md` is committed with evidence.
6. `target/traceability.json` shows all requirements covered.

## Related Sub-Epics
- **30_risk_009_verification:** Covers [AC-RISK-009-05] (Bootstrap completion ADR documentation)
- **28_Risk 009 Verification:** Covers RISK-009 business rules (RISK-009-BR-001 through RISK-009-BR-006)

## Evidence Artifacts
Upon completion, the following artifacts should exist:
- `tests/e2e/presubmit_milestone_test.rs` - E2E test for AC-RISK-009-01
- `crates/devs-config/tests/workflow_validation_test.rs` - Integration test for AC-RISK-009-02
- `tests/ci/verify_bootstrap_presubmit.sh` - CI script for AC-RISK-009-03
- `tests/scripts/test_bootstrap_stub_detection.sh` - Lint test for AC-RISK-009-04
- `docs/adr/0010-bootstrap-complete.md` - Bootstrap completion ADR
- `target/traceability.json` - Requirement traceability report

# Requirement Traceability Matrix: Sub-Epic 07_Agent Diagnostic Behaviors

## Requirement Coverage Summary

| Requirement ID | Covered By Tasks | Coverage Status |
|----------------|------------------|-----------------|
| [3_MCP_DESIGN-REQ-027] | Task 01, Task 04 | ✅ Fully Covered |
| [3_MCP_DESIGN-REQ-028] | Task 02, Task 05 | ✅ Fully Covered |
| [3_MCP_DESIGN-REQ-029] | Task 03, Task 06 | ✅ Fully Covered |
| [3_MCP_DESIGN-REQ-030] | Task 03, Task 07 | ✅ Fully Covered |
| [3_MCP_DESIGN-REQ-BR-004] | Task 01, Task 08 | ✅ Fully Covered |

## Detailed Requirement-to-Task Mapping

### [3_MCP_DESIGN-REQ-027] - Filesystem MCP Usage
**Requirement:** An agent MUST use the filesystem MCP server (not shell execution) to read source files, write edits, and verify file existence. Shell execution is reserved for `./do` commands submitted as workflow stages.

**Covered By:**
- **Task 01** (Diagnostic Investigation Sequence): Uses filesystem MCP for reading checkpoint files and workflow snapshots. Section 2, Step 4 implements checkpoint history retrieval via MCP.
- **Task 04** (Filesystem MCP Enforcement): Primary implementation task. Implements:
  - Filesystem MCP server wrapper with `read_file`, `write_file`, `file_exists`, `list_directory`, `search_files`, `search_content`
  - Workspace root scoping and `target/` directory write protection
  - Shell execution guard that warns against using shell for source file operations
  - Path validation utilities

**Tests:**
- `crates/devs-mcp/tests/filesystem_enforcement_tests.rs` - 5 test cases verifying filesystem MCP usage vs shell execution

---

### [3_MCP_DESIGN-REQ-028] - Test Annotation Requirement
**Requirement:** Every test MUST be annotated `// Covers: <REQ-ID>` before the Red stage. An agent MUST NOT proceed to the Green stage if `./do test` produces a traceability failure for the target requirement.

**Covered By:**
- **Task 02** (In-Flight Run Recovery): Includes traceability annotation check as part of session recovery. Verifies test files have valid `// Covers:` annotations after recovering a run.
- **Task 05** (Test Annotation Enforcement): Primary implementation task. Implements:
  - Annotation parser extracting `// Covers: REQ-ID` from test source
  - Requirement ID validator checking against spec documents
  - Traceability JSON generator producing `target/traceability.json`
  - TDD workflow guard blocking Green stage on traceability failure

**Tests:**
- `crates/devs-cli/tests/annotation_enforcement_tests.rs` - 5 test cases covering valid annotations, missing annotations, invalid IDs, multiple annotations, and Green stage blocking

---

### [3_MCP_DESIGN-REQ-029] - Test Failure Verification
**Requirement:** An agent MUST verify the test is genuinely failing (exit code 1 from `cargo test`) before writing implementation. A test that passes without implementation is a defective test; the agent MUST fix it before proceeding.

**Covered By:**
- **Task 03** (Failure Classification): Includes logic to verify test is genuinely failing before allowing implementation. Detects false-positive tests.
- **Task 06** (Test Failure Verification): Primary implementation task. Implements:
  - Test failure verifier running test and validating outcome
  - Exit code parser mapping cargo test exit codes to outcomes
  - Defective test detector identifying false positives
  - File modification tracking to verify no implementation written after false positive
  - TDD workflow state machine with Red stage validation

**Tests:**
- `crates/devs-cli/tests/test_failure_verification_tests.rs` - 5 test cases covering genuine failure, false positive, compile error, exit code parsing, and defective test fix workflow

---

### [3_MCP_DESIGN-REQ-030] - Presubmit Enforcement
**Requirement:** An agent MUST run the full presubmit check (`submit_run: presubmit-check`) after every Green stage. Partial passes are not acceptable.

**Covered By:**
- **Task 03** (Failure Classification): Includes presubmit incomplete classifier detecting when not all presubmit stages completed.
- **Task 07** (Presubmit Enforcement): Primary implementation task. Implements:
  - Presubmit submitter calling MCP `submit_run` with `presubmit-check`
  - Completion waiter polling `get_run` until terminal status (500ms intervals)
  - Stage assertion runner calling `assert_stage_output` on every stage
  - Partial presubmit detector rejecting subset commands
  - TDD Green stage completion hook automatically triggering presubmit

**Tests:**
- `crates/devs-cli/tests/presubmit_enforcement_tests.rs` - 6 test cases covering presubmit submission, full wait, assertion calls, partial pass rejection, successful flow, and no partial presubmit

---

### [3_MCP_DESIGN-REQ-BR-004] - Non-Caching of MCP Address
**Requirement:** An agent MUST NOT cache the resolved MCP address across process restarts. On each new session start the agent MUST re-execute the discovery protocol. The server address may change if the server is restarted between sessions.

**Covered By:**
- **Task 01** (Diagnostic Investigation Sequence): Enforces non-caching by executing discovery protocol on each session start. Section 3 code review verifies no static/cached address storage.
- **Task 08** (MCP Address Discovery): Primary implementation task. Implements:
  - Discovery protocol client with NO cached address across sessions
  - Connection verifier performing health check on each connection
  - Session manager executing discovery on every new session
  - Discovery file reader with format validation
  - Atomic file writer for server-side discovery file writes
  - `DEVS_DISCOVERY_FILE` environment variable support for test isolation

**Tests:**
- `crates/devs-mcp/tests/discovery_protocol_tests.rs` - 6 test cases covering discovery file read, env var priority, no caching across restarts (core test), explicit flag override, stale file detection, and atomic write

---

## Test Coverage Summary

| Task | Test File | Test Count | Coverage Type |
|------|-----------|------------|---------------|
| 01 | `crates/devs-mcp/tests/diagnostic_sequence_tests.rs` | 4 | Integration |
| 02 | `crates/devs-cli/tests/run_recovery_tests.rs` | 7 | Integration |
| 03 | `crates/devs-cli/tests/failure_classification_tests.rs` | 8 | Integration |
| 04 | `crates/devs-mcp/tests/filesystem_enforcement_tests.rs` | 5 | Integration |
| 05 | `crates/devs-cli/tests/annotation_enforcement_tests.rs` | 5 | Integration |
| 06 | `crates/devs-cli/tests/test_failure_verification_tests.rs` | 5 | Integration |
| 07 | `crates/devs-cli/tests/presubmit_enforcement_tests.rs` | 6 | Integration |
| 08 | `crates/devs-mcp/tests/discovery_protocol_tests.rs` | 6 | Integration |

**Total Tests:** 46 integration tests across 3 test packages

---

## E2E Coverage Contribution

This sub-epic contributes to the following E2E coverage gates:

| Gate | Requirement | Contributing Tasks |
|------|-------------|-------------------|
| QG-003 (50% CLI E2E) | CLI interface coverage | Tasks 02, 03, 05, 06, 07, 08 |
| QG-001 (90% Unit) | Per-crate unit coverage | All 8 tasks |

**E2E Test Scenarios:**
1. Session restart with running run recovery (Task 02, 08)
2. TDD Red-Green workflow with annotation validation (Task 05, 06)
3. Presubmit submission and verification (Task 07)
4. Failure classification and fix workflow (Task 03)
5. Diagnostic sequence execution (Task 01)
6. Filesystem MCP operations (Task 04)

---

## Verification Checklist

- [x] All 5 requirements are covered by at least one task
- [x] Each task has detailed test instructions (Red stage)
- [x] Each task has detailed implementation instructions (Green stage)
- [x] Each task has code review checklist
- [x] Each task has automated verification steps
- [x] Each task has documentation update instructions
- [x] Traceability annotations are specified for all new tests
- [x] E2E coverage contribution is documented
- [x] Task dependencies are clearly defined
- [x] Shared component consumption is documented

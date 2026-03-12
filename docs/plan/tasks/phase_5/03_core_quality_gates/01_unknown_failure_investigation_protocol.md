# Task: Agent Unknown Failure Protocol Hardening (Sub-Epic: 03_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-DBG-BR-000]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create an E2E test in `tests/test_unknown_failure_handler.py` that mocks a stage failure that does not match any known classification pattern (Compilation, Test, Coverage, Clippy, Traceability, Rate limit, Timeout, Disk full).
- [ ] The test should verify that the agent's investigation protocol (simulated or via prompt instructions) results in:
  - Reading the full `stderr` of the failing stage.
  - Calling the `get_pool_state` MCP tool to rule out infrastructure causes.
  - Creating/appending a bug report comment to a file named `BUG_REPORTS.md` (as a placeholder for the issue tracker).

## 2. Task Implementation
- [ ] Update the agent's investigation logic (or its system prompt in `MEMORY.md` or a similar configuration) to explicitly include the "Unknown Failure" branch in the classification decision tree.
- [ ] Ensure the "Unknown Failure" logic is triggered when none of the standard regex patterns (error codes, FAILED markers, etc.) are found in `stdout`/`stderr`.
- [ ] Implement a helper script or tool that can be used by the agent to automate the collection of `stderr` and `pool_state` for bug reporting.
- [ ] Document the exact location of the "relevant issue tracker file" for the MVP release (e.g., `.devs/ISSUES.md`).

## 3. Code Review
- [ ] Verify that the classification logic is truly exhaustive for known types and that the catch-all "Unknown" branch is correctly positioned as the final fallback.
- [ ] Ensure the protocol requires reading *full* `stderr` to avoid missing context.
- [ ] Verify that `get_pool_state` is actually called before any speculative code changes are allowed.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_unknown_failure_handler.py` and ensure it passes.
- [ ] Verify that a simulated unknown failure results in the expected `BUG_REPORTS.md` entry and `get_pool_state` call in the logs.

## 5. Update Documentation
- [ ] Update `MEMORY.md` with the finalized investigation protocol and the "Unknown Failure" response strategy.
- [ ] Ensure the protocol is clearly visible to any agent working on the project.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the new E2E test is included and passing.
- [ ] Use `grep` to confirm that `3_MCP_DESIGN-REQ-DBG-BR-000` is now covered in the test source.

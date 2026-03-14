# Task: Task Persistence: Atomic State Write Resilience Verification (Sub-Epic: 06_MCP Logging & Stage Output)

## Covered Requirements
- [3_MCP_DESIGN-REQ-AC-5.10]

## Dependencies
- depends_on: []
- shared_components: [devs-core, devs-server]

## 1. Initial Test Written
- [ ] Create a "Crash Test" in `tests/crash_resilience_test.rs` that simulates an interruption during the writing of `task_state.json`.
- [ ] The test MUST:
  - Mock the writing process (or spawn a subprocess) that writes to `task_state.json.tmp` and then calls `rename`.
  - Simulate an interruption (e.g., by sending `SIGKILL` to the writing process or using an `AtomicWrite` mock that crashes halfway) AFTER the `.tmp` file is written but BEFORE the `rename` completes.
  - Verify that the original `task_state.json` exists and is still a valid JSON object representing the state *before* the failed write.
  - Assert that a subsequent `cat task_state.json` (or read) does not result in a parse error or truncated data.

## 2. Task Implementation
- [ ] Implement or verify the atomic write pattern for `task_state.json` (if not already verified in Phase 1):
  - Always write to a temporary file (`.tmp`) in the same filesystem.
  - Flush to disk (fsync) the temporary file.
  - Use `std::fs::rename` (or equivalent) for an atomic update of the target file.
- [ ] Ensure the server's state management logic (e.g., in `devs-server`) uses this `AtomicFileWrite` utility.
- [ ] Implement a cleanup protocol that removes any orphaned `.tmp` files upon server startup.

## 3. Code Review
- [ ] Verify that the write operation is truly atomic at the filesystem level (using `rename` on the same partition).
- [ ] Ensure that a corrupted `.tmp` file is NEVER renamed to the target file.
- [ ] Validate that the previous state is preserved if the process crashes mid-write (REQ-AC-5.10).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test crash_resilience_test`.
- [ ] Confirm that the state remains valid even after simulated power-loss or interruption.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/2_tas.md` or `3_mcp_design.md` with the "Atomic Write and Crash Safety" protocol.
- [ ] Document the persistence invariants in the AI agent's memory.

## 6. Automated Verification
- [ ] Run `./do test` to verify traceability for [3_MCP_DESIGN-REQ-AC-5.10].

# Task: Cross-Session Recovery and Merge (Sub-Epic: 02_MCP Escalation & Connection Recovery)

## Covered Requirements
- [3_MCP_DESIGN-REQ-053]

## Dependencies
- depends_on: [02_task_state_persistence.md]
- shared_components: [devs-core, devs-checkpoint, devs-mcp]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-core/tests/recovery_merge.rs` that simulates a session restart.
- [ ] The test should:
    - [ ] Seed `.devs/agent-state/` with two different `task_state.json` files from previous sessions.
    - [ ] File A: `completed_requirements: ["REQ-001", "REQ-002"]`.
    - [ ] File B: `completed_requirements: ["REQ-002", "REQ-003"]`.
    - [ ] Mock a `target/traceability.json` that shows `REQ-001` and `REQ-002` as covered, but `REQ-003` as UNCOVERED.
    - [ ] Assert that when the agent starts and runs its recovery logic, the merged set of "truly completed" requirements is `["REQ-001", "REQ-002"]`.
    - [ ] Verify that `REQ-003` is treated as NOT complete because it lacks traceability coverage, even though it was in a session file.
    - [ ] Verify that any requirement NOT in any session file but present in traceability is also treated as NOT complete (implementation verification invariant).

## 2. Task Implementation
- [ ] Implement the `recover_session_state` function in `crates/devs-core/src/agent/recovery.rs`.
- [ ] The function MUST:
    - [ ] List all directories under `.devs/agent-state/` using the filesystem MCP.
    - [ ] For each directory, read `task_state.json`.
    - [ ] Skip and log an error for any malformed or unparseable JSON files (do not crash the agent).
    - [ ] Aggregate all `completed_requirements` into a unique set.
    - [ ] Read `target/traceability.json` (if present).
    - [ ] Implement the merge algorithm:
        - A requirement is "Complete" ONLY IF it exists in at least one session file's `completed_requirements` list AND it is marked as `covered: true` in `traceability.json`.
    - [ ] Log the list of recovered requirements and the list of requirements that were rejected due to missing traceability.
- [ ] Ensure the agent's initialization phase calls this function before selecting the next requirement to work on.

## 3. Code Review
- [ ] Verify that the merge logic correctly handles the "stale session file" vs "accurate traceability" trade-off per REQ-053.
- [ ] Ensure that the file listing and reading are done efficiently (e.g., using a reasonable concurrency limit if many session files exist).
- [ ] Check that the agent handles the case where `target/traceability.json` is missing (e.g., first run) by treating all as incomplete.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test recovery_merge` and ensure all merge scenarios pass.

## 5. Update Documentation
- [ ] Add a section to `docs/plan/summaries/3_mcp_design.md` explaining the recovery merge algorithm.

## 6. Automated Verification
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-053" crates/devs-core/` to verify traceability.

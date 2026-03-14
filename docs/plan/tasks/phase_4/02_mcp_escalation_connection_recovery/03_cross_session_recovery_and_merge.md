# Task: Cross-Session Recovery and Merge (Sub-Epic: 02_MCP Escalation & Connection Recovery)

## Covered Requirements
- [3_MCP_DESIGN-REQ-053]
- [3_MCP_DESIGN-REQ-NEW-033]

## Dependencies
- depends_on: ["02_task_state_persistence.md"]
- shared_components: [devs-core (TaskState, TraceabilityReport), devs-checkpoint (agent-state directory), devs-mcp (filesystem MCP tools)]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-core/tests/recovery_merge.rs` that simulates a session restart with merge logic.
- [ ] The tests MUST verify the following scenarios:
    - [ ] **Scenario 1: Merge multiple session files with traceability**
        - [ ] Seed `.devs/agent-state/` with two session directories:
            - `.devs/agent-state/session-a/task_state.json`:
                - `completed_requirements: ["2_TAS-REQ-001", "2_TAS-REQ-002"]`
            - `.devs/agent-state/session-b/task_state.json`:
                - `completed_requirements: ["2_TAS-REQ-002", "2_TAS-REQ-003"]`
        - [ ] Mock `target/traceability.json` with:
            ```json
            {
              "traceability_pct": 66.7,
              "requirements": {
                "2_TAS-REQ-001": {"covered": true},
                "2_TAS-REQ-002": {"covered": true},
                "2_TAS-REQ-003": {"covered": false}
              }
            }
            ```
        - [ ] Call `recover_session_state(mcp_client)`.
        - [ ] Assert that the merged `completed_requirements` is `["2_TAS-REQ-001", "2_TAS-REQ-002"]` (NOT including `2_TAS-REQ-003`).
        - [ ] Assert that `2_TAS-REQ-003` is logged as rejected: `"Rejected 2_TAS-REQ-003: not covered in traceability"`.
        - [ ] Assert that the union of session file requirements is `["2_TAS-REQ-001", "2_TAS-REQ-002", "2_TAS-REQ-003"]` before filtering.
    - [ ] **Scenario 2: Missing traceability.json (first run)**
        - [ ] Seed `.devs/agent-state/` with one session file containing `completed_requirements: ["2_TAS-REQ-001"]`.
        - [ ] Mock filesystem MCP to return `FileNotFound` for `target/traceability.json`.
        - [ ] Assert that the agent treats ALL requirements as incomplete (empty completed set).
        - [ ] Assert that a warning is logged: `"WARN: target/traceability.json missing, treating all requirements as incomplete"`.
    - [ ] **Scenario 3: Malformed session file**
        - [ ] Seed `.devs/agent-state/` with:
            - `session-a/task_state.json`: valid JSON with `completed_requirements: ["2_TAS-REQ-001"]`.
            - `session-b/task_state.json`: invalid JSON syntax (e.g., missing closing brace).
        - [ ] Mock `target/traceability.json` showing both requirements as covered.
        - [ ] Assert that `session-b`'s file is skipped with `ERROR: malformed task_state.json in session-b`.
        - [ ] Assert that `session-a`'s requirements are still recovered.
        - [ ] Assert that the agent does NOT crash on malformed input.
    - [ ] **Scenario 4: Empty agent-state directory**
        - [ ] Mock `.devs/agent-state/` as an empty directory (no session subdirectories).
        - [ ] Assert that `recover_session_state` returns an empty `completed_requirements` set.
        - [ ] Assert that no errors are logged (empty is a valid state).
    - [ ] **Scenario 5: Session file with stale data**
        - [ ] Seed `.devs/agent-state/` with a session file claiming `completed_requirements: ["2_TAS-REQ-999"]`.
        - [ ] Mock `target/traceability.json` showing `2_TAS-REQ-999` does not exist (not in requirements map).
        - [ ] Assert that `2_TAS-REQ-999` is rejected as not in traceability.
        - [ ] Assert that the agent logs: `"Rejected 2_TAS-REQ-999: not found in traceability"`.

## 2. Task Implementation
- [ ] Define the `RecoveryResult` struct in `crates/devs-core/src/agent/recovery.rs`:
    ```rust
    pub struct RecoveryResult {
        pub completed_requirements: BTreeSet<String>,  // Sorted for determinism
        pub rejected_requirements: BTreeMap<String, String>,  // req_id -> rejection reason
        pub in_progress: Vec<InProgressTask>,
        pub blocked: Vec<BlockedTask>,
    }
    ```
- [ ] Implement the `recover_session_state` function:
    ```rust
    pub async fn recover_session_state(
        mcp_client: &dyn McpClient,
    ) -> Result<RecoveryResult, RecoveryError>
    ```
- [ ] The function MUST:
    - [ ] List all directories under `.devs/agent-state/` using filesystem MCP `list_dir`.
        - [ ] Handle the case where `.devs/agent-state/` does not exist (return empty result, no error).
    - [ ] For each subdirectory (session directory):
        - [ ] Construct path: `.devs/agent-state/<session-id>/task_state.json`.
        - [ ] Call filesystem MCP `read_file` to retrieve content.
        - [ ] Parse JSON into `TaskState`:
            - [ ] On parse error, log `ERROR: malformed task_state.json in <session-id>` and skip.
            - [ ] On success, extract `completed_requirements`, `in_progress`, and `blocked`.
        - [ ] Aggregate all `completed_requirements` into a `BTreeSet<String>` (union, deduplicated).
        - [ ] Aggregate all `in_progress` and `blocked` tasks (preserve all entries).
    - [ ] Read `target/traceability.json` using filesystem MCP:
        - [ ] On `FileNotFound`, log `WARN: target/traceability.json missing` and return empty `completed_requirements`.
        - [ ] On parse error, log `ERROR: malformed traceability.json` and return empty `completed_requirements`.
        - [ ] On success, extract the set of requirements with `"covered": true`.
    - [ ] **Merge algorithm** (per [3_MCP_DESIGN-REQ-053]):
        - [ ] For each requirement in the session union:
            - [ ] If it exists in traceability with `covered: true`, add to `completed_requirements`.
            - [ ] If it exists in traceability with `covered: false`, add to `rejected_requirements` with reason `"not covered in traceability"`.
            - [ ] If it does NOT exist in traceability, add to `rejected_requirements` with reason `"not found in traceability"`.
    - [ ] Log the recovery summary:
        - [ ] `INFO: Recovered N completed requirements from M session files`.
        - [ ] `INFO: Rejected K requirements due to missing traceability coverage`.
    - [ ] Return `RecoveryResult` with merged data.
- [ ] Integrate into agent initialization:
    - [ ] Call `recover_session_state` during agent startup, before selecting the next requirement.
    - [ ] Use the `completed_requirements` set to filter out already-done work.
    - [ ] Use `in_progress` to identify tasks that may need resumption.
    - [ ] Use `blocked` to avoid attempting blocked requirements.
- [ ] Implement `RecoveryError` enum:
    - `IoError(String)`
    - `McpError(String)`
    - `TraceabilityMissing` (used when traceability.json is absent)

## 3. Code Review
- [ ] Verify that the merge logic correctly implements the invariant: **Complete IFF in session file AND covered in traceability**.
- [ ] Ensure that malformed JSON files are skipped gracefully without crashing the agent.
- [ ] Check that file listing and reading use reasonable concurrency (e.g., `join_all` with limit of 10 concurrent reads if many session files exist).
- [ ] Confirm that the agent handles the missing `target/traceability.json` case by treating all requirements as incomplete.
- [ ] Verify that `BTreeSet` is used (not `HashSet`) for deterministic ordering in tests.
- [ ] Ensure that logging is informative for debugging session recovery issues.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test recovery_merge` and ensure all merge scenarios pass.
- [ ] Run `cargo test -p devs-core --lib agent::recovery` for unit tests.
- [ ] Verify that no tests are marked `#[ignore]` or `#[skip]`.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` section 5.4 to confirm implementation matches spec.
- [ ] Add a section explaining the recovery merge algorithm with pseudocode in a doc comment on `recover_session_state`.
- [ ] Document the `RecoveryResult` struct fields and their semantics.

## 6. Automated Verification
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-053" crates/devs-core/` to verify traceability annotations in implementation and tests.
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-NEW-033" crates/devs-core/` to verify merge algorithm is covered.
- [ ] Run `./do test` and verify `target/traceability.json` shows these requirements as `"covered": true`.

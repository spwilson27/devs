# Task: Implement .devs_context.json File Generation (Sub-Epic: 05_MCP List & Filter Operations)

## Covered Requirements
- [3_MCP_DESIGN-REQ-054]

## Dependencies
- depends_on: []
- shared_components: [devs-executor, devs-core, devs-scheduler]

## 1. Initial Test Written
- [ ] Write a unit test in `crates/devs-executor/src/context.rs` that verifies:
    - A `.devs_context.json` file is created in the working directory before an orchestrated agent spawn.
    - The file contains a JSON object with keys for each completed dependency stage.
    - Each stage's output includes `exit_code`, `stdout`, `stderr`, and `structured_output` (if applicable).
    - The file is written atomically (temp file + rename) to prevent partial reads.
- [ ] Write an integration test in `tests/integration/context_file.rs` that verifies:
    - A workflow with 3 stages (A → B → C) where stage B receives stage A's output in `.devs_context.json`.
    - Stage C receives both A and B outputs in `.devs_context.json`.
    - The JSON structure matches the schema expected by agents.
- [ ] Write a test verifying that orchestrated agents can read `.devs_context.json` from their working directory without needing `DEVS_MCP_ADDR`.

## 2. Task Implementation
- [ ] Add a `ContextFile` struct in `devs-executor` with fields for stage outputs.
- [ ] Implement `write_context_file(working_dir: &Path, outputs: &HashMap<StageName, StageOutput>) -> Result<()>` function.
- [ ] Integrate context file writing into the stage preparation flow in `devs-executor::prepare_environment()`.
- [ ] Ensure the context file includes:
    - Stage name as key
    - `exit_code`: i32
    - `stdout`: String (truncated if exceeds size limit, with indicator)
    - `stderr`: String (truncated if exceeds size limit, with indicator)
    - `structured_output`: Option<serde_json::Value>
    - `completed_at`: ISO 8601 timestamp
- [ ] Add stdout/stderr size limits (e.g., 1MB each) with truncation message: `"... [truncated N bytes]"`.
- [ ] Ensure the context file is written to the working directory root before the agent process spawns.
- [ ] Update the default system prompt for orchestrated agents to mention `.devs_context.json` as the source of prior stage outputs.

## 3. Code Review
- [ ] Verify that context file writing does not block the scheduler (use `spawn_blocking` if needed).
- [ ] Ensure truncation logic preserves valid UTF-8 and JSON structure.
- [ ] Check that file permissions allow the agent to read but not modify the context file (if platform supports).
- [ ] Confirm that the context file schema is stable and documented for agent consumption.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor` to verify context file unit tests.
- [ ] Run `cargo test --test integration context_file` to verify end-to-end context flow.
- [ ] Run `./do test` to ensure all tests pass and traceability is updated.

## 5. Update Documentation
- [ ] Add `.devs_context.json` schema documentation to `docs/plan/specs/3_mcp_design.md` §2.4 (Stage Inputs).
- [ ] Update agent prompt templates to reference `.devs_context.json` as the canonical source for prior stage outputs.
- [ ] Document the context file behavior in the TAS under execution environment specifications.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [3_MCP_DESIGN-REQ-054] as covered.
- [ ] Run `./do coverage` to ensure the new context file code meets the 90% unit coverage gate.

# Task: Stage Fails with PromptFileNotFound Before Agent Spawn (Sub-Epic: 084_Detailed Domain Specifications (Part 49))

## Covered Requirements
- [2_TAS-REQ-499]

## Dependencies
- depends_on: []
- shared_components: [devs-scheduler (consume — stage dispatch logic), devs-executor (consume — environment preparation), devs-adapters (consume — AgentAdapter trait)]

## 1. Initial Test Written
- [ ] In `crates/devs-scheduler/src/tests.rs` (or equivalent), write `test_missing_prompt_file_fails_stage`:
  1. Create a workflow with a single stage configured with `prompt_file = "outputs/plan.md"`.
  2. Set up a mock execution environment where `outputs/plan.md` does not exist.
  3. Trigger stage dispatch (transition from `Eligible` to the dispatch path).
  4. Assert the stage transitions to `Failed`.
  5. Assert the error field on the `StageRun` contains `PromptFileNotFound` (as a string or enum variant).
  6. Assert the error includes the path `"outputs/plan.md"`.
- [ ] Write `test_missing_prompt_file_no_agent_spawned`:
  1. Same setup as above.
  2. Use a mock `AgentAdapter` with a call counter or spy.
  3. After the stage fails, assert `spawn` was never called on the adapter.
- [ ] Write `test_existing_prompt_file_proceeds_normally`:
  1. Same setup but create the file `outputs/plan.md` with content `"Do the thing"`.
  2. Use a mock adapter that succeeds.
  3. Assert the stage transitions to `Running` (agent was spawned).
- [ ] Write `test_prompt_file_resolved_relative_to_working_dir`:
  1. Configure the stage working directory to `/tmp/test-workdir`.
  2. Set `prompt_file = "outputs/plan.md"`.
  3. Create `/tmp/test-workdir/outputs/plan.md`.
  4. Assert the stage proceeds (file found at resolved path).
  5. Remove the file and assert the stage fails (file not found at resolved path).

## 2. Task Implementation
- [ ] In the stage dispatch logic (in `devs-scheduler` or `devs-executor`), before calling `AgentAdapter::spawn`:
  1. If the stage has a `prompt_file` configured, resolve it relative to the stage's working directory.
  2. Check `std::path::Path::new(&resolved_path).exists()`.
  3. If the file does not exist: transition the stage to `Failed` with error `StageError::PromptFileNotFound { path: resolved_path }`, log a `WARN` message, and return without spawning.
- [ ] Define `StageError::PromptFileNotFound { path: String }` variant in the error enum.
- [ ] Ensure the `Display` impl for this error includes `"PromptFileNotFound"` and the missing path.
- [ ] Add `// Covers: 2_TAS-REQ-499` annotation to each test.

## 3. Code Review
- [ ] Verify the file check happens **before** any agent process spawn — no subprocess should be created.
- [ ] Confirm the path is resolved relative to the execution environment's working directory, not the server's CWD.
- [ ] Check that stages without `prompt_file` (using inline `prompt` string) are unaffected by this check.
- [ ] Verify the error is recorded on the `StageRun` record for inspection via gRPC/MCP.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- prompt_file` and verify all tests pass.
- [ ] Run `cargo test -p devs-executor` to confirm no regressions.

## 5. Update Documentation
- [ ] Add doc comment on the dispatch function documenting the pre-spawn prompt file validation.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Grep test files for `// Covers: 2_TAS-REQ-499` to verify traceability annotation is present.

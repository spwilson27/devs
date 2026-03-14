# Task: Fan-Out Expansion StageRun Model (Sub-Epic: 032_Foundational Technical Requirements (Part 23))

## Covered Requirements
- [2_TAS-REQ-030C]

## Dependencies
- depends_on: []
- shared_components: ["devs-core (consumer — uses domain types like StageRunState)", "devs-proto (consumer — references StageRun wire type)"]

## 1. Initial Test Written
- [ ] Create a test module in the `devs-core` crate (e.g., `src/fanout.rs` tests or `tests/fanout_expansion.rs`) with the following test cases written before any implementation:
  1. **`test_fanout_stage_expands_into_n_sub_executions`**: Given a fan-out stage with `fan_out_count = 3`, call the expansion function and assert it produces exactly 3 distinct `StageRun` structs, each with a unique sub-execution ID derived from the parent stage name (e.g., `"build[0]"`, `"build[1]"`, `"build[2]"`).
  2. **`test_fanout_sub_execution_ids_are_unique`**: Expand a fan-out stage with N=5 and assert all returned `StageRun` IDs are distinct from each other and from the parent stage ID.
  3. **`test_fanout_sub_executions_reference_parent`**: Each sub-execution `StageRun` must carry a `parent_stage` field pointing back to the original fan-out stage name. Assert this is set correctly for all sub-executions.
  4. **`test_fanout_sub_executions_initial_state`**: All expanded sub-execution `StageRun` instances must start in `StageRunState::Pending`. Assert each one's state.
  5. **`test_fanout_parent_completes_only_when_all_children_terminal`**: Create a parent fan-out with 3 sub-executions. Mark 2 as `Completed` and 1 as `Running`. Assert `is_fanout_complete()` returns `false`. Mark the last as `Completed`. Assert `is_fanout_complete()` returns `true`.
  6. **`test_fanout_parent_completes_when_child_failed`**: Create 2 sub-executions. Mark one `Completed`, one `Failed`. Assert `is_fanout_complete()` returns `true` — all children are in terminal states.
  7. **`test_fanout_zero_count_returns_error`**: Fan-out with count=0 must return an error. Assert the expansion function returns `Err`.
  8. **`test_fanout_one_count_produces_single_sub_execution`**: Fan-out with count=1 produces exactly 1 sub-execution. Assert it behaves identically to a normal stage aside from having a parent reference.

## 2. Task Implementation
- [ ] In `devs-core`, define a `FanOutExpansion` struct or function `expand_fanout(stage_name: &str, fan_out_count: usize) -> Result<Vec<StageRun>, CoreError>` that:
  1. Validates `fan_out_count >= 1`, returning error for 0.
  2. Generates N `StageRun` instances, each with ID `"{stage_name}[{index}]"`, `parent_stage: Some(stage_name.to_string())`, and initial state `StageRunState::Pending`.
- [ ] Implement `is_fanout_complete(sub_executions: &[StageRun]) -> bool` that returns `true` only when every sub-execution is in a terminal state (`Completed`, `Failed`, or `Cancelled`).
- [ ] Add `// Covers: 2_TAS-REQ-030C` annotations to each test function.

## 3. Code Review
- [ ] Verify sub-execution IDs follow a deterministic naming scheme (`stage[0]`, `stage[1]`, ...) so downstream code can reconstruct them.
- [ ] Verify the parent-child relationship is explicitly modeled (not implicit) — each sub-execution carries its parent stage name.
- [ ] Verify terminal state check includes all three terminal variants (Completed, Failed, Cancelled).
- [ ] Verify no allocation or cloning beyond what is necessary for the returned Vec.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test fanout` and confirm all 8 tests pass.
- [ ] Run `cargo clippy --all-targets` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `expand_fanout` and `is_fanout_complete` explaining the fan-out expansion model and parent completion semantics.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the new tests appear in output and pass.
- [ ] Grep test source for `// Covers: 2_TAS-REQ-030C` and confirm the annotation exists at least once.

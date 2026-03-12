# Task: Implement Fan-out Completion Logic (Sub-Epic: 013_Foundational Technical Requirements (Part 4))

## Covered Requirements
- [2_TAS-BR-021], [2_TAS-REQ-030C], [2_TAS-REQ-276]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core`, write a unit test in `src/run.rs` (or equivalent) for `StageRun`.
- [ ] Define a `StageRun` with a `fan_out` config.
- [ ] Create `N` sub-agent execution records for this stage.
- [ ] Write a test that simulates partial completions (e.g., `M < N` completions).
- [ ] Verify that the parent stage does NOT transition to `Completed` until the `N`-th sub-agent completion is recorded.
- [ ] Test the failure condition: if any sub-agent fails, the parent stage eventually fails.

## 2. Task Implementation
- [ ] In `devs-core`, update `StageRun` to include `sub_executions: Vec<StageID>` or similar structure.
- [ ] Implement `is_complete()` logic for `StageRun` that returns `true` only if:
  - For non-fan-out: the stage status is terminal.
  - For fan-out: all sub-executions identified in the parent stage are in a terminal state.
- [ ] Ensure that `mcp_tool_call` is rejected for fan-out stages during validation (part of foundational checks).
- [ ] This task implements the foundational data structures and boolean logic; the scheduler will consume these in later phases.

## 3. Code Review
- [ ] Confirm that `StageRun` can accurately identify its children.
- [ ] Verify the `is_complete()` logic is robust against empty sub-execution lists.
- [ ] Check that `2_TAS-REQ-276` (fan-out completion compatibility) is enforced in the validation logic of `devs-core`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to ensure fan-out logic is correct.
- [ ] Run `./do test` to verify traceability annotations.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to note the structure of fan-out stages.

## 6. Automated Verification
- [ ] Ensure the tests cover the atomic transition property: the parent only moves to `Completed` on the final child completion event.

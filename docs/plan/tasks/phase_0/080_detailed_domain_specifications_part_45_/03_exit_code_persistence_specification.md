# Task: Exit Code Persistence Specification (Sub-Epic: 080_Detailed Domain Specifications (Part 45))

## Covered Requirements
- [2_TAS-REQ-479]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/state/tests.rs`, create unit tests for `StageRun.exit_code` persistence.
- [ ] Initialize a `StageRun`.
- [ ] Transition it from `Running` to `Completed` with `exit_code = Some(0)` and verify the state.
- [ ] Transition it from `Running` to `Failed` with `exit_code = Some(1)` and verify the state.
- [ ] Test that a `SIGKILL` event (simulated) records `-9` as the `exit_code`.
- [ ] Test the timeout scenario:
- Transition from `Running` to `TimedOut`.
- Verify that initially `exit_code` is `None` (or the status reflects a pending checkpoint).
- Update the `exit_code` after the process eventually exits and verify persistence.

## 2. Task Implementation
- [ ] Update `StageRun` and `StageOutput` in `crates/devs-core/src/models/stage.rs` to support the required `exit_code` persistence semantics.
- [ ] Update the `StageRun` state transition logic to allow recording an `exit_code` for every stage execution, regardless of the completion signal type (`ExitCode`, `StructuredOutput`, or `McpToolCall`).
- [ ] Implement the `SIGKILL` mapping to `-9` in the domain logic.
- [ ] Ensure that `TimedOut` status allows for a delayed `exit_code` update according to the spec: "records null for exit_code if the process does not exit before the checkpoint is written, and then records the actual exit code when the process exits."
- [ ] Update serialization/deserialization for `StageRun` to handle these fields correctly.

## 3. Code Review
- [ ] Verify that `exit_code` is recorded for all completion types.
- [ ] Confirm that `-9` is the standard value for `SIGKILL` across all supported platforms in the domain model.
- [ ] Ensure the `TimedOut` state allows the `exit_code` to be updated post-transition without violating state machine integrity.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify the state machine and model updates.

## 5. Update Documentation
- [ ] Update the domain specification memory or documentation with the new exit code persistence rules.

## 6. Automated Verification
- [ ] Execute `./do lint` to ensure that doc comments and code quality standards are met.
- [ ] Execute `./do test` to ensure that the new tests are integrated and traceability is maintained.

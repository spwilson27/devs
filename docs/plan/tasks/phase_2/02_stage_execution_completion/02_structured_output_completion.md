# Task: Stage Completion Handler: Structured Output (Sub-Epic: 02_Stage Execution & Completion)

## Covered Requirements
- [1_PRD-REQ-011], [2_TAS-REQ-091]

## Dependencies
- depends_on: [01_exit_code_completion.md]
- shared_components: [devs-core, devs-executor, devs-scheduler]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-scheduler` for `StageCompletionHandler::handle_structured_output`.
- [ ] Test scenario: `.devs_output.json` exists with `{ "success": true }`.
- [ ] Test scenario: `.devs_output.json` exists with `{ "success": false }`.
- [ ] Test scenario: `.devs_output.json` missing but stdout contains trailing JSON.
- [ ] Test scenario: JSON parsing fails (invalid JSON).
- [ ] Test scenario: JSON is valid but missing `success` field.

## 2. Task Implementation
- [ ] Implement the `StructuredOutput` logic in `devs-scheduler/src/completion.rs` as per `[2_TAS-REQ-091]`.
- [ ] Priority 1: Read `.devs_output.json` from the stage's working directory.
- [ ] Priority 2: Extract the last JSON object from the stage's captured stdout.
- [ ] Check for the `"success"` boolean field in the resulting JSON.
- [ ] Transition the stage to `Completed` if `success == true`, or `Failed` otherwise.
- [ ] Store the parsed output JSON in the `StageRun`'s output field (as per `[1_PRD-REQ-012]`).

## 3. Code Review
- [ ] Ensure `.devs_output.json` takes absolute precedence over stdout JSON (as per `[3_PRD-BR-015]`).
- [ ] Verify that invalid JSON results in `StageStatus::Failed` regardless of the process's exit code.
- [ ] Check that no memory-unsafe operations are used for string/JSON processing.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler`.
- [ ] Verify 90%+ line coverage for the new structured output parsing logic.

## 5. Update Documentation
- [ ] Update `devs-scheduler/README.md` to document the structured output completion behavior.
- [ ] Add doc comments explaining the priority of `.devs_output.json` vs stdout.

## 6. Automated Verification
- [ ] Verify `[1_PRD-REQ-011]` and `[2_TAS-REQ-091]` requirement tags are present in the test source.
- [ ] Run `./do format` and `./do lint` to ensure code quality.

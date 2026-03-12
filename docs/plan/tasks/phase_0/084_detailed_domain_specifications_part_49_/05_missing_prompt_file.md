# Task: Missing Prompt File Acceptance (Sub-Epic: 084_Detailed Domain Specifications (Part 49))

## Covered Requirements
- [2_TAS-REQ-499]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-executor]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-scheduler` that sets up a stage with `prompt_file = "outputs/plan.md"`.
- [ ] Ensure that no file exists at that path in the mock execution environment.
- [ ] Attempt to transition the stage from `Eligible` to `Running`.
- [ ] Assert that the stage transitions directly to `Failed` with an error field containing `PromptFileNotFound`.
- [ ] Mock the agent adapter to verify that no agent process was spawned for this stage.

## 2. Task Implementation
- [ ] Implement a pre-spawn check in the `devs-scheduler` or `devs-executor` to verify the existence of the configured `prompt_file`.
- [ ] Use `std::fs::metadata` or equivalent to check file presence before invoking the agent adapter's spawn method.
- [ ] If the file is missing, trigger a stage failure with the `PromptFileNotFound` error code.
- [ ] Log the missing file path for debugging purposes.

## 3. Code Review
- [ ] Confirm that the path check correctly resolves the path within the stage's execution environment (working directory).
- [ ] Verify that no agent process is spawned if the file is missing.
- [ ] Check for appropriate error handling in case of permission issues during the file check (distinguish between missing file and inaccessible file).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler` and `cargo test -p devs-executor`.
- [ ] Verify that the stage failure reason is correctly reported.

## 5. Update Documentation
- [ ] Update the `devs-config` documentation or the PRD/TAS about stage configuration and mandatory file inputs.
- [ ] Update `MEMORY.md` to include this error condition in the stage lifecycle.

## 6. Automated Verification
- [ ] Run `./do verify_requirements` to ensure `2_TAS-REQ-499` is fulfilled.

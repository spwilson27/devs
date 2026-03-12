# Task: Lazy Prompt File Resolution (Sub-Epic: 083_Detailed Domain Specifications (Part 48))

## Covered Requirements
- [2_TAS-REQ-491]

## Dependencies
- depends_on: [none]
- shared_components: [devs-executor, devs-core]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-executor` (or the scheduler if that's where stage dispatch happens) for a stage with a `prompt_file`.
- [ ] In the test case, set `prompt_file` to a path that does not exist at the time of submission/validation.
- [ ] Attempt to execute the stage.
- [ ] Verify that the stage transitions to `Failed`.
- [ ] Verify that the failure error is `PromptFileNotFound { path: "<path>" }`.
- [ ] Verify that NO agent process (e.g. `AgentAdapter::spawn`) is ever called.
- [ ] In another test, have a prior stage create the prompt file and verify that the next stage correctly resolves it at execution time.

## 2. Task Implementation
- [ ] Modify the stage execution logic (likely in `devs-executor`'s `StageExecutor::run_stage`) to resolve the `prompt_file` path just before spawning the agent.
- [ ] Check if the file exists at the provided path.
- [ ] If the file does not exist, return a `StageError::PromptFileNotFound` and transition the `StageRun` to `Failed`.
- [ ] Ensure that this check happens before any adapter-specific spawn logic or environment setup that might be expensive.
- [ ] Make sure that workflow definition validation (in `devs-config`) does NOT fail if a `prompt_file` path is missing (it should only validate the syntax/structure).

## 3. Code Review
- [ ] Confirm that `prompt_file` resolution handles relative paths correctly (relative to the stage's working directory).
- [ ] Verify that the `Failed` state transition is atomic and recorded in the checkpoint.
- [ ] Ensure the error message includes the missing path as required.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` and ensure the lazy prompt resolution tests pass.

## 5. Update Documentation
- [ ] Update the `WorkflowDefinition` documentation to clarify that `prompt_file` paths are validated lazily at runtime.

## 6. Automated Verification
- [ ] Run `./do verify_requirements.py` to ensure `[2_TAS-REQ-491]` is correctly mapped to the test.

# Task: Control and Project Commands (Sub-Epic: 03_CLI Implementation)

## Covered Requirements
- [1_PRD-REQ-039], [2_TAS-REQ-061]

## Dependencies
- depends_on: [02_workflow_submission_and_listing.md]
- shared_components: [devs-proto, devs-core]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/e2e/test_cli_control.py` (using `assert_cmd`) that invokes `devs cancel <run-id-or-slug>` and asserts a success message.
- [ ] Write tests for `devs pause` and `devs resume`.
- [ ] Write tests for the `project` subcommand suite: `devs project add`, `devs project remove`, `devs project list`.
- [ ] Write a test that attempts to add a project with a non-existent `repo_path` and verifies it fails with exit code 4.

## 2. Task Implementation
- [ ] Implement `devs cancel <run-id-or-slug>`:
  - Logic: Call `RunService.CancelRun` over gRPC.
- [ ] Implement `devs pause <run-id-or-slug/stage>`:
  - Logic: Call `RunService.PauseRun` or `StageService.PauseStage`.
- [ ] Implement `devs resume <run-id-or-slug/stage>`:
  - Logic: Call `RunService.ResumeRun` or `StageService.ResumeStage`.
- [ ] Implement `devs project`:
  - `add <name> <repo_path>`: Call `ProjectService.AddProject`.
  - `remove <project-id>`: Call `ProjectService.RemoveProject`.
  - `list`: Call `ProjectService.ListProjects`.
- [ ] Ensure `devs project add` and `remove` write the project registry file atomically (handled by `devs-config` shared component, invoked by `devs-grpc` thin adapter).

## 3. Code Review
- [ ] Verify that the `devs project` commands correctly map gRPC responses to terminal output.
- [ ] Ensure that confirmation prompts are not required for CLI commands unless `--confirm` is used (default should be non-interactive for scripting).

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` to verify control and project command functionality.
- [ ] Manually verify that `devs project list` displays a clean table of registered projects.

## 5. Update Documentation
- [ ] Update CLI documentation to include control and project management commands.

## 6. Automated Verification
- [ ] Run `./do coverage` and verify that the `devs-cli` achieves ≥ 50% line coverage for the new commands.

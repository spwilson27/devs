# Task: Server Startup: Resilient Project Checkpoint Recovery (Sub-Epic: 065_Detailed Domain Specifications (Part 30))

## Covered Requirements
- [2_TAS-REQ-403]

## Dependencies
- depends_on: [01_server_startup_config_validation.md]
- shared_components: [devs-checkpoint, devs-server]

## 1. Initial Test Written
- [ ] Create a unit test for the `ProjectManager` in `devs-server/src/project.rs` that mocks multiple registered projects.
- [ ] Configure the mock such that the `CheckpointStore` for one project returns a fatal error (e.g., repository corrupted, file not found) during the restoration phase.
- [ ] The test MUST verify that the `ProjectManager` successfully restores the checkpoints for all other healthy projects and does not abort the entire server startup sequence.

## 2. Task Implementation
- [ ] In the server startup orchestration, implement the project restoration loop ([2_TAS-REQ-403]).
- [ ] Iterate over each registered project and call its `CheckpointStore::restore()` method.
- [ ] Wrap the restoration call for each project in a `match` or `if let Err` block that captures errors.
- [ ] On failure for an individual project, log an `ERROR`-level message containing the project ID and the specific error encountered, but do not return an error that bubbles up to the main startup orchestrator.
- [ ] Ensure that a failure during one project's restoration does not cause the server to skip the remaining projects in the registry.

## 3. Code Review
- [ ] Verify that errors during checkpoint restoration are logged with sufficient detail for debugging.
- [ ] Ensure that no project-specific failure can prevent the server from binding its ports and accepting connections for other projects.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server --lib project` and ensure the resilient recovery tests pass.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_0/065_detailed_domain_specifications_part_30_/REPORTS.md` describing the resilient restoration logic.

## 6. Automated Verification
- [ ] Create a script that creates two project registries, corrupts one project's checkpoint file, and verifies that the `devs-server` starts and reports the second project as active via the `devs list` CLI command.

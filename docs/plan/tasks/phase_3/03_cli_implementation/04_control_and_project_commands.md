# Task: Control and Project Management Commands (Sub-Epic: 03_CLI Implementation)

## Covered Requirements
- [1_PRD-REQ-039], [2_TAS-REQ-061]

## Dependencies
- depends_on: [01_cli_scaffold_and_global_flags.md, 03_run_status_and_log_streaming.md]
- shared_components: [devs-proto (consumer), devs-core (consumer), devs-config (consumer — project registry via devs-grpc)]

## 1. Initial Test Written
- [ ] Write an E2E test using `assert_cmd` + mock gRPC server for `devs cancel <run-slug>`:
  - Verify exit code 0 and text output contains confirmation message (e.g., `Run <slug> cancelled.`).
  - Verify JSON mode (`--format json`) outputs valid JSON with `"status": "cancelled"`.
- [ ] Write E2E tests for `devs pause <run-slug>`:
  - Verify exit code 0 and confirmation message in text mode.
- [ ] Write E2E tests for `devs resume <run-slug>`:
  - Verify exit code 0 and confirmation message in text mode.
- [ ] Write E2E tests for `devs pause <run-slug>/<stage-name>` (stage-level pause):
  - Verify exit code 0 and output references the specific stage.
- [ ] Write E2E tests for `devs resume <run-slug>/<stage-name>` (stage-level resume).
- [ ] Write E2E tests for `devs project add <name> <repo-path>`:
  - Valid path: exit code 0, output contains the project ID or name.
  - Non-existent path: exit code 4 (validation error).
- [ ] Write E2E tests for `devs project remove <project-id>`:
  - Valid ID: exit code 0.
  - Unknown ID: exit code 2 (not found).
- [ ] Write E2E tests for `devs project list`:
  - Text mode: table with `ID`, `NAME`, `REPO`, `PRIORITY` columns.
  - JSON mode: valid JSON array.

## 2. Task Implementation
- [ ] Implement `devs cancel <run-id-or-slug>` in `crates/devs-cli/src/commands/cancel.rs`:
  - Parse run identifier using `RunIdentifier` from task 03.
  - Call `RunService::cancel_run` via gRPC.
  - Text: `Run <slug> cancelled.`
  - JSON: `{"status": "cancelled", "run_id": "<uuid>"}`.
- [ ] Implement `devs pause <target>` in `crates/devs-cli/src/commands/pause.rs`:
  - Parse `<target>` as either `<run-id-or-slug>` (run-level) or `<run-id-or-slug>/<stage>` (stage-level) by splitting on the last `/` character.
  - Run-level: call `RunService::pause_run`.
  - Stage-level: call `StageService::pause_stage`.
  - Text: `Run <slug> paused.` or `Stage <stage> of run <slug> paused.`
- [ ] Implement `devs resume <target>` in `crates/devs-cli/src/commands/resume.rs`:
  - Same target parsing as `pause`.
  - Run-level: call `RunService::resume_run`.
  - Stage-level: call `StageService::resume_stage`.
  - Text: `Run <slug> resumed.` or `Stage <stage> of run <slug> resumed.`
- [ ] Implement `devs project` subcommand group in `crates/devs-cli/src/commands/project.rs` using clap's `#[derive(Subcommand)]`:
  - `add <name> <repo-path> [--priority <n>] [--weight <n>] [--checkpoint-branch <branch>]`:
    Validate that `repo-path` exists locally (client-side check with `std::path::Path::exists()`). Call `ProjectService::add_project`.
  - `remove <project-id-or-name>`: Call `ProjectService::remove_project`.
  - `list`: Call `ProjectService::list_projects`. Text: table with `ID`, `NAME`, `REPO`, `PRIORITY`. JSON: array.
- [ ] Register `Cancel`, `Pause`, `Resume`, and `Project` (with nested `Add`, `Remove`, `List` subcommands) in the `Commands` enum.

## 3. Code Review
- [ ] Verify `<run-id-or-slug>/<stage>` parsing correctly handles slugs containing hyphens but not forward slashes.
- [ ] Verify that `devs project add` performs client-side path existence check before the gRPC call for fast feedback.
- [ ] Verify all commands reuse the shared `RunIdentifier` resolution and `format_table` utility.
- [ ] Verify all gRPC error responses flow through the centralized error handler (task 05).
- [ ] Verify commands are non-interactive by default — no confirmation prompts for scripting compatibility.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli` and ensure all control and project tests pass.
- [ ] Run `./do test` to ensure no regressions.

## 5. Update Documentation
- [ ] Add doc comments to `CancelCommand`, `PauseCommand`, `ResumeCommand`, and `ProjectCommand` structs.

## 6. Automated Verification
- [ ] Run `cargo clippy -p devs-cli -- -D warnings` and confirm zero warnings.
- [ ] Run `cargo test -p devs-cli -- --nocapture 2>&1 | grep "test result"` and verify 0 failures.
- [ ] Run `grep -r "// Covers:" crates/devs-cli/ | grep -E "1_PRD-REQ-039|2_TAS-REQ-061"` to verify traceability annotations.

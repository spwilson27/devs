# Task: Implement atomic operations for run creation and registry (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_PRD-BR-043], [3_PRD-BR-053]

## Dependencies
- depends_on: ["10_submit_run_tool.md"]
- shared_components: ["devs-scheduler (consumer)", "devs-config (consumer)", "devs-core (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-scheduler/tests/atomic_run_creation_test.rs`:
  - `test_concurrent_submit_same_name_exactly_one_succeeds` (covers 3_PRD-BR-043): spawn 10 parallel `submit_run` calls with identical `project_id` and `name`, assert exactly 1 succeeds and 9 return `already_exists` error
  - `test_run_creation_validation_holds_per_project_lock` (covers 3_PRD-BR-043): submit run A for project P, then concurrently submit run B for project P with same name, assert no window where both pass validation simultaneously (verify via checkpoint timestamps and run IDs)
  - `test_concurrent_different_projects_no_contention` (covers 3_PRD-BR-043): spawn 5 runs for project P1 and 5 runs for project P2 concurrently, assert all 10 complete without blocking each other (per-project locking, not global)
  - `test_run_creation_atomic_no_partial_state` (covers 3_PRD-BR-043): during concurrent submission, kill the server mid-validation, restart, assert no orphaned run state exists (either fully created or not present)

- [ ] In `crates/devs-config/tests/project_registry_test.rs`:
  - `test_project_add_writes_atomically` (covers 3_PRD-BR-053): call `devs project add`, assert registry file is written via temp-file + rename (verify no partial file exists during write via filesystem watcher)
  - `test_project_remove_writes_atomically` (covers 3_PRD-BR-053): call `devs project remove`, assert atomic write behavior
  - `test_registry_write_failure_does_not_corrupt` (covers 3_PRD-BR-053): simulate disk full during registry write (via FUSE mock or temp dir on tmpfs), assert registry file is either unchanged or fully updated, never partially written
  - `test_registry_atomic_write_uses_rename` (covers 3_PRD-BR-053): trace system calls during `project add`, assert `rename(2)` is used for atomic update

## 2. Task Implementation
- [ ] In `crates/devs-scheduler/src/run_creation.rs`, implement atomic run creation with per-project locking:
  - Use `DashMap<ProjectId, Arc<Mutex<()>>>` for fine-grained per-project locks
  - Acquire project lock before validation, hold through run creation and checkpoint commit
  - Release lock only after run is fully persisted
  - Ensure lock is released on error paths (use RAII guard)
- [ ] In `crates/devs-scheduler/src/duplicate_detection.rs`, implement race-free duplicate detection:
  - Check for existing run name under the per-project lock
  - No gap between check and insertion where another thread could slip in
- [ ] In `crates/devs-config/src/project_registry.rs`, implement atomic registry file writes:
  - Function `write_registry_atomic(registry: &ProjectRegistry, path: &Path) -> Result<()>`
  - Write to temp file in same directory (`registry.toml.tmp.<pid>`), then `rename(2)` to final path
  - Ensure temp file is cleaned up on error (but don't fail if cleanup fails)
- [ ] In `crates/devs-cli/src/commands/project.rs`, use atomic write for `project add` and `project remove`

## 3. Code Review
- [ ] Verify per-project lock does not deadlock (no nested lock acquisition in wrong order)
- [ ] Verify temp file naming includes PID or UUID to avoid collisions
- [ ] Verify rename is atomic on all supported platforms (Windows, macOS, Linux)
- [ ] Verify concurrent test actually demonstrates atomicity (check for flakiness)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- atomic` and confirm all pass
- [ ] Run `cargo test -p devs-config -- registry` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments to `write_registry_atomic` describing the atomic write pattern
- [ ] Add doc comments to per-project locking describing the concurrency model

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions

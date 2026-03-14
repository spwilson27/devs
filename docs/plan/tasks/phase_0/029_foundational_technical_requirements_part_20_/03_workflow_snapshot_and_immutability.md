# Task: Implement Workflow Snapshot Creation and Immutability Enforcement (Sub-Epic: 029_Foundational Technical Requirements (Part 20))

## Covered Requirements
- [2_TAS-REQ-022A], [2_TAS-REQ-022B]

## Dependencies
- depends_on: ["01_checkpoint_persistence_atomic_null.md"]
- shared_components: [devs-checkpoint (consumer), devs-core (consumer: WorkflowDefinition type)]

## 1. Initial Test Written
- [ ] In `devs-checkpoint/src/lib.rs` (or `devs-checkpoint/src/snapshotter.rs`), create a test module `#[cfg(test)] mod snapshot_tests`.
- [ ] **Test: `test_snapshot_creates_atomic_file`** — Create a tempdir. Construct a `WorkflowDefinition` (from `devs-core`). Call `Snapshotter::save_snapshot(dir, run_id, &definition)`. Assert `workflow_snapshot.json` exists in the run's checkpoint directory. Read the file and deserialize back to `WorkflowDefinition`. Assert equality with the original (verbatim serialization per [2_TAS-REQ-022A]).
- [ ] **Test: `test_snapshot_uses_atomic_write`** — After `save_snapshot`, assert `.workflow_snapshot.json.tmp` does NOT exist. Assert `workflow_snapshot.json` DOES exist. This confirms the tmp-then-rename pattern is used.
- [ ] **Test: `test_snapshot_immutability_debug_panics`** — Call `save_snapshot` once. Call `save_snapshot` again with the same `run_id`. Assert this panics (use `#[should_panic(expected = "immutability")]` or wrap in `std::panic::catch_unwind`). This test only runs in debug builds (annotate with `#[cfg(debug_assertions)]`).
- [ ] **Test: `test_snapshot_immutability_release_returns_error`** — This test validates release-mode behavior. Since tests typically run in debug mode, implement the immutability check as a function `check_snapshot_immutability(path: &Path) -> Result<(), SnapshotError>` that can be tested independently. Call it when the file exists. Assert it returns `Err(SnapshotError::ImmutableSnapshotViolation)`. In the actual `save_snapshot` method, the debug-mode code path calls `panic!` after this check, while release mode returns the error.
- [ ] **Test: `test_snapshot_written_before_first_stage_eligible`** — This is a logical ordering test. Construct a mock scenario: create a `Checkpoint` in `Pending` state, transition to `Running`, call `save_snapshot`. Assert the snapshot exists. Then mark a stage as `Eligible`. This verifies the contract that the snapshot is written during the `Pending → Running` transition, before any stage becomes `Eligible`.

## 2. Task Implementation
- [ ] Define `SnapshotError` enum (or add variant to existing `CheckpointError`): `ImmutableSnapshotViolation { run_id: String, path: PathBuf }`.
- [ ] Implement `Snapshotter` (struct or free functions in `devs-checkpoint`):
  - `save_snapshot(dir: &Path, run_id: &str, definition: &WorkflowDefinition) -> Result<(), SnapshotError>`
    1. Compute the snapshot path: `dir.join(run_id).join("workflow_snapshot.json")`.
    2. Check if the file already exists:
       - If yes and `cfg!(debug_assertions)`: `panic!("Snapshot immutability violated for run {}", run_id)`.
       - If yes and release: return `Err(SnapshotError::ImmutableSnapshotViolation { .. })`.
    3. Serialize `definition` to pretty JSON via `serde_json::to_string_pretty`.
    4. Write to `.workflow_snapshot.json.tmp` sibling file.
    5. `std::fs::rename` to `workflow_snapshot.json`.
- [ ] Reuse the `FileSystem` trait from task 02 if available, or use direct `std::fs` calls (the `FileSystem` trait is primarily for error injection in checkpoint writes).
- [ ] Ensure `WorkflowDefinition` in `devs-core` derives `Serialize, Deserialize, Clone, PartialEq, Debug`. If the struct doesn't exist yet, define a minimal placeholder with fields: `name: String`, `stages: Vec<StageDefinition>`, `inputs: Vec<InputParam>`. Mark with a `// BOOTSTRAP-STUB: will be expanded in Phase 1 devs-config` comment.

## 3. Code Review
- [ ] Verify the immutability check happens BEFORE any write attempt — no partial writes if the file exists.
- [ ] Verify `cfg!(debug_assertions)` is used (runtime check), not `#[cfg(debug_assertions)]` (compile-time), so both code paths are compiled and the release path is testable.
- [ ] Verify the snapshot is a verbatim serialization — no field filtering, no transformation, no schema version wrapping.
- [ ] Verify the atomic write pattern (tmp + rename) matches the checkpoint pattern from task 01.
- [ ] Verify `ImmutableSnapshotViolation` error includes the run_id and path for debuggability.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- snapshot_tests` and ensure all tests pass.
- [ ] Run `cargo test -p devs-checkpoint` to confirm no regressions.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-022A` comment above the `save_snapshot` implementation.
- [ ] Add `// Covers: 2_TAS-REQ-022B` comment above the immutability check logic.
- [ ] Add doc comment on `save_snapshot` explaining: "Writes the workflow definition verbatim as `workflow_snapshot.json`. Must be called exactly once per run during the Pending→Running transition. Panics in debug builds if called twice; returns ImmutableSnapshotError in release builds."

## 6. Automated Verification
- [ ] Run `cargo test -p devs-checkpoint 2>&1 | grep -E "test result:"` and confirm `0 failed`.
- [ ] Run `cargo clippy -p devs-checkpoint -- -D warnings` with no warnings.
- [ ] Grep for `// Covers: 2_TAS-REQ-022` in the crate source to confirm traceability annotations exist.

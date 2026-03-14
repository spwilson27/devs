# Task: Implement Git Checkpoint Corruption Risk Mitigation (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [RISK-003], [RISK-003-BR-002], [MIT-003]

## Dependencies
- depends_on: ["12_file_permission_security.md", "22_checkpoint_crash_recovery_security.md"]
- shared_components: [devs-core (Owner), devs-checkpoint (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_checkpoint_disk_full_handling` that simulates disk-full condition during checkpoint write and verifies atomic rollback
- [ ] Write test `test_checkpoint_crash_recovery_integrity` that corrupts a checkpoint file mid-write and verifies recovery detects corruption
- [ ] Write test `test_checkpoint_git_push_failure_handling` that simulates git push failure and verifies checkpoint is not lost
- [ ] Write test `test_checkpoint_orphan_temp_file_cleanup` that creates orphan `.tmp` files and verifies startup cleanup removes them
- [ ] Write test `test_mit_003_atomic_write_protocol` that verifies checkpoint writes use temp-file + fsync + rename pattern
- [ ] Write test `test_risk_003_br_002_fallback_meta` that asserts the fallback metadata exists documenting checkpoint corruption fallback procedures

## 2. Task Implementation
- [ ] Define `CheckpointWriteProtocol` struct in `crates/devs-core/src/checkpoint/write_protocol.rs` documenting the atomic write sequence:
  1. Write to `.devs/<run_id>.tmp`
  2. Call `fsync()` on file descriptor
  3. Rename to `.devs/<run_id>.json`
  4. Call `fsync()` on parent directory
  5. Git commit and push
- [ ] Define `CheckpointIntegrityError` enum with variants:
  - `DiskFull { bytes_written: usize, expected_bytes: usize }`
  - `CorruptedData { path: PathBuf, reason: String }`
  - `GitPushFailed { commit_hash: String, error: String }`
  - `SchemaVersionMismatch { expected: String, found: String }`
- [ ] Implement `MIT-003` mitigation: Atomic checkpoint writes with rollback
  - Temp-file + fsync + rename pattern
  - Orphan temp file cleanup on startup
  - Git push failure recovery (checkpoint preserved locally)
- [ ] Define `OrphanCleanupPolicy` struct with:
  - `cleanup_on_startup: bool = true`
  - `glob_pattern: &str = ".devs/*.tmp"`
  - `max_age_hours: u32 = 24`
  - `cleanup() -> Result<CleanupReport, CleanupError>` method
- [ ] Implement `RISK-003-BR-002` business rule: Fallback metadata for checkpoint corruption
  - Define `CheckpointFallbackMeta` struct documenting:
    - Fallback trigger: Git store unavailable
    - Fallback behavior: Local checkpoint persistence with manual sync
    - Recovery procedure: Manual git push after disk space recovered
- [ ] Define `CheckpointSchemaVersion` struct with `major: u32`, `minor: u32` and compatibility check
- [ ] Add `pub mod write_protocol;` to `crates/devs-core/src/checkpoint/mod.rs`

## 3. Code Review
- [ ] Verify atomic write protocol follows temp-file + fsync + rename pattern
- [ ] Verify orphan cleanup runs on startup and removes stale temp files
- [ ] Verify `MIT-003` mitigation is correctly implemented per the risk matrix
- [ ] Verify `RISK-003-BR-002` business rule is documented

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core checkpoint::write_protocol` and confirm all checkpoint tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/checkpoint/write_protocol.rs` explaining the atomic write protocol and MIT-003 mitigation
- [ ] Add doc comments to `CheckpointWriteProtocol` describing each step of the atomic sequence
- [ ] Document the orphan cleanup policy and startup cleanup behavior

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
- [ ] Verify `CheckpointWriteProtocol` uses `std::fs::rename` for atomic rename
- [ ] Run `grep -r "RISK-003" crates/devs-core/src/` and confirm the requirement ID appears in test annotations

# Task: Implement Checkpoint and Crash Recovery Security Types (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-415], [5_SECURITY_DESIGN-REQ-416], [5_SECURITY_DESIGN-REQ-417], [5_SECURITY_DESIGN-REQ-418], [5_SECURITY_DESIGN-REQ-419], [5_SECURITY_DESIGN-REQ-420], [5_SECURITY_DESIGN-REQ-421], [5_SECURITY_DESIGN-REQ-422], [5_SECURITY_DESIGN-REQ-423], [5_SECURITY_DESIGN-REQ-424], [5_SECURITY_DESIGN-REQ-425], [5_SECURITY_DESIGN-REQ-426], [5_SECURITY_DESIGN-REQ-427], [5_SECURITY_DESIGN-REQ-428], [5_SECURITY_DESIGN-REQ-429], [5_SECURITY_DESIGN-REQ-430], [5_SECURITY_DESIGN-REQ-431], [5_SECURITY_DESIGN-REQ-432], [5_SECURITY_DESIGN-REQ-433], [5_SECURITY_DESIGN-REQ-434], [5_SECURITY_DESIGN-REQ-435], [5_SECURITY_DESIGN-REQ-436], [AC-SEC-5-001], [AC-SEC-5-002], [AC-SEC-5-003], [AC-SEC-5-004], [AC-SEC-5-005], [AC-SEC-5-006], [AC-SEC-5-007], [AC-SEC-5-008], [AC-SEC-5-009], [AC-SEC-5-010], [AC-SEC-5-011], [AC-SEC-5-012], [AC-SEC-5-013], [AC-SEC-5-014], [AC-SEC-5-015], [AC-SEC-5-016]

## Dependencies
- depends_on: ["11_redacted_wrapper_credential_security.md", "12_file_permission_security.md"]
- shared_components: [devs-core (Owner), devs-checkpoint (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_checkpoint_integrity_spec` asserting `CheckpointIntegrity` struct holds schema version and validation method
- [ ] Write test `test_checkpoint_write_atomicity` asserting `CheckpointWriteProtocol` specifies temp-file + rename pattern
- [ ] Write test `test_checkpoint_credential_strip` asserting `CheckpointSanitizer` type lists fields that must be stripped before persistence
- [ ] Write test `test_orphan_temp_file_cleanup_spec` asserting `OrphanCleanupPolicy` specifies startup cleanup of `.devs/*.tmp` files
- [ ] Write test `test_checkpoint_branch_isolation` asserting `CheckpointBranchConfig` enum has `WorkingBranch` and `Dedicated(String)` variants
- [ ] Write test `test_concurrent_checkpoint_serialization` asserting `CheckpointLockSpec` specifies per-run mutex requirement

## 2. Task Implementation
- [ ] Define `CheckpointIntegrity` struct in `crates/devs-core/src/security/checkpoint.rs` with `schema_version: CheckpointSchemaVersion` and `validate(data: &[u8]) -> Result<(), CheckpointError>`
- [ ] Define `CheckpointWriteProtocol` documenting the atomic write sequence: write to `.devs/<run_id>.tmp`, fsync, rename to `.devs/<run_id>.json`
- [ ] Define `CheckpointSanitizer` with `STRIPPED_FIELDS: &[&str]` listing credential fields removed before persistence
- [ ] Define `OrphanCleanupPolicy` struct with `cleanup_on_startup: bool`, `glob_pattern: &str = ".devs/*.tmp"`
- [ ] Define `CheckpointBranchConfig` enum with `WorkingBranch`, `Dedicated { branch_name: String }`
- [ ] Define `CheckpointLockSpec` documenting per-run `Arc<tokio::sync::Mutex<()>>` serialization requirement
- [ ] Define `CheckpointError` enum with `SchemaVersionMismatch`, `CorruptedData`, `DiskFull`, `GitPushFailed`

## 3. Code Review
- [ ] Verify atomic write protocol matches the temp-rename pattern from the spec
- [ ] Verify credential stripping list is exhaustive
- [ ] Verify error types cover all failure modes (disk full, git push failure, corruption)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- checkpoint` and confirm all checkpoint security tests pass
- [ ] Run `cargo clippy --workspace -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/security/checkpoint.rs` explaining the atomic write protocol and credential stripping rationale
- [ ] Document `CheckpointError` variants with the conditions that trigger each

## 6. Automated Verification
- [ ] `cargo test -p devs-core` passes with no failures
- [ ] `CheckpointSanitizer::STRIPPED_FIELDS` non-empty verified by test assertion
- [ ] `OrphanCleanupPolicy::glob_pattern` equals `".devs/*.tmp"` verified by test assertion

# Task: Checkpoint Schema Version Enforcement (Sub-Epic: 061_Detailed Domain Specifications (Part 26))

## Covered Requirements
- [2_TAS-REQ-261]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer), devs-checkpoint (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/checkpoint.rs` (or `crates/devs-core/src/checkpoint/schema.rs`), create a `CheckpointEnvelope` struct with fields: `schema_version: u32`, `written_at: String`, `run: serde_json::Value` (the run payload). This struct is the outermost JSON wrapper for checkpoint files.
- [ ] Write test `test_checkpoint_envelope_schema_version_1_accepted`: Construct a valid JSON string with `"schema_version": 1` and other required fields. Deserialize into `CheckpointEnvelope`. Assert deserialization succeeds and `schema_version == 1`.
  ```rust
  // Covers: 2_TAS-REQ-261
  #[test]
  fn test_checkpoint_envelope_schema_version_1_accepted() {
      let json = r#"{"schema_version": 1, "written_at": "2025-01-01T00:00:00Z", "run": {}}"#;
      let result: Result<CheckpointEnvelope, _> = serde_json::from_str(json);
      assert!(result.is_ok());
      assert_eq!(result.unwrap().schema_version, 1);
  }
  ```
- [ ] Write test `test_checkpoint_envelope_schema_version_0_rejected`: JSON with `"schema_version": 0`. Call `CheckpointEnvelope::validate()` (or a `TryFrom` impl). Assert it returns `Err(CheckpointError::SchemaMigrationRequired { found: 0, expected: 1 })`.
- [ ] Write test `test_checkpoint_envelope_schema_version_2_rejected`: JSON with `"schema_version": 2`. Assert same `SchemaMigrationRequired` error with `found: 2`.
- [ ] Write test `test_checkpoint_envelope_schema_version_negative_rejected`: JSON with `"schema_version": -1`. Assert deserialization error (u32 rejects negative).
- [ ] Write test `test_checkpoint_envelope_schema_version_missing_rejected`: JSON without `schema_version` field. Assert deserialization error (field is required, not `Option`).
- [ ] Write test `test_checkpoint_envelope_schema_version_string_rejected`: JSON with `"schema_version": "1"`. Assert deserialization error (type mismatch).

## 2. Task Implementation
- [ ] Define `CheckpointEnvelope` in `crates/devs-core/src/checkpoint.rs`:
  ```rust
  #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
  pub struct CheckpointEnvelope {
      pub schema_version: u32,
      pub written_at: String,
      pub run: serde_json::Value,
  }
  ```
- [ ] Define `CheckpointError` enum (or extend existing error type) with variant:
  ```rust
  #[derive(Debug, thiserror::Error)]
  pub enum CheckpointError {
      #[error("schema migration required: found version {found}, expected {expected}")]
      SchemaMigrationRequired { found: u32, expected: u32 },
      // ... other variants
  }
  ```
- [ ] Implement `CheckpointEnvelope::validate(&self) -> Result<(), CheckpointError>` that checks `self.schema_version == 1` and returns `SchemaMigrationRequired` otherwise. The constant `CURRENT_SCHEMA_VERSION: u32 = 1` should be defined alongside.
- [ ] Implement `CheckpointEnvelope::from_json(bytes: &[u8]) -> Result<Self, CheckpointError>` that deserializes then validates, providing a single entry point that both parses and enforces the version constraint.
- [ ] Add doc comments to all public items explaining the schema versioning contract.

## 3. Code Review
- [ ] Verify `schema_version` is `u32` (not `Option`, not `i32`), making missing/negative values a parse error.
- [ ] Verify the validation returns a domain-specific `SchemaMigrationRequired` error, not a generic parse error, when the version is present but wrong.
- [ ] Verify `CURRENT_SCHEMA_VERSION` is a named constant, not a magic number.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- checkpoint` and confirm all 6 tests pass.

## 5. Update Documentation
- [ ] Add doc comment on `CheckpointEnvelope` explaining that `schema_version` must always be `1` per [2_TAS-REQ-261] and that future versions will require a migration path.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the traceability scanner finds `// Covers: 2_TAS-REQ-261` annotations on the new tests.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm zero warnings.

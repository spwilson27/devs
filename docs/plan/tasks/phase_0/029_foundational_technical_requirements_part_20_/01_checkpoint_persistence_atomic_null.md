# Task: Implement Atomic `checkpoint.json` Write and Null-Preserving Serialization (Sub-Epic: 029_Foundational Technical Requirements (Part 20))

## Covered Requirements
- [2_TAS-REQ-021A], [2_TAS-REQ-021B]

## Dependencies
- depends_on: []
- shared_components: [devs-checkpoint (owner: Phase 1, consumed here as foundational logic), devs-core (consumer: domain types)]

## 1. Initial Test Written
- [ ] In `devs-checkpoint/src/lib.rs` (or `devs-checkpoint/src/checkpoint_store.rs`), create a test module `#[cfg(test)] mod checkpoint_atomic_tests`.
- [ ] **Test: `test_checkpoint_schema_conformance`** — Construct a `Checkpoint` struct with all fields populated. Serialize to JSON via `serde_json::to_string_pretty`. Parse the resulting JSON string back as `serde_json::Value` and assert the presence of all required top-level keys: `schema_version`, `run_id`, `workflow_name`, `state`, `stages`, `started_at`, `completed_at`. Assert `schema_version` matches the expected constant (e.g., `"1"`).
- [ ] **Test: `test_atomic_write_creates_tmp_then_renames`** — Create a `tempdir`. Call `CheckpointStore::save(&dir, &checkpoint)`. Before the call, assert no `.checkpoint.json.tmp` exists. After the call, assert `checkpoint.json` exists. Assert `.checkpoint.json.tmp` does NOT exist (it was renamed away). Read `checkpoint.json` and deserialize back to `Checkpoint`; assert equality with the original.
- [ ] **Test: `test_tmp_file_is_ignored_by_reader`** — Manually write a file named `.checkpoint.json.tmp` with garbage content into a tempdir. Call `CheckpointStore::load(&dir)`. Assert the load either returns `None` or ignores the `.tmp` file entirely (does not error, does not parse it).
- [ ] **Test: `test_null_serialization_for_optional_timestamps`** — Construct a `Checkpoint` where `completed_at` is `None`. Serialize to JSON string. Parse as `serde_json::Value`. Assert that the key `"completed_at"` exists in the JSON object AND its value is `serde_json::Value::Null` (not absent).
- [ ] **Test: `test_deserialize_absent_optional_field_as_none`** — Construct a JSON string that is a valid checkpoint but with the `"completed_at"` key entirely removed. Deserialize into `Checkpoint`. Assert `completed_at` is `None`. This verifies forward compatibility per [2_TAS-REQ-021B].

## 2. Task Implementation
- [ ] Define `Checkpoint` struct in `devs-checkpoint` with fields: `schema_version: String`, `run_id: String`, `workflow_name: String`, `state: String`, `stages: Vec<StageRunCheckpoint>`, `started_at: Option<chrono::DateTime<chrono::Utc>>`, `completed_at: Option<chrono::DateTime<chrono::Utc>>`. Derive `Serialize, Deserialize, Debug, Clone, PartialEq`.
- [ ] Define `StageRunCheckpoint` with fields: `name: String`, `state: String`, `started_at: Option<chrono::DateTime<chrono::Utc>>`, `completed_at: Option<chrono::DateTime<chrono::Utc>>`, `exit_code: Option<i32>`. Derive same traits.
- [ ] For all `Option<T>` timestamp fields, annotate with `#[serde(default)]` (for absent → None on deser) but do NOT use `#[serde(skip_serializing_if = "Option::is_none")]` — this ensures `null` is serialized explicitly per [2_TAS-REQ-021B].
- [ ] Implement `CheckpointStore` with method `save(dir: &Path, checkpoint: &Checkpoint) -> Result<(), CheckpointError>`:
  1. Serialize `checkpoint` to pretty JSON via `serde_json::to_string_pretty`.
  2. Write bytes to `dir.join(".checkpoint.json.tmp")` using `std::fs::write`.
  3. Call `std::fs::rename(tmp_path, dir.join("checkpoint.json"))`.
- [ ] Implement `CheckpointStore::load(dir: &Path) -> Result<Option<Checkpoint>, CheckpointError>`:
  1. Check if `dir.join("checkpoint.json")` exists; if not, return `Ok(None)`.
  2. Ignore any `.checkpoint.json.tmp` file.
  3. Read and deserialize `checkpoint.json`.
- [ ] Define `CheckpointError` enum with variants: `Io(std::io::Error)`, `Serialization(serde_json::Error)`.

## 3. Code Review
- [ ] Confirm `std::fs::rename()` is the mechanism for atomicity — no intermediate state where `checkpoint.json` is partially written.
- [ ] Confirm no `skip_serializing_if` on any `Option` timestamp field.
- [ ] Confirm `#[serde(default)]` on optional fields for forward-compat deserialization.
- [ ] Confirm `.tmp` files are never loaded by the reader.
- [ ] Confirm `CheckpointError` implements `std::error::Error` and `Display`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- checkpoint_atomic_tests` and ensure all 5 tests pass.
- [ ] Run `cargo clippy -p devs-checkpoint -- -D warnings` with no warnings.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-021A` comment above the atomic write logic in `save()`.
- [ ] Add `// Covers: 2_TAS-REQ-021B` comment above the serialization config and the absent-field deserialization test.
- [ ] Add module-level doc comment on `CheckpointStore` explaining the atomic write strategy and null-serialization policy.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-checkpoint 2>&1 | grep -E "test result:"` and confirm `0 failed`.
- [ ] Run a one-liner that serializes a checkpoint with `None` timestamps and pipes through `jq '.completed_at'` to confirm the output is `null` (not absent). Alternatively, assert this within the test itself.

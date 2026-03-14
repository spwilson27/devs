# Task: Implement UUID v4 ID Types (Sub-Epic: 009_Core Domain Types)

## Covered Requirements
- [2_TAS-REQ-031]

## Dependencies
- depends_on: ["01_implement_bounded_string_and_env_key.md"]
- shared_components: [devs-core (owner — this task adds ID types to devs-core)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/types/id.rs` with `#[cfg(test)] mod tests` containing:
  - **RunId generation tests:**
    - `test_run_id_new_is_v4`: `RunId::new()` returns a value whose inner UUID has `get_version() == Some(Version::Random)`.
    - `test_run_id_unique`: Two calls to `RunId::new()` produce different values.
  - **Serialization tests ([2_TAS-REQ-031]):**
    - `test_run_id_serialize_lowercase_hyphenated`: `serde_json::to_string(&run_id)` produces a quoted string matching regex `^"[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"$`.
    - `test_run_id_deserialize_valid`: `serde_json::from_str::<RunId>("\"6ba7b810-9dad-41d1-80b4-00c04fd430c8\"")` succeeds.
    - `test_run_id_deserialize_non_uuid_fails`: `serde_json::from_str::<RunId>("\"not-a-uuid\"")` returns an error.
    - `test_run_id_deserialize_uppercase_normalizes_or_fails`: `serde_json::from_str::<RunId>("\"6BA7B810-9DAD-41D1-80B4-00C04FD430C8\"")` — verify behavior. The `uuid` crate accepts case-insensitively but serializes lowercase, so this should succeed and re-serialize as lowercase.
  - **Display test:**
    - `test_run_id_display_matches_serialize`: `format!("{}", run_id)` produces the same lowercase hyphenated string as serialization (without quotes).
  - **StageId tests:** Mirror all the above tests for `StageId` to ensure consistent behavior.
  - **Equality and hashing:**
    - `test_id_eq_hash`: Two IDs constructed from the same UUID string are equal and have the same hash.
    - `test_id_ne`: Two IDs from different UUIDs are not equal.
  - **Annotate all tests with `// Covers: 2_TAS-REQ-031`.**

## 2. Task Implementation
- [ ] Add `uuid = { version = "1", features = ["v4", "serde"] }` to `crates/devs-core/Cargo.toml` under `[dependencies]`.
- [ ] Implement `RunId` in `crates/devs-core/src/types/id.rs`:
  - Tuple struct: `pub struct RunId(Uuid)`.
  - `pub fn new() -> Self` — calls `Uuid::new_v4()`.
  - `pub fn as_uuid(&self) -> &Uuid` for controlled access.
  - Derive/implement: `Clone`, `Debug`, `PartialEq`, `Eq`, `Hash`.
  - Implement `Display` outputting lowercase hyphenated (`self.0.as_hyphenated().to_string()`).
  - Implement `FromStr` parsing via `Uuid::parse_str` and wrapping in `RunId`.
  - Implement `Serialize` / `Deserialize` via `uuid`'s serde support (which already serializes as lowercase hyphenated string). The default `uuid` serde uses the hyphenated lowercase format, so `#[serde(transparent)]` on the tuple struct suffices.
- [ ] Implement `StageId` with identical structure to `RunId` (separate type for type safety — a `RunId` cannot be passed where a `StageId` is expected).
- [ ] Add both types to `crates/devs-core/src/types/mod.rs` re-exports.
- [ ] Verify no new forbidden dependencies are introduced (uuid is allowed).

## 3. Code Review
- [ ] Verify `RunId` and `StageId` are distinct types (not type aliases) to prevent accidental mixing.
- [ ] Verify `Uuid::new_v4()` is the only generation method used.
- [ ] Verify serialization round-trip produces lowercase hyphenated format.
- [ ] Verify `#[serde(transparent)]` or equivalent is used so JSON representation is a bare string, not an object.
- [ ] Verify all public items have `///` doc comments referencing [2_TAS-REQ-031].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm zero warnings.

## 5. Update Documentation
- [ ] Add `///` doc comments to `RunId` and `StageId` explaining UUID v4 requirement and serialization format, referencing [2_TAS-REQ-031].

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core 2>&1 | tail -5` and confirm `test result: ok`.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-031" crates/devs-core/` returns at least 1 match.
- [ ] Run `cargo tree -p devs-core` and confirm no forbidden crates (tokio, git2, reqwest, tonic).

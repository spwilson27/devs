# Task: Implement UUID V4 and ID Types (Sub-Epic: 009_Core Domain Types)

## Covered Requirements
- [2_TAS-REQ-031]

## Dependencies
- depends_on: [01_implement_bounded_string_and_env_key.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/src/types/id.rs`:
  - Test `RunID` and `StageID` (wrappers around `Uuid`).
  - Test that `RunID::new()` generates a valid UUID v4.
  - Test that serialization of `RunID` results in a lowercase hyphenated string (e.g. `"6ba7b810-9dad-11d1-80b4-00c04fd430c8"`).
  - Test that deserialization from a non-UUID string or uppercase UUID (if the `uuid` crate allows it) correctly returns a deserialization error as required by [2_TAS-REQ-031].
  - Test that `Display` for `RunID` also produces the hyphenated string.

## 2. Task Implementation
- [ ] Add the `uuid` crate with `v4` and `serde` features to `crates/devs-core/Cargo.toml`.
- [ ] Implement `RunID` as a tuple struct wrapping a `Uuid`.
- [ ] Implement `StageID` as a tuple struct wrapping a `Uuid`.
- [ ] Implement `new()` for both using `Uuid::new_v4()`.
- [ ] Implement `FromStr` for both.
- [ ] Custom `Serialize` and `Deserialize` to ensure lowercase hyphenated string enforcement if the default `uuid` serde behavior differs.
- [ ] Add `Display` and `Debug` implementations.
- [ ] Integrate into `crates/devs-core/src/types/mod.rs`.

## 3. Code Review
- [ ] Verify that UUID v4 is explicitly used (`Uuid::new_v4`).
- [ ] Ensure that lowercase hyphenated string format is strictly followed.
- [ ] Confirm no other dependencies are introduced.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib types::id` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add doc comments for `RunID` and `StageID` referencing [2_TAS-REQ-031].

## 6. Automated Verification
- [ ] Run `grep -r "2_TAS-REQ-031" crates/devs-core/` and ensure the code is annotated.

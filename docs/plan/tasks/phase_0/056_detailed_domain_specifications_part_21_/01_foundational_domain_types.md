# Task: Foundational Domain Types & Length Enforcement (Sub-Epic: 056_Detailed Domain Specifications (Part 21))

## Covered Requirements
- [2_TAS-REQ-153]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core/src/domain/types.rs`, write property-based or table-driven tests for `BoundedString` and `EnvKey`.
- [ ] Verify that `BoundedString` of 128 characters succeeds, but 129 characters returns `ValidationError`.
- [ ] Verify that `EnvKey` of 64 characters succeeds, but 65 characters returns `ValidationError`.
- [ ] Verify that empty strings are rejected if applicable (they should be for these domain types).
- [ ] Verify that `ValidationError` includes the field name and the reason (too long).

## 2. Task Implementation
- [ ] Define the `ValidationError` enum in `devs-core/src/error.rs` (if not already present).
- [ ] Implement `BoundedString` as a newtype wrapper around `String` in `devs-core/src/domain/types.rs`.
- [ ] Implement `EnvKey` as a newtype wrapper around `String`.
- [ ] Use `TryFrom<String>` or a `new()` method that returns `Result<Self, ValidationError>` to enforce length limits.
- [ ] Ensure the length check is performed at construction time as per [2_TAS-REQ-153].
- [ ] Implement `Deref` or a `as_str()` method to allow access to the underlying string.

## 3. Code Review
- [ ] Verify that `BoundedString` and `EnvKey` are opaque types that cannot be constructed without validation.
- [ ] Check that `devs-core` does not import any I/O crates as per [2_TAS-REQ-414] (even if it's not strictly this task, it's good practice).
- [ ] Ensure doc comments are present for all types and methods.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify the implementation.

## 5. Update Documentation
- [ ] Add doc comments to `BoundedString` and `EnvKey` explaining the constraints.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the requirements coverage script detects the tests.

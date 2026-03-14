# Task: Multi-Error Validation Framework (Sub-Epic: 046_Detailed Domain Specifications (Part 11))

## Covered Requirements
- [2_TAS-REQ-104]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (owner — creates ValidationError, ValidationErrorCode)]

## 1. Initial Test Written
- [ ] Create tests in `devs-core/src/validation.rs` (inline `#[cfg(test)]` module) with `// Covers: 2_TAS-REQ-104` annotations:
- [ ] **All 12 error code variants exist**: Write a test that constructs a `ValidationError` for each of the 12 `ValidationErrorCode` variants (`SchemaMissing`, `FieldTooLong`, `DuplicateName`, `UnknownDependency`, `CycleDetected`, `UnknownPool`, `UnknownHandler`, `TypeMismatch`, `MutuallyExclusive`, `IncompatibleOptions`, `ValueOutOfRange`, `EmptyCollection`) and asserts they are distinct via `PartialEq`.
- [ ] **Multi-error collection (EC-C03-04)**: Create a mock validation function that checks a struct with 5 deliberate errors (duplicate name, cycle, unknown pool, two unknown dependencies). Assert the result is `Vec<ValidationError>` with exactly 5 entries — none suppressed.
- [ ] **Field path propagation**: Construct a `ValidationError` with `field: Some("pool[0].agent[1].tool".into())` and assert the field is preserved.
- [ ] **Field path absent**: Construct a `ValidationError` with `field: None` (e.g., for `CycleDetected` which is graph-global, not field-specific) and assert `field.is_none()`.
- [ ] **CycleDetected message includes cycle path**: Create a `CycleDetected` error with `message: "cycle: a -> b -> c -> a"` and assert the message contains the full cycle path.
- [ ] **Empty input returns empty vec**: Validate a correct struct and assert the result is an empty `Vec<ValidationError>`.
- [ ] **Single error still returns vec**: A struct with exactly one issue returns `Vec` of length 1, not a bare error.
- [ ] **Order preservation**: Errors are returned in the order they were encountered during the validation pass.

## 2. Task Implementation
- [ ] Create `devs-core/src/validation.rs` and add `pub mod validation;` to `lib.rs`.
- [ ] Define `ValidationError` struct:
    ```rust
    #[derive(Debug, Clone, PartialEq, Eq)]
    pub struct ValidationError {
        pub code: ValidationErrorCode,
        pub message: String,
        pub field: Option<String>,  // dotted field path, e.g. "pool[0].name"
    }
    ```
- [ ] Define `ValidationErrorCode` enum with exactly these 12 variants, all deriving `Debug, Clone, Copy, PartialEq, Eq`:
    ```rust
    pub enum ValidationErrorCode {
        SchemaMissing,
        FieldTooLong,
        DuplicateName,
        UnknownDependency,
        CycleDetected,
        UnknownPool,
        UnknownHandler,
        TypeMismatch,
        MutuallyExclusive,
        IncompatibleOptions,
        ValueOutOfRange,
        EmptyCollection,
    }
    ```
- [ ] Implement `Display` for both `ValidationError` and `ValidationErrorCode` with human-readable messages.
- [ ] Implement `std::error::Error` for `ValidationError`.
- [ ] Create a `ValidationCollector` helper (or use a simple `Vec<ValidationError>` pattern) that downstream validators use:
    ```rust
    pub struct ValidationCollector {
        errors: Vec<ValidationError>,
    }
    impl ValidationCollector {
        pub fn new() -> Self;
        pub fn add(&mut self, code: ValidationErrorCode, message: impl Into<String>, field: Option<String>);
        pub fn finish(self) -> Result<(), Vec<ValidationError>>;  // Ok if empty, Err if any
        pub fn has_errors(&self) -> bool;
    }
    ```
- [ ] Re-export all public types from `devs-core/src/lib.rs`.

## 3. Code Review
- [ ] Confirm all 12 `ValidationErrorCode` variants from [2_TAS-REQ-104] are present — no extras, no omissions.
- [ ] Verify that the validation pattern is collect-all, not fail-fast: the `ValidationCollector` never short-circuits after the first error.
- [ ] Verify `field` uses dot-notation for nested paths (e.g., `"pool[0].agent[1].tool"`).
- [ ] Confirm `CycleDetected` variant's message convention includes the full cycle path string.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- validation` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` with zero warnings.

## 5. Update Documentation
- [ ] Add doc comments to `ValidationError`, `ValidationErrorCode` (each variant), and `ValidationCollector` explaining the multi-error collection pattern and when each error code applies.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `target/traceability.json` includes coverage for `2_TAS-REQ-104`.
- [ ] Run `./do lint` and confirm zero errors.

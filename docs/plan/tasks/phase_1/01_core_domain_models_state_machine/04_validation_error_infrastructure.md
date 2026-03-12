# Task: Multi-Error Validation Infrastructure (Sub-Epic: 01_Core Domain Models & State Machine)

## Covered Requirements
- [2_TAS-REQ-032]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write unit tests for `ValidationError` in `devs-core/src/validation.rs`.
- [ ] Write tests verifying that multiple errors can be accumulated and reported in a single `Vec`.
- [ ] Write tests verifying the standard error format: code, message, and optional field path.
- [ ] Verifies [2_TAS-REQ-032] (infrastructure portion).

## 2. Task Implementation
- [ ] Define `ValidationError` enum or struct in `devs-core/src/validation.rs`.
- [ ] Structure: `code: String`, `message: String`, `field_path: Option<String>`.
- [ ] Implement a `ValidationCollector` trait or utility that can accumulate errors during a validation sequence.
- [ ] Ensure that it supports collecting errors from nested validation checks.
- [ ] Implement `Display` and `Error` traits for `ValidationError` to allow ergonomic reporting.
- [ ] Implements [2_TAS-REQ-032] (foundational infrastructure).

## 3. Code Review
- [ ] Verify that the `ValidationError` structure matches the requirements in TAS §4.2.5.
- [ ] Ensure that error accumulation logic is robust and easy to use across the workspace.
- [ ] Verify that the field path representation follows a clear, machine-parseable convention (e.g., `workflow.stage[0].name`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and verify all validation error infrastructure tests pass.

## 5. Update Documentation
- [ ] Add doc comments for the `ValidationError` type and its accumulation utilities.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` to ensure traceability for the implemented REQ IDs.

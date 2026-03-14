# Task: Verify Workspace Clippy Cleanliness (Sub-Epic: 074_Detailed Domain Specifications (Part 39))

## Covered Requirements
- [2_TAS-REQ-448]

## Dependencies
- depends_on: ["02_verify_formatting_consistency.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create a test case `test_cargo_clippy_passes` in `tests/lint_acceptance.rs`:
  - Use `std::process::Command` to run `cargo clippy --workspace --all-targets --all-features -- -D warnings`.
  - Assert the command exits with code 0.
  - On failure, capture stderr and print it so the developer can see exactly which clippy lints are triggered.
- [ ] Add `// Covers: 2_TAS-REQ-448` annotation to the test.

## 2. Task Implementation
- [ ] Fix all clippy warnings across the workspace so that `cargo clippy --workspace --all-targets --all-features -- -D warnings` exits 0.
- [ ] Ensure that workspace-level `Cargo.toml` or `clippy.toml` does not suppress warnings that should be caught (e.g., do not blanket-allow categories that `-D warnings` is meant to catch).
- [ ] Ensure `./do lint` includes the exact clippy invocation `cargo clippy --workspace --all-targets --all-features -- -D warnings` as step 2 (after formatting).
- [ ] Verify that `--all-targets` is present so that clippy analyzes test code, benchmarks, and examples in addition to library/binary targets.
- [ ] Verify that `--all-features` is present so that feature-gated code paths are also analyzed.

## 3. Code Review
- [ ] Confirm that no `#[allow(clippy::...)]` annotations exist without a `reason = "..."` attribute (per project policy from other sub-epics).
- [ ] Verify the clippy command includes `--workspace`, `--all-targets`, and `--all-features`.
- [ ] Check that `-D warnings` (deny warnings) is passed after `--` to ensure warnings are treated as errors.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo clippy --workspace --all-targets --all-features -- -D warnings` and confirm exit code 0.
- [ ] Run `cargo test --test lint_acceptance -- test_cargo_clippy_passes` and confirm it passes.

## 5. Update Documentation
- [ ] If a project-level status tracking document exists, mark [2_TAS-REQ-448] as verified.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm the clippy step passes.
- [ ] Run `cargo test --test lint_acceptance -- test_cargo_clippy_passes` and assert exit code 0.
- [ ] Verify traceability: `grep '2_TAS-REQ-448' tests/lint_acceptance.rs` returns at least one match.

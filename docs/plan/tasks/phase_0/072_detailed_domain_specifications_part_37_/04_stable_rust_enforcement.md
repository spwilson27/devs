# Task: Stable Rust Enforcement (Sub-Epic: 072_Detailed Domain Specifications (Part 37))

## Covered Requirements
- [2_TAS-REQ-438]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write an integration test that recursively scans all `.rs` files in the workspace `src/` and `tests/` directories for the pattern `#!\[feature(` (with optional whitespace variations). The test must assert zero matches are found.
- [ ] Write a test that verifies `rust-toolchain.toml` specifies the `stable` channel (not `nightly` or `beta`).

## 2. Task Implementation
- [ ] Implement a lint check (integration test or script in `./do lint`) that:
  1. Uses `grep -rn '#!\[feature(' --include='*.rs'` (or equivalent Rust-based file scanning) across the entire workspace source tree.
  2. Fails with a non-zero exit code and lists the offending file(s) and line number(s) if any `#![feature(...)]` attributes are found.
- [ ] Ensure `rust-toolchain.toml` at the workspace root specifies `channel = "stable"`.
- [ ] Integrate this check into `./do lint`.

## 3. Code Review
- [ ] Confirm the scan covers all `.rs` files including build scripts (`build.rs`), integration tests, benchmarks, and examples.
- [ ] Confirm the regex correctly matches `#![feature(…)]` but does not false-positive on string literals or comments containing the pattern (or accept that comments/strings are acceptable false-positives since nightly features should not appear even in comments as active code).

## 4. Run Automated Tests to Verify
- [ ] Run the integration test and confirm it passes on the current codebase.
- [ ] Run `rustc --version` and confirm it reports a stable channel version.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-438` annotation to each test.

## 6. Automated Verification
- [ ] Run `./do lint` and verify exit code 0.
- [ ] Temporarily add `#![feature(test)]` to a source file, run the lint, confirm it fails, then revert.

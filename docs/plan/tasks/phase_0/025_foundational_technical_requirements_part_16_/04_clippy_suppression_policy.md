# Task: Implement Clippy Suppression Policy Enforcement (Sub-Epic: 025_Foundational Technical Requirements (Part 16))

## Covered Requirements
- [2_TAS-REQ-012D]

## Dependencies
- depends_on: ["03_clippy_configuration.md"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write a test that creates a temporary Rust source file containing `#[allow(clippy::needless_return)] // REASON: required for macro compatibility` and asserts `./do lint` passes the suppression policy check for this file.
- [ ] Write a test that creates a temporary Rust source file containing `#[allow(clippy::needless_return)]` (no `// REASON:` comment) and asserts `./do lint` exits non-zero with an error message identifying the offending line.
- [ ] Write a test that creates a file with `#[allow(clippy::some_lint)] // This is a comment but not REASON:` and asserts `./do lint` rejects it (the comment must contain `REASON:`).
- [ ] Write a test with multiple suppressions in one file — one valid (with `REASON:`) and one invalid (without) — and asserts the invalid one is reported.
- [ ] Write a test that `#[allow(clippy::` patterns inside string literals or comments (not actual attributes) do NOT trigger false positives.

## 2. Task Implementation
- [ ] In the `./do` script's `lint` subcommand, add a custom check step (after the clippy step) that:
  1. Uses `grep -rn '#\[allow(clippy::' --include='*.rs'` across the workspace to find all clippy suppression attributes.
  2. For each match, checks that the same line or immediately following content contains `// REASON:`.
  3. If any suppression lacks a `// REASON:` comment, prints the file path, line number, and offending line to stderr, then exits non-zero.
- [ ] Ensure the grep pattern only matches actual Rust attributes (lines starting with `#[allow(clippy::`) and not occurrences inside string literals. A pragmatic approach: match lines containing `#[allow(clippy::` that are not inside block comments or raw strings. Document known limitations if any.
- [ ] The error message should be clear, e.g.: `ERROR: Clippy suppression without REASON: comment at src/foo.rs:42`

## 3. Code Review
- [ ] Verify the grep pattern correctly identifies `#[allow(clippy::...)]` attributes.
- [ ] Verify the REASON check is case-sensitive and requires the exact string `REASON:`.
- [ ] Verify the check runs as part of `./do lint` and its failure causes `./do lint` to exit non-zero.
- [ ] Verify the check does not interfere with workspace-level `[workspace.lints.clippy]` configuration in `Cargo.toml`.

## 4. Run Automated Tests to Verify
- [ ] Run all tests from step 1 and confirm they pass.
- [ ] Run `./do lint` on the codebase and confirm the suppression check passes (no violations exist).

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-012D` annotations to each test.

## 6. Automated Verification
- [ ] Run `./do lint` end-to-end and confirm exit code 0.
- [ ] Temporarily add a `#[allow(clippy::todo)]` without a REASON comment to a source file, run `./do lint`, confirm it fails with the expected error, then revert.

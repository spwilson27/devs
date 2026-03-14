# Task: Doc Comment and Clippy Reason Enforcement (Sub-Epic: 039_Detailed Domain Specifications (Part 4))

## Covered Requirements
- [1_PRD-REQ-049]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script & CI Pipeline" (consume)]

## 1. Initial Test Written
- [ ] Create `tests/lint/test_doc_comment_enforcement.sh` (POSIX sh) that:
    - Creates a temporary Cargo project with a single `lib.rs` containing `pub fn undocumented() {}` (no doc comment).
    - Runs `cargo doc --no-deps` on it and asserts the command exits non-zero or emits a warning when `missing_docs = "deny"` is set in `[lints.rust]`.
    - Creates a second temporary project where all public items have `///` doc comments and asserts `cargo doc --no-deps` exits zero.
- [ ] Create `tests/lint/test_clippy_reason_enforcement.sh` that:
    - Creates a temporary `.rs` file containing `#[allow(clippy::needless_pass_by_value)]` with NO `// REASON:` comment on the same or preceding line.
    - Runs the clippy-reason checker (a grep/awk script invoked by `./do lint`) and asserts it exits non-zero with a message identifying the offending line.
    - Creates a file with `#[allow(clippy::needless_pass_by_value)] // REASON: API compatibility` and asserts the checker exits zero.
- [ ] Add a Rust integration test in `tests/lint_integration.rs` that invokes `./do lint` on a known-clean workspace and asserts exit code 0.

## 2. Task Implementation
- [ ] In the workspace-level `Cargo.toml`, under `[workspace.lints.rust]`, add `missing_docs = "deny"`. Ensure all member crates inherit this via `[lints] workspace = true` in their own `Cargo.toml`.
- [ ] Add doc comments (`//!` crate-level and `///` item-level) to every existing public item across all workspace crates so the build passes with the new lint.
- [ ] In `./do lint`, add a step that runs `cargo doc --workspace --no-deps --document-private-items 2>&1` and fails the lint if the exit code is non-zero or if stderr contains `warning:`.
- [ ] In `./do lint`, add a clippy-reason enforcement step: a shell command that searches all `.rs` files for `#[allow(clippy::` and verifies each occurrence has a `// REASON:` annotation on the same line or the immediately preceding line. Exit non-zero and list offending files/lines if any are missing.
- [ ] Ensure `./do lint` aggregates all sub-step exit codes and fails if any sub-step fails.

## 3. Code Review
- [ ] Verify `missing_docs = "deny"` is set at workspace level and inherited by all member crates — no crate should override it to `"allow"` or `"warn"`.
- [ ] Verify the clippy-reason grep does not false-positive on `#[allow(clippy::` inside string literals or comments (use a simple heuristic: lines starting with whitespace + `#[allow`).
- [ ] Verify `cargo doc` runs with `--no-deps` to avoid documenting external dependencies.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/lint/test_doc_comment_enforcement.sh` and confirm both positive and negative cases pass.
- [ ] Run `sh tests/lint/test_clippy_reason_enforcement.sh` and confirm both positive and negative cases pass.
- [ ] Run `./do lint` on the full workspace and confirm exit code 0.

## 5. Update Documentation
- [ ] Add a "Lint Policy" section to `CONTRIBUTING.md` (or `docs/dev/lint_policy.md`) documenting: (a) all public items require doc comments, (b) all `#[allow(clippy::...)]` require `// REASON:` annotations.

## 6. Automated Verification
- [ ] Run `./do lint` — must exit 0 on the clean workspace.
- [ ] Temporarily remove a doc comment from a public item, run `./do lint`, and confirm it exits non-zero. Restore the doc comment.
- [ ] Temporarily add a bare `#[allow(clippy::todo)]` without a reason, run `./do lint`, and confirm it exits non-zero. Remove the line.

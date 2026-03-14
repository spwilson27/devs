# Task: Workspace Safety Lint and Resolver Configuration (Sub-Epic: 021_Foundational Technical Requirements (Part 12))

## Covered Requirements
- [2_TAS-REQ-004B], [2_TAS-REQ-004D]

## Dependencies
- depends_on: none
- shared_components: none (this task configures the workspace root `Cargo.toml`)

## 1. Initial Test Written
- [ ] Create a test script or integration test at `tests/workspace_policy_test.rs` (or a shell-based check in `./do lint`) that:
  1. Parses the root `Cargo.toml` and asserts `resolver = "2"` is set under `[workspace]`.
  2. Parses the root `Cargo.toml` and asserts `unsafe_code = "deny"` is present in `[workspace.lints.rust]`.
  3. Scans all `*.rs` files in the workspace (`src/`, `crates/`) and asserts zero occurrences of `unsafe {` or `unsafe fn` blocks authored in workspace code (excluding vendored dependencies and generated code under `src/gen/`).
- [ ] Write a `#[test]` that attempts to compile a small inline snippet containing `unsafe {}` under `#[deny(unsafe_code)]` and confirms the compile error, validating the lint is active. Alternatively, rely on `cargo clippy --workspace` with the workspace lint table to verify the deny is enforced.

## 2. Task Implementation
- [ ] In the root `Cargo.toml`, under the `[workspace]` table, ensure `resolver = "2"` is declared. If the `[workspace]` table already exists, add the key; otherwise create the table.
- [ ] In the root `Cargo.toml`, add or update the `[workspace.lints.rust]` table to include:
  ```toml
  [workspace.lints.rust]
  unsafe_code = "deny"
  ```
- [ ] In every workspace member crate's `Cargo.toml`, add `[lints] workspace = true` so each crate inherits the workspace lint configuration. If crates do not yet exist, document that this step applies when crates are created.
- [ ] Verify that `cargo check --workspace` succeeds with no `unsafe` code warnings/errors from workspace-authored code.

## 3. Code Review
- [ ] Confirm `resolver = "2"` appears exactly once, in the `[workspace]` section of the root `Cargo.toml`.
- [ ] Confirm `unsafe_code = "deny"` appears in `[workspace.lints.rust]` and is not overridden by any member crate.
- [ ] Confirm no workspace-authored `.rs` file contains `unsafe` blocks.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo check --workspace` and confirm exit code 0.
- [ ] Run `cargo clippy --workspace -- -D unsafe_code` and confirm exit code 0.
- [ ] Run any test scripts created in step 1 and confirm they pass.

## 5. Update Documentation
- [ ] Add a brief note in the root `Cargo.toml` as a comment: `# [2_TAS-REQ-004B] unsafe_code denied workspace-wide` and `# [2_TAS-REQ-004D] v2 feature resolver`.

## 6. Automated Verification
- [ ] Run `grep -q 'resolver = "2"' Cargo.toml && echo PASS || echo FAIL` — must print PASS.
- [ ] Run `grep -q 'unsafe_code.*=.*"deny"' Cargo.toml && echo PASS || echo FAIL` — must print PASS.
- [ ] Run `cargo check --workspace 2>&1` — must exit 0 with no unsafe_code errors.

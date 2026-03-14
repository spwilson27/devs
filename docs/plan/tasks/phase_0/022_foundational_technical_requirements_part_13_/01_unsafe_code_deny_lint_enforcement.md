# Task: Enforce unsafe_code = "deny" Lint and ./do lint Verification (Sub-Epic: 022_Foundational Technical Requirements (Part 13))

## Covered Requirements
- [2_TAS-REQ-004G]

## Dependencies
- depends_on: []
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create a test script or integration test that runs `cargo clippy --workspace -- -D unsafe_code` and asserts exit code 0 on the current (clean) workspace
- [ ] Create a test that introduces a temporary Rust file containing an `unsafe {}` block in a workspace crate, runs `cargo clippy --workspace -- -D unsafe_code`, and asserts the command exits non-zero with an error message referencing `unsafe_code`
- [ ] Create a test that introduces a temporary Rust file containing `#[allow(unsafe_code)]` in a workspace crate, runs `cargo clippy --workspace -- -D unsafe_code`, and asserts the command exits non-zero
- [ ] If `./do lint` already exists, write a shell-level test that runs `./do lint` on a workspace containing an `unsafe` block and asserts failure; on a clean workspace asserts success

## 2. Task Implementation
- [ ] In `Cargo.toml` (workspace root), ensure the `[workspace.lints.rust]` table contains `unsafe_code = "deny"`. If the table does not exist, create it
- [ ] In every workspace member `Cargo.toml`, ensure `[lints] workspace = true` is set so the workspace lint table is inherited
- [ ] In `./do lint` (or the lint step of the `./do` script), add a step that runs `cargo clippy --workspace --all-targets -- -D unsafe_code` and fails the lint if any `unsafe` usage is found
- [ ] Verify that the deny applies to all workspace source files (lib, bin, tests, examples)

## 3. Code Review
- [ ] Confirm the lint is set at the workspace level so individual crates cannot override it without modifying the root manifest
- [ ] Confirm no existing source files contain `unsafe` blocks or `#[allow(unsafe_code)]`
- [ ] Confirm the `./do lint` step surfaces clippy's error output clearly to the developer

## 4. Run Automated Tests to Verify
- [ ] Run `cargo clippy --workspace --all-targets -- -D unsafe_code` and confirm exit code 0
- [ ] Run the negative test (injected `unsafe` block) and confirm it fails

## 5. Update Documentation
- [ ] Add a note in any contributing/development docs that `unsafe` code is workspace-denied per [2_TAS-REQ-004G]

## 6. Automated Verification
- [ ] Run `./do lint` end-to-end and confirm exit code 0 on the clean workspace
- [ ] Run `grep -r "unsafe" --include="*.rs" crates/` and confirm no hits (excluding test fixtures if any)

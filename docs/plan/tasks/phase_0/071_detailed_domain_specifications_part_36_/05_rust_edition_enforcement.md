# Task: Rust Edition 2021 Enforcement Across Workspace (Sub-Epic: 071_Detailed Domain Specifications (Part 36))

## Covered Requirements
- [2_TAS-REQ-434]

## Dependencies
- depends_on: []
- shared_components: []

## 1. Initial Test Written
- [ ] Create a test in `tests/edition_enforcement.rs` (workspace-level) or add to the `./do lint` script logic that:
  1. Finds all `Cargo.toml` files in the workspace (root and all member crates).
  2. Parses each as TOML.
  3. For every crate that declares a `[package]` section, asserts `edition = "2021"`.
  4. Fails with a clear message listing any violating crate if `edition` is missing or set to a value other than `"2021"`.
  5. Add `// Covers: 2_TAS-REQ-434` annotation.
- [ ] Add a lint step in `./do lint` that runs this check. The check should:
  1. Use `cargo metadata --no-deps --format-version 1` to list all workspace members.
  2. For each member, verify the `edition` field equals `"2021"`.
  3. Exit non-zero if any member violates the constraint.

## 2. Task Implementation
- [ ] In the root `Cargo.toml`, set `edition = "2021"` in `[workspace.package]` (if using workspace inheritance) so all member crates inherit it by default.
- [ ] Audit every existing member crate `Cargo.toml` — if any explicitly sets `edition` to a value other than `"2021"`, change it to `"2021"`. If a crate uses `edition.workspace = true`, confirm the workspace value is `"2021"`.
- [ ] Implement the lint check as a shell function in `./do` (or a standalone script called by `./do lint`) that parses `cargo metadata` output and validates editions.

## 3. Code Review
- [ ] Verify the workspace root `Cargo.toml` sets `edition = "2021"`.
- [ ] Verify no member crate overrides the edition to a different value.
- [ ] Verify the lint check catches both missing `edition` fields and wrong values.

## 4. Run Automated Tests to Verify
- [ ] Run the edition enforcement test and confirm it passes.
- [ ] Run `./do lint` and confirm no edition violations are reported.

## 5. Update Documentation
- [ ] Add a comment in the root `Cargo.toml` next to the edition field: `# All crates must use edition 2021 — 2_TAS-REQ-434`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the traceability scanner detects `// Covers: 2_TAS-REQ-434`.
- [ ] Temporarily change one crate's edition to `"2024"`, run `./do lint`, confirm it fails, then revert.

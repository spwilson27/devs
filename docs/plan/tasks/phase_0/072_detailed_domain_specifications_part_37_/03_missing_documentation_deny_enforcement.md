# Task: Missing Documentation Deny Enforcement (Sub-Epic: 072_Detailed Domain Specifications (Part 37))

## Covered Requirements
- [2_TAS-REQ-437]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write an integration test that parses the workspace root `Cargo.toml` `[workspace.lints.rust]` table and asserts `missing_docs` is set to `"deny"`.
- [ ] Write a test that scans every `lib.rs` and `main.rs` in the workspace and asserts none of them contain a per-file `#![deny(missing_docs)]` attribute — the enforcement must come exclusively from the workspace lint table.
- [ ] Write a test that scans every workspace member `Cargo.toml` and asserts each uses `[lints] workspace = true` to inherit the workspace-level setting.

## 2. Task Implementation
- [ ] Add to the workspace root `Cargo.toml`:
  ```toml
  [workspace.lints.rust]
  missing_docs = "deny"
  ```
- [ ] Remove any existing per-file `#![deny(missing_docs)]` attributes from all `lib.rs` and `main.rs` files, replacing them with `[lints] workspace = true` inheritance in the corresponding `Cargo.toml`.
- [ ] Ensure all existing public items have doc comments so the workspace compiles cleanly with this lint active.

## 3. Code Review
- [ ] Verify no per-crate `#![deny(missing_docs)]` or `#![allow(missing_docs)]` attributes exist — the workspace lint table is the sole enforcement point.
- [ ] Verify all public types, functions, and modules have doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run the integration tests and confirm they pass.
- [ ] Run `cargo doc --workspace --no-deps` and confirm it completes without missing-docs errors.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-437` annotation to each test.

## 6. Automated Verification
- [ ] Run `./do lint` and verify exit code 0.
- [ ] Run `cargo build --workspace` and confirm no `missing_docs` errors.

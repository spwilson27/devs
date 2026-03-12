# Task: Enforce Documentation Completeness (Sub-Epic: 070_Detailed Domain Specifications (Part 35))

## Covered Requirements
- [2_TAS-REQ-425]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a new library crate (or use an existing one if available) and add a public item without documentation.
- [ ] Add `#![deny(missing_docs)]` to the crate's `lib.rs`.
- [ ] Run `cargo check -p <crate_name>` and verify it fails with a `missing_docs` error.

## 2. Task Implementation
- [ ] Update the workspace-level lints in the root `Cargo.toml` to include `missing_docs = "deny"` if possible, or manually add `#![deny(missing_docs)]` to the `lib.rs` and `main.rs` of all current library and binary crates.
- [ ] Run `cargo check --workspace` to identify all missing documentation.
- [ ] Add documentation comments (`///` or `//!`) to all public types, functions, and modules in all workspace crates to satisfy the lint.
- [ ] Ensure that even machine-generated code from `devs-proto` does not cause documentation warnings (e.g., by ensuring the generators emit necessary attributes).

## 3. Code Review
- [ ] Verify that all public APIs are well-documented and follow Rust documentation standards.
- [ ] Confirm that no crate has `#![allow(missing_docs)]` unless absolutely necessary (which should be rare and documented with a REASON).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo check --workspace` and ensure it exits 0 with zero warnings.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or the project README to reflect that documentation completeness is now enforced across the entire workspace.

## 6. Automated Verification
- [ ] Run `./do lint` (if available) or `cargo check --workspace` and confirm no documentation warnings or errors are reported.

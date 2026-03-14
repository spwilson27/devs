# Task: Enforce `#![deny(missing_docs)]` in All Library Crates (Sub-Epic: 070_Detailed Domain Specifications (Part 35))

## Covered Requirements
- [2_TAS-REQ-425]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core", "devs-proto", "./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create a shell-based integration test (e.g., `tests/lint_missing_docs.sh` or a Rust `#[test]` in a top-level integration test crate) that runs `cargo check --workspace 2>&1` and asserts the exit code is 0 and stderr contains no `missing_docs` warnings.
- [ ] The test should specifically verify that every library crate (`devs-core`, `devs-proto`, and any other `[lib]` crates present) includes `#![deny(missing_docs)]` in its `lib.rs`. Write a grep-based check: for each `*/src/lib.rs` in the workspace, assert the file contains the exact line `#![deny(missing_docs)]`.
- [ ] Add a `./do lint` sub-step (or verify it already exists) that runs `cargo check --workspace` and fails on any warning. Write a test that invokes `./do lint` and confirms it exits 0.

## 2. Task Implementation
- [ ] In every existing library crate's `src/lib.rs`, add `#![deny(missing_docs)]` as the first inner attribute if not already present.
- [ ] Add doc comments (`///` or `//!`) to every public item (modules, structs, enums, traits, functions, type aliases, constants) in all library crates that currently lack them. Focus on concise, accurate one-line summaries.
- [ ] Ensure `cargo check --workspace` produces zero warnings. Fix any remaining undocumented public items.
- [ ] If `./do lint` does not already include a `cargo check --workspace` step, add it.

## 3. Code Review
- [ ] Verify that `#![deny(missing_docs)]` is present in every `lib.rs` but NOT in `main.rs` (binary crates are excluded).
- [ ] Verify doc comments are meaningful (not just `/// TODO` or `/// Placeholder`).
- [ ] Confirm no `#[allow(missing_docs)]` attributes were added as a workaround.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo check --workspace 2>&1` and confirm exit code 0 with no warnings.
- [ ] Run the grep-based test confirming `#![deny(missing_docs)]` is in all `lib.rs` files.
- [ ] Run `./do lint` and confirm it passes.

## 5. Update Documentation
- [ ] Add a note in the workspace `CLAUDE.md` or equivalent that all library crates enforce `#![deny(missing_docs)]` and new public items must have doc comments.

## 6. Automated Verification
- [ ] Run `cargo check --workspace 2>&1 | grep -c "missing_docs"` and assert the output is `0`.
- [ ] Run `find . -path "*/src/lib.rs" -not -path "*/target/*" | xargs grep -L 'deny(missing_docs)'` and assert no files are listed.

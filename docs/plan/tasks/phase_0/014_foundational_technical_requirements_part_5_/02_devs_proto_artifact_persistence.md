# Task: Proto Generated File Commitment and Rerun-If-Changed (Sub-Epic: 014_Foundational Technical Requirements (Part 5))

## Covered Requirements
- [2_TAS-REQ-001F]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto (consumer)]

## 1. Initial Test Written
- [ ] In `devs-proto/tests/gen_committed.rs`, write a test annotated `// Covers: 2_TAS-REQ-001F` that asserts the directory `devs-proto/src/gen/` exists and contains at least one `.rs` file. Use `std::fs::read_dir` to enumerate entries.
- [ ] Write a test that reads `devs-proto/build.rs` source as a string and asserts it contains `cargo:rerun-if-changed` directives pointing to each `.proto` file in `proto/devs/v1/`. This ensures the regeneration trigger is correctly wired.
- [ ] Write a test that verifies `devs-proto/src/gen/` is NOT listed in any `.gitignore` file at the repo root or in `devs-proto/`. Read each `.gitignore` and assert no line matches `src/gen` or `*.rs` patterns that would exclude the generated files.

## 2. Task Implementation
- [ ] In `devs-proto/build.rs`, configure `tonic-build` (or `prost-build`) to output generated `.rs` files to `src/gen/` rather than `OUT_DIR`. Use `std::env::var("CARGO_MANIFEST_DIR")` to construct the path.
- [ ] Add `cargo:rerun-if-changed=proto/devs/v1/<file>.proto` for every `.proto` file, plus `cargo:rerun-if-changed=build.rs` for itself.
- [ ] Create `devs-proto/src/gen/mod.rs` that re-exports all generated modules. Include this via `pub mod gen;` in `devs-proto/src/lib.rs`.
- [ ] If `protoc` is not available at build time AND `src/gen/` already contains generated files, `build.rs` should print a `cargo:warning` and skip regeneration rather than failing the build. If `src/gen/` is empty and `protoc` is missing, `build.rs` must fail with a clear error message.
- [ ] Ensure `src/gen/` files are committed to git (run `git add devs-proto/src/gen/`).

## 3. Code Review
- [ ] Verify generated files in `src/gen/` compile without warnings under the workspace lint settings.
- [ ] Confirm that downstream crates can `use devs_proto::gen::*` to access generated types.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo build -p devs-proto` and confirm `src/gen/` files are present and up-to-date.
- [ ] Run `cargo test -p devs-proto --test gen_committed` and confirm all tests pass.
- [ ] Run `git status devs-proto/src/gen/` and confirm no uncommitted changes after a fresh build.

## 5. Update Documentation
- [ ] Add a doc comment in `devs-proto/src/lib.rs` explaining that generated files are committed per [2_TAS-REQ-001F] and regenerated when `.proto` sources change.

## 6. Automated Verification
- [ ] Run `cargo build -p devs-proto && cargo test -p devs-proto` end-to-end and confirm exit code 0.
- [ ] Grep test source for `// Covers: 2_TAS-REQ-001F` to confirm traceability annotation.

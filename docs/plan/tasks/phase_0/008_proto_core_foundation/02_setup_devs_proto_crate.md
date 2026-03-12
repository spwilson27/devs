# Task: Setup devs-proto Crate with Code Generation (Sub-Epic: 008_Proto & Core Foundation)

## Covered Requirements
- [2_TAS-REQ-022]

## Dependencies
- depends_on: [01_define_proto_schema.md]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create a temporary integration test `tests/test_proto_compilation.rs` that attempts to import a generated type (e.g., `devs_proto::devs::v1::WorkflowRun`).
- [ ] This test should initially fail to compile as the crate and types do not exist.

## 2. Task Implementation
- [ ] Create the `crates/devs-proto/` directory and initialize it as a Rust library crate.
- [ ] Update the workspace root `Cargo.toml` to include `crates/devs-proto`.
- [ ] Configure `Cargo.toml` in `devs-proto` with `tonic`, `prost`, and `tonic-build` (build dependency).
- [ ] Implement `build.rs` to compile all `.proto` files in `proto/devs/v1/` into Rust source.
- [ ] Configure `build.rs` to write generated files to `src/gen/` within the crate.
- [ ] Implement logic in `build.rs` to detect the absence of `protoc` and skip re-generation while emitting a warning, ensuring the build succeeds using the committed generated files.
- [ ] Implement `lib.rs` to re-export all generated modules under a clean public API, such that types are accessible as `devs_proto::devs::v1::...`.
- [ ] Ensure the `src/gen/` directory and its contents are committed.

## 3. Code Review
- [ ] Verify that `unsafe_code = "deny"` is active in `Cargo.toml`.
- [ ] Verify that doc comments are present for all public items.
- [ ] Ensure that generated files are NOT excluded by `.gitignore`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo build --workspace` and verify that the `devs-proto` crate compiles successfully.
- [ ] Ensure the temporary integration test now compiles.

## 5. Update Documentation
- [ ] Add a note to the crate's `README.md` explaining the `protoc` requirement for regeneration vs. the committed generated files.

## 6. Automated Verification
- [ ] Run `ls crates/devs-proto/src/gen/*.rs` to verify that the generated Rust files exist.
- [ ] Run `cargo check -p devs-proto` and ensure it passes.

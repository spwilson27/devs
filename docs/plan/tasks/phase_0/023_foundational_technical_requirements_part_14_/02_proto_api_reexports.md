# Task: Define Clean Public API Re-exports (Sub-Epic: 023_Foundational Technical Requirements (Part 14))

## Covered Requirements
- [2_TAS-REQ-008C]

## Dependencies
- depends_on: [01_proto_build_script_fallback.md]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create an integration test `tests/test_api_path.rs` that attempts to import `devs_proto::devs::v1::WorkflowRun`.
- [ ] The test should fail to compile if the type is only available via a deep path like `devs_proto::gen::devs_v1::WorkflowRun`.

## 2. Task Implementation
- [ ] Implement `crates/devs-proto/src/gen/mod.rs` to include the generated files.
  - For example: `pub mod v1 { include!("devs.v1.rs"); }`
- [ ] Implement `crates/devs-proto/src/lib.rs` to re-export the generated modules under a clean structure.
  - Expected structure: `pub mod devs { pub mod v1 { pub use crate::gen::v1::*; } }`.
- [ ] Ensure that `WorkflowRun`, `StageRun`, and other core types from the generated code are accessible via `devs_proto::devs::v1::...`.
- [ ] Add necessary `#[allow(clippy::all)]` or `#[allow(non_snake_case)]` to the re-exports if the generated code triggers lints.

## 3. Code Review
- [ ] Verify that downstream crates do NOT need to reach into the `gen` module to access proto types.
- [ ] Confirm that `src/gen/mod.rs` correctly encapsulates the generated files.
- [ ] Ensure all generated modules are re-exported.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo build --workspace` and ensure the integration test compiles and passes.
- [ ] Use `cargo doc -p devs-proto` to verify the public API structure looks clean in the documentation.

## 5. Update Documentation
- [ ] Update `crates/devs-proto/src/lib.rs` with doc comments explaining the module structure and usage conventions for downstream crates.

## 6. Automated Verification
- [ ] Run `grep -r "devs_proto::devs::v1" tests/` to confirm the clean API is being used.
- [ ] Run `cargo check -p devs-proto` and ensure it passes without lint warnings on the re-exported types.

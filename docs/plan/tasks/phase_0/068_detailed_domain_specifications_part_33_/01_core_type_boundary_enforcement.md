# Task: Core Type Boundary Enforcement (Sub-Epic: 068_Detailed Domain Specifications (Part 33))

## Covered Requirements
- [2_TAS-REQ-415]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer), devs-proto (consumer), devs-scheduler (consumer), devs-executor (consumer), devs-pool (consumer)]

## 1. Initial Test Written
- [ ] Create a lint script `tools/check_proto_boundary.sh` that uses `grep -rn 'use devs_proto' crates/devs-scheduler/src/ crates/devs-executor/src/ crates/devs-pool/src/` to find any imports of `devs_proto` types in public API positions. The script must exit non-zero if any matches are found.
- [ ] Write a compile-time test in `crates/devs-scheduler/tests/type_boundary.rs` that asserts all public functions in `devs-scheduler` accept and return only `devs-core` types. Create a test function `test_submit_run_uses_core_types()` that calls `submit_run` and verifies the return type is `devs_core::run::RunId`, not a proto type.
- [ ] Write an equivalent compile-time test in `crates/devs-executor/tests/type_boundary.rs` verifying `prepare_environment` and `run_agent` use `devs_core` types exclusively.
- [ ] Write an equivalent compile-time test in `crates/devs-pool/tests/type_boundary.rs` verifying `acquire_agent` and `get_pool_state` use `devs_core` types exclusively.
- [ ] Add a `./do lint` step that runs `cargo tree -p devs-scheduler --edges normal`, `cargo tree -p devs-executor --edges normal`, and `cargo tree -p devs-pool --edges normal`, piping each through `grep devs-proto` and asserting zero matches (i.e., `devs-proto` is not a normal dependency of these crates).

## 2. Task Implementation
- [ ] Audit every `pub fn`, `pub struct`, `pub enum`, and `pub trait` in `crates/devs-scheduler/src/lib.rs` and its modules. Replace any `devs_proto::v1::*` types with their `devs_core` equivalents (e.g., `devs_proto::v1::WorkflowRun` -> `devs_core::run::WorkflowRun`).
- [ ] Repeat audit for `crates/devs-executor/src/lib.rs` and `crates/devs-pool/src/lib.rs`.
- [ ] Implement `From<devs_core::run::WorkflowRun> for devs_proto::v1::WorkflowRun` and its inverse in `crates/devs-grpc/src/conversions.rs` (the gRPC boundary crate owns these conversions).
- [ ] Implement equivalent conversion traits for `StageRun`, `PoolState`, and any other types that cross the boundary.
- [ ] Remove `devs-proto` from `[dependencies]` in `crates/devs-scheduler/Cargo.toml`, `crates/devs-executor/Cargo.toml`, and `crates/devs-pool/Cargo.toml`. It may remain in `[dev-dependencies]` if needed for conversion tests.
- [ ] Ensure `devs-proto` remains a dependency only of `devs-grpc`, `devs-mcp`, and `devs-cli` (the interface boundary crates).

## 3. Code Review
- [ ] Verify no `use devs_proto` statement exists in any `.rs` file under `crates/devs-scheduler/src/`, `crates/devs-executor/src/`, or `crates/devs-pool/src/`.
- [ ] Confirm all conversion traits are implemented in the interface crates (`devs-grpc`, `devs-mcp`), not in the engine crates.
- [ ] Verify the engine logic is fully agnostic of Protobuf serialization concerns.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo check --workspace` to confirm no compilation errors after refactoring.
- [ ] Run `./do test` to confirm all existing tests still pass.
- [ ] Run the `tools/check_proto_boundary.sh` script and confirm it exits 0.

## 5. Update Documentation
- [ ] Add a `// Covers: 2_TAS-REQ-415` comment to each boundary test and to the lint script.

## 6. Automated Verification
- [ ] Run `cargo tree -p devs-scheduler --edges normal | grep devs-proto` and verify zero output.
- [ ] Run `cargo tree -p devs-executor --edges normal | grep devs-proto` and verify zero output.
- [ ] Run `cargo tree -p devs-pool --edges normal | grep devs-proto` and verify zero output.
- [ ] Run `./do lint` and verify it passes (which now includes the proto boundary check).

# Task: Define Thin Adapter Pattern for gRPC Services (Sub-Epic: 041_Detailed Domain Specifications (Part 6))

## Covered Requirements
- [1_PRD-REQ-062]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/008_proto_core_foundation/03_setup_devs_core_foundation.md]
- shared_components: [devs-core, devs-proto]

## 1. Initial Test Written
- [ ] Create a unit test `crates/devs-core/tests/test_service_traits_purity.rs` (or equivalent in `devs-core` unit tests) that:
  - Uses `grep` or `syn` to verify that no types from `tonic`, `prost`, or `devs-proto` are used in the method signatures of traits defined in `devs_core::domain::services`.
  - Asserts that all service trait methods use only built-in Rust types, `devs-core` types (like `RunID`), or `std` types.

## 2. Task Implementation
- [ ] Create the `crates/devs-core/src/domain/services.rs` module.
- [ ] Define the `WorkflowService` trait with methods like `submit_run`, `get_workflow_definition`.
- [ ] Define the `RunService` trait with methods like `get_run`, `list_runs`, `cancel_run`, `pause_run`, `resume_run`.
- [ ] Define the `PoolService` trait with methods like `get_pool_status`.
- [ ] Define the `ProjectService` trait with methods like `add_project`, `remove_project`, `list_projects`.
- [ ] Ensure that all these traits are `async_trait` (using the `async-trait` crate if needed, or Rust 2024 `async fn` if supported by the workspace toolchain).
- [ ] Ensure that none of these traits depend on transport-specific types.
- [ ] Provide a `MockRunService` implementation in `devs-core` (for testing purposes) that satisfies the `RunService` trait.

## 3. Code Review
- [ ] Verify that the traits are clean and focused on business logic, not gRPC request/response structures.
- [ ] Ensure that error types returned by these traits are domain-specific (e.g., `RunNotFoundError`, `ValidationFailedError`) and not gRPC status codes.
- [ ] Check that `async_trait` usage is consistent across all service traits.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and verify that the purity tests pass.
- [ ] Ensure that the mock implementations correctly satisfy the traits.

## 5. Update Documentation
- [ ] Update `crates/devs-core/README.md` to explain the thin adapter pattern and the role of these domain service traits.

## 6. Automated Verification
- [ ] Run `grep -r "tonic" crates/devs-core/src/domain/services.rs` and `grep -r "prost" crates/devs-core/src/domain/services.rs` and ensure they return no matches.

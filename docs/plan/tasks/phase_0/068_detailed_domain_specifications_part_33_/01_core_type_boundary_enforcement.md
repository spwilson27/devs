# Task: Core Type Boundary Enforcement (Sub-Epic: 068_Detailed Domain Specifications (Part 33))

## Covered Requirements
- [2_TAS-REQ-415]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-proto, devs-scheduler, devs-executor, devs-pool]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-scheduler`, `devs-executor`, and `devs-pool` that attempts to compile a function returning a `devs-proto` type in its public API. The test should technically be a "negative" test or a static check.
- [ ] Create a script `.tools/check_proto_leak.sh` that uses `cargo tree` or `grep` to ensure `devs-proto` is only a direct dependency of crates that MUST have it (like `devs-grpc` and `devs-mcp`).

## 2. Task Implementation
- [ ] Audit the public API (`pub` and `pub(crate)` items) of `devs-scheduler`, `devs-executor`, and `devs-pool`.
- [ ] Replace any `devs-proto` message types (e.g., `devs_proto::v1::WorkflowRun`) with corresponding domain types from `devs-core` (e.g., `devs_core::run::WorkflowRun`).
- [ ] Implement `From` or `Into` traits in `devs-grpc` to convert between `devs-core` domain types and `devs-proto` wire types.
- [ ] Update `Cargo.toml` of `devs-scheduler`, `devs-executor`, and `devs-pool` to remove `devs-proto` from `[dependencies]` if it's no longer needed for types.

## 3. Code Review
- [ ] Verify that `devs-scheduler`, `devs-executor`, and `devs-pool` do not import any types from `devs_proto`.
- [ ] Ensure that the engine logic is entirely agnostic of the Protobuf/gRPC representation.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo check --workspace` to ensure no compilation errors.
- [ ] Run `./do test` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or architectural docs to explicitly state that engine crates must not depend on `devs-proto`.

## 6. Automated Verification
- [ ] Run `cargo tree -p devs-scheduler --edges normal | grep devs-proto` and verify it returns no matches.
- [ ] Repeat for `devs-executor` and `devs-pool`.

# Task: Wire Type Boundary Enforcement (Sub-Epic: 015_Foundational Technical Requirements (Part 6))

## Covered Requirements
- [2_TAS-REQ-001G]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer), devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/tests/wire_type_boundary.rs` with tests that verify `devs-core` public API types do NOT re-export or depend on any `devs-proto` generated types. Use `cargo metadata` or compile-time assertions to confirm that `devs-core` does not have `devs-proto` as a dependency.
- [ ] Write a lint/policy test in `tests/policy/wire_type_isolation.rs` (workspace-level integration test) that programmatically inspects the `Cargo.toml` dependency graphs of `devs-scheduler`, `devs-executor`, and `devs-pool` crates. Assert that none of these crates list `devs-proto` as a direct dependency in their `[dependencies]` section (only in `[dev-dependencies]` if needed for testing).
- [ ] Write a test that verifies any cross-crate function signatures in `devs-scheduler`, `devs-executor`, and `devs-pool` public APIs use `devs-core` domain types (e.g., `WorkflowRunState`, `StageRunState`, `BoundedString`) and NOT protobuf-generated message types.

## 2. Task Implementation
- [ ] Add a workspace-level integration test crate or test file at `tests/policy/` that parses `Cargo.toml` files for `devs-scheduler`, `devs-executor`, and `devs-pool` and asserts `devs-proto` is absent from `[dependencies]`.
- [ ] If any existing code in these crates uses `devs-proto` types in public APIs, refactor to use `devs-core` domain types and add `From`/`Into` conversion traits at crate boundaries (e.g., in `devs-grpc` or `devs-mcp` where proto types are needed for serialization).
- [ ] Add a `./do lint` check that runs `cargo tree -p devs-scheduler -e normal` and greps for `devs-proto`, failing if found. Repeat for `devs-executor` and `devs-pool`. This check should be added as a function in the `./do` script under the `lint` subcommand.
- [ ] Document the boundary rule in `docs/adr/` or inline in `devs-core/src/lib.rs` doc comments: "Wire types from devs-proto must not leak into engine crate public APIs."

## 3. Code Review
- [ ] Verify no `pub` function or struct in `devs-scheduler`, `devs-executor`, or `devs-pool` references any type from the `devs_proto` module.
- [ ] Verify conversion traits (`From<ProtoType> for DomainType` and vice versa) exist at boundary crates (`devs-grpc`, `devs-mcp`) only.
- [ ] Confirm the lint check is integrated into `./do lint` and `./do presubmit`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test wire_type_boundary` and confirm pass.
- [ ] Run the workspace-level policy test: `cargo test --test wire_type_isolation` and confirm pass.
- [ ] Run `./do lint` and confirm the wire-type isolation check passes.

## 5. Update Documentation
- [ ] Add a comment in `devs-core/src/lib.rs` documenting the wire type isolation rule with a reference to `[2_TAS-REQ-001G]`.

## 6. Automated Verification
- [ ] Run `./do presubmit` end-to-end and verify it exits 0 with the new lint check included.
- [ ] Verify `// Covers: 2_TAS-REQ-001G` annotation exists in the policy test file.

# Task: Enforce Interface Layer Logic Separation (Sub-Epic: 013_Foundational Technical Requirements (Part 4))

## Covered Requirements
- [2_TAS-REQ-001A], [2_TAS-REQ-415], [2_TAS-REQ-101]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc, devs-mcp, devs-core, devs-proto]

## 1. Initial Test Written
- [ ] This architectural requirement is primarily verified by code structure.
- [ ] In `devs-grpc`, write a unit test for one service implementation (e.g., `RunService`).
- [ ] Verify that the service method does NOT contain `if/else` business logic.
- [ ] Mock the underlying `devs-scheduler` or `devs-pool` component.
- [ ] Verify that the service method only:
  1. Translates from proto to core types.
  2. Calls exactly ONE engine layer method.
  3. Translates from core types back to proto.
- [ ] Add a similar test for an MCP tool in `devs-mcp`.

## 2. Task Implementation
- [ ] In `devs-grpc`, define gRPC service traits based on `devs-proto`.
- [ ] In the implementation of these services, ensure that all logic is delegated to `devs-scheduler`, `devs-pool`, or `devs-core`.
- [ ] In `devs-mcp`, ensure that tool handlers are thin wrappers around engine components.
- [ ] Use `devs-core` types for all cross-crate boundaries (per `2_TAS-REQ-415`).
- [ ] Add a comment or lint suppression if an exception is truly needed, with a clear REASON.

## 3. Code Review
- [ ] Confirm that `devs-grpc` and `devs-mcp` only depend on `devs-proto`, `devs-core`, and the specific engine crates they call.
- [ ] Verify that no business logic (e.g., "if status is X, transition to Y") is implemented in the interface layer.
- [ ] Check for direct calls to `git2`, `tokio`, or `reqwest` in the interface layer; these should be delegated.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo build --workspace` to ensure dependency isolation is maintained.
- [ ] Run `./do lint` to check for dependency audit compliance (no `tonic` in `devs-core`, etc.).

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect the interface layer's role as a thin adapter.

## 6. Automated Verification
- [ ] Run `cargo tree -p devs-grpc --edges normal` and verify it correctly depends on engine crates for all logic.
- [ ] Ensure that `devs-core` remains free of network/filesystem I/O (per `2_TAS-REQ-414`).

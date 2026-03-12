# Task: Workflow Cycle Detection Acceptance (Sub-Epic: 083_Detailed Domain Specifications (Part 48))

## Covered Requirements
- [2_TAS-REQ-493]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-config` (or the server module if that's where `submit_run` logic is) for workflow validation.
- [ ] Define a workflow with a circular dependency (e.g., Stage A depends on Stage B, Stage B depends on Stage A).
- [ ] Attempt to submit this workflow (mocking the `RunService` if necessary).
- [ ] Verify that the operation returns a `gRPC status` of `INVALID_ARGUMENT`.
- [ ] Verify that the error detail contains the string `"cycle detected"`.
- [ ] Verify that the error response includes an array of stage IDs representing the cycle (e.g., `["A", "B", "A"]`).
- [ ] In another test, define a deep DAG (no cycles) and verify that it is NOT rejected as having a cycle.

## 2. Task Implementation
- [ ] In the workflow definition validation logic (likely in `devs-config`'s `WorkflowDefinition::validate` or a specialized validator), implement a cycle detection algorithm (e.g., using a Depth First Search with path tracking).
- [ ] When a cycle is detected, capture the nodes forming the cycle in their encounter order.
- [ ] Update the server's `RunService` (or where `submit_run` is implemented) to catch this validation error.
- [ ] Map the validation error to a `tonic::Status::invalid_argument` (gRPC `INVALID_ARGUMENT`).
- [ ] Ensure the error message and details are formatted as required by the specification.

## 3. Code Review
- [ ] Verify that the cycle detection algorithm is efficient and handles complex graphs (e.g. multiple disconnected components).
- [ ] Confirm that the error format matches the requirement exactly, including the cycle node list.
- [ ] Ensure the code is documented and uses idiomatic Rust (e.g. using `petgraph` if available, or a simple DFS if not).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` and ensure the cycle detection tests pass.

## 5. Update Documentation
- [ ] Document the cycle detection behavior and the expected gRPC error format for client developers.

## 6. Automated Verification
- [ ] Run `./do verify_requirements.py` to ensure `[2_TAS-REQ-493]` is correctly mapped to the test.

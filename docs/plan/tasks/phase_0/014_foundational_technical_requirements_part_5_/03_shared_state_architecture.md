# Task: Shared In-Process State Architecture (Sub-Epic: 014_Foundational Technical Requirements (Part 5))

## Covered Requirements
- [2_TAS-REQ-001B], [2_TAS-REQ-001C]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-server` that initializes the `State` struct, passes it via `Arc` to two mock handlers (simulating gRPC and MCP servers), and asserts that a state change made by one is visible to the other.
- [ ] Create a unit test for a mock infrastructure component and verify that it does not hold any internal state between invocations (rely on state passed in the operation context).

## 2. Task Implementation
- [ ] Define the `State` struct in `devs-core`. This struct will serve as the authoritative container for all internal application state.
- [ ] Ensure `State` implements internal mutability (e.g., using `Mutex` or `RwLock` from `parking_lot`) where necessary, while being safe to share across threads via `Arc`.
- [ ] Implement a `State` initialization function that will be called at server startup in `devs-server`.
- [ ] Define the interface pattern for gRPC and MCP server handlers to receive an `Arc<State>` instance.
- [ ] Create a `Context` object in `devs-core` that can be passed to infrastructure layer components, containing only the state relevant to the current operation.
- [ ] Verify that infrastructure components (like `devs-checkpoint` or `devs-adapters`) do not hold any mutable shared state outside of their own internal caches.

## 3. Code Review
- [ ] Ensure the global state encapsulation pattern follows the "Glass-Box" philosophy, where all relevant state is accessible and observable.
- [ ] Confirm that state transitions are handled atomically within the same Tokio scheduler cycle.
- [ ] Verify that infrastructure components remain stateless with respect to the application's business logic.

## 4. Run Automated Tests to Verify
- [ ] Run the `devs-server` integration test to confirm state sharing works as expected.
- [ ] Verify that `devs-core` unit tests for state mutability pass.
- [ ] Confirm that no global `static mut` state is used anywhere in the codebase (except for legitimate constant data).

## 5. Update Documentation
- [ ] Document the `State` encapsulation and sharing pattern in `devs-core/README.md`.
- [ ] Add architectural guidelines regarding stateless infrastructure components to the project's internal documentation.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure [2_TAS-REQ-001B] and [2_TAS-REQ-001C] are correctly mapped to these tests.

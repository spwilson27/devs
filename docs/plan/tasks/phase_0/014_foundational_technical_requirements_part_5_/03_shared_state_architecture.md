# Task: Infrastructure Statelessness and MCP/gRPC Shared State (Sub-Epic: 014_Foundational Technical Requirements (Part 5))

## Covered Requirements
- [2_TAS-REQ-001B], [2_TAS-REQ-001C]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer), Shared State & Concurrency Patterns (consumer)]

## 1. Initial Test Written
- [ ] In `devs-core/tests/shared_state.rs`, write a test annotated `// Covers: 2_TAS-REQ-001C` that creates an `Arc<AppState>` (the shared application state struct), clones the `Arc` to simulate two consumers (representing gRPC and MCP handlers), mutates state through one clone (e.g., insert a workflow run), and asserts the mutation is immediately visible through the other clone without any IPC or channel — just a direct read on the same `Arc`.
- [ ] In `devs-core/tests/infra_stateless.rs`, write a test annotated `// Covers: 2_TAS-REQ-001B` that defines a mock infrastructure component function (e.g., `fn checkpoint_save(state: &AppState, data: &[u8]) -> Result<()>`) and asserts it takes state as a parameter, operates on it, and returns a result — verifying the function signature pattern enforces no retained mutable references. The test should confirm the function does not store any caller state by calling it twice with different inputs and asserting outputs are independent.

## 2. Task Implementation
- [ ] Define `pub struct AppState` in `devs-core` containing the shared mutable containers: `Arc<RwLock<HashMap<RunId, WorkflowRun>>>` for runs, plus fields for project registry, pool state, etc. Use `parking_lot::RwLock` or `tokio::sync::RwLock` (note: tokio is forbidden in devs-core, so use `parking_lot::RwLock` or `std::sync::RwLock`).
- [ ] Document the architectural constraint in `AppState`'s doc comments: both gRPC and MCP server handlers receive `Arc<AppState>` and operate on the same instance — no message-passing or IPC between interfaces.
- [ ] Define a trait or function signature pattern for infrastructure layer components that takes `&AppState` or relevant sub-state as parameters, ensuring infrastructure components are stateless (they receive state, operate, and return results without retaining mutable references).
- [ ] Add a `#[doc]` comment on `AppState` referencing [2_TAS-REQ-001C] and stating that any change through MCP must be visible through gRPC within the same scheduler tick.

## 3. Code Review
- [ ] Verify no infrastructure-layer crate (devs-checkpoint, devs-adapters, devs-executor) defines `static mut` or module-level `lazy_static!` mutable state for business data.
- [ ] Confirm `AppState` uses interior mutability patterns (`RwLock`) consistent with the Shared State & Concurrency Patterns component.
- [ ] Verify `AppState` does not depend on `tokio` (since it lives in `devs-core`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test shared_state` and confirm pass.
- [ ] Run `cargo test -p devs-core --test infra_stateless` and confirm pass.

## 5. Update Documentation
- [ ] Add doc comments on `AppState` explaining the shared state architecture and the infrastructure statelessness constraint.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm exit code 0.
- [ ] Grep test sources for `// Covers: 2_TAS-REQ-001B` and `// Covers: 2_TAS-REQ-001C` to confirm traceability annotations.

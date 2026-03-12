# Task: Concurrent Request Synchronization (Sub-Epic: 066_Detailed Domain Specifications (Part 31))

## Covered Requirements
- [2_TAS-REQ-409]

## Dependencies
- depends_on: [none]
- shared_components: [devs-server, devs-core]

## 1. Initial Test Written
- [ ] Write a stress integration test that starts the `devs-server` and concurrently sends requests from multiple sources:
    - Multiple gRPC `RunStatus` calls.
    - Multiple MCP `GetPoolState` calls.
    - An MCP bridge process simulation sending `ListRuns` requests.
- [ ] Assert that the server process does not crash and that all requests are answered with valid responses.
- [ ] Verify that no data races are detected when running tests with `RUSTFLAGS="-Z sanitizer=thread" cargo test` (if supported in CI).

## 2. Task Implementation
- [ ] Ensure that the `ServerState` in `devs-core` is wrapped in an `Arc<RwLock<...>>` for thread-safe access across Tokio tasks.
- [ ] Audit the gRPC and MCP handler implementations in `devs-server` to verify that locks are acquired correctly (read locks for observation, write locks for mutation) and released as soon as possible.
- [ ] Ensure that all shared mutable state (e.g. `ServerState.runs`, `ServerState.pools`) is properly synchronized using `tokio::sync` primitives.

## 3. Code Review
- [ ] Confirm that no blocking calls are made while holding a write lock.
- [ ] Verify that the lock acquisition order is consistent to avoid deadlocks.
- [ ] Check that all concurrent request paths are correctly using the same shared state instance.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server -p devs-core`.
- [ ] Run the stress test with concurrent requests.

## 5. Update Documentation
- [ ] Document the synchronization strategy for `ServerState` in the internal server architecture docs.

## 6. Automated Verification
- [ ] Run `./do test` and check `target/traceability.json` for `2_TAS-REQ-409`.

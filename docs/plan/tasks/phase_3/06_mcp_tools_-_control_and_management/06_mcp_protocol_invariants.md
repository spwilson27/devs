# Task: MCP Server Protocol, Concurrency and Error Handling Invariants (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-045], [3_MCP_DESIGN-REQ-059], [3_MCP_DESIGN-REQ-060], [3_MCP_DESIGN-REQ-061], [3_MCP_DESIGN-REQ-BR-001], [3_MCP_DESIGN-REQ-BR-002], [3_MCP_DESIGN-REQ-BR-005], [3_MCP_DESIGN-REQ-BR-037], [3_MCP_DESIGN-REQ-BR-038], [3_MCP_DESIGN-REQ-BR-039], [3_MCP_DESIGN-REQ-BR-040], [3_MCP_DESIGN-REQ-BR-041], [3_MCP_DESIGN-REQ-BR-042], [3_MCP_DESIGN-REQ-BR-043], [3_MCP_DESIGN-REQ-BR-044], [3_MCP_DESIGN-REQ-EC-MCP-001], [3_MCP_DESIGN-REQ-EC-MCP-004], [3_MCP_DESIGN-REQ-EC-MCP-005], [3_MCP_DESIGN-REQ-EC-MCP-006], [3_MCP_DESIGN-REQ-EC-MCP-007], [3_MCP_DESIGN-REQ-EC-MCP-008], [3_MCP_DESIGN-REQ-EC-MCP-010], [3_MCP_DESIGN-REQ-EC-MCP-011], [3_MCP_DESIGN-REQ-NEW-004]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-core]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/protocol_invariants.rs` for JSON-RPC conformance.
- [ ] Test cases:
    - [ ] Sending a request without `id` should be treated as a notification (no response).
    - [ ] Sending a request with an `id` must return a response with that same `id`.
    - [ ] Errors must use stable prefixes (`not_found:`, `invalid_argument:`, etc.).
    - [ ] Concurrent calls to independent tools should not block each other.
- [ ] Write a performance test in `crates/devs-mcp/tests/latency.rs` that calls `list_runs` 100 times and verifies the average latency is below 2 seconds (preferably below 100ms).
- [ ] Write a concurrency test in `crates/devs-mcp/tests/locking.rs` that:
    - [ ] Attempts two simultaneous `write_workflow_definition` calls on different workflows.
    - [ ] Verifies both succeed without deadlocking.
    - [ ] Attempts a `get_run` while a `write_workflow_definition` is active. Verifies no block occurs.

## 2. Task Implementation
- [ ] Implement JSON-RPC 2.0 response logic in `devs-mcp`:
    - [ ] Ensure `id` is echoed back correctly.
    - [ ] Map Rust internal errors to stable MCP error prefixes.
- [ ] Implement short-lived `RwLock` read guards for all observation tools.
- [ ] Implement lock-ordering strategy for control tools:
    - [ ] Always acquire project lock before run lock.
    - [ ] Always acquire run lock before stage lock.
- [ ] Enforce 2s latency budget for all non-streaming MCP calls. Use `tokio::time::timeout`.
- [ ] Implement `Request-ID` tracing if applicable.

## 3. Code Review
- [ ] Verify that no tool handler holds a write lock while performing blocking I/O (filesystem/gRPC).
- [ ] Check that all public tool methods have comprehensive error handling with the correct prefixes.
- [ ] Ensure that `internal:` prefix is used only for unrecoverable server-side panics or errors.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test protocol_invariants`
- [ ] Run `cargo test -p devs-mcp --test latency`
- [ ] Run `cargo test -p devs-mcp --test locking`

## 5. Update Documentation
- [ ] Update `crates/devs-mcp/README.md` to document the protocol invariants and error handling strategy.

## 6. Automated Verification
- [ ] Run `./do test` and verify coverage of protocol and concurrency requirements.

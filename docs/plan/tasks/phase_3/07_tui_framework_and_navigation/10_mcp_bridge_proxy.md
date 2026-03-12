# Task: MCP Bridge and stdio Proxy (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [2_TAS-REQ-048]
- [2_TAS-REQ-049]
- [2_TAS-REQ-129]
- [6_UI_UX_ARCHITECTURE-REQ-036]
- [6_UI_UX_ARCHITECTURE-REQ-079]
- [6_UI_UX_ARCHITECTURE-REQ-080]
- [6_UI_UX_ARCHITECTURE-REQ-081]
- [6_UI_UX_ARCHITECTURE-REQ-082]
- [6_UI_UX_ARCHITECTURE-REQ-083]
- [6_UI_UX_ARCHITECTURE-REQ-279]
- [6_UI_UX_ARCHITECTURE-REQ-280]
- [9_PROJECT_ROADMAP-REQ-245]

## Dependencies
- depends_on: [01_shared_discovery_logic.md]
- shared_components: [devs-mcp-bridge]

## 1. Initial Test Written
- [ ] Create a test for the bridge that simulates reading a JSON-RPC line from stdin and verifies it's POSTed to the MCP server.
- [ ] Create a test for the bridge that verifies it does NOT exit when an invalid JSON line is received on stdin.
- [ ] Create a test that verifies stdout is flushed after every line write.
- [ ] Create a test for `Transfer-Encoding: chunked` detection and streaming chunk forwarding.

## 2. Task Implementation
- [ ] Create `crates/devs-mcp-bridge/` crate in the workspace.
- [ ] Implement the `Proxy` in `src/proxy.rs` using `tokio::io::AsyncBufReadExt::lines()`.
- [ ] Derived the MCP HTTP endpoint from server discovery.
- [ ] Implement the request-response cycle using `reqwest` and JSON-RPC 2.0 formatting.
- [ ] Implement the reconnect strategy: attempt exactly one reconnect after a 1s delay on connection loss.
- [ ] Implement sequential request processing (exactly one in-flight request at a time).
- [ ] Ensure that no gRPC or engine-layer crates are imported.

## 3. Code Review
- [ ] Verify that no buffering or aggregating of stdin lines occurs.
- [ ] Ensure that all errors are written as valid JSON-RPC error objects.
- [ ] Verify that the bridge exits 1 on fatal server unreachable errors.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp-bridge`.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3_grouping.json` if necessary to reflect implementation progress.

## 6. Automated Verification
- [ ] Run `cargo tree -p devs-mcp-bridge --edges normal` and verify no `tonic` or `devs-proto` crates are in the dependency graph.

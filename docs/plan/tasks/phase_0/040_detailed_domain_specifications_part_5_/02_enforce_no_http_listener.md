# Task: Enforce No HTTP Listener in Server Binary (Sub-Epic: 040_Detailed Domain Specifications (Part 5))

## Covered Requirements
- [1_PRD-REQ-055]

## Dependencies
- depends_on: ["01_enforce_no_web_policy.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] In the server binary crate (e.g., `devs-server` or the workspace binary target), create a unit test `test_no_http_listener_bindings` that:
  1. Greps all `.rs` source files in the server binary crate for patterns indicating HTTP listener setup: `TcpListener::bind` used outside of gRPC/tonic context, `hyper::Server::bind`, `axum::serve`, `warp::serve`, `HttpServer::new`, or any `actix_web` usage.
  2. Asserts zero matches. The test should use a source-scanning approach (read the crate's own source files and check for forbidden patterns) to catch violations at test time.
- [ ] Add `// Covers: 1_PRD-REQ-055` annotation to this test.
- [ ] Create a complementary integration/E2E test `test_server_only_opens_grpc_and_mcp_ports` that:
  1. Starts the server binary in a subprocess with a known config.
  2. Checks that only the expected gRPC port and MCP port are listening (e.g., by attempting TCP connections to a set of common HTTP ports like 80, 8080, 3000 and asserting connection refused).
  3. Shuts down the server.
  - NOTE: This test may be deferred to Phase 3 when the server binary exists. For Phase 0, the source-scanning test is sufficient. Add a `// BOOTSTRAP-STUB: E2E test deferred to Phase 3` comment.

## 2. Task Implementation
- [ ] Implement the source-scanning test using `std::fs::read_to_string` on the crate's source files, with regex or string matching for forbidden HTTP patterns.
- [ ] Define the list of forbidden patterns as a constant array in the test module for maintainability.
- [ ] Integrate this check into `./do lint` if it makes more sense as a lint step than a unit test (either approach is acceptable as long as it runs in CI).

## 3. Code Review
- [ ] Verify the forbidden pattern list is comprehensive: covers `hyper::Server`, `axum::serve`, `warp::serve`, `actix_web`, `rocket::launch`, `tide::new`, `poem::listener`, raw `TcpListener::bind` for HTTP purposes.
- [ ] Verify the test correctly distinguishes between gRPC/tonic TCP listeners (allowed) and HTTP listeners (forbidden).
- [ ] Confirm the test scans all relevant source files, not just a subset.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server` (or the appropriate crate) and confirm the no-HTTP-listener test passes.
- [ ] Run `./do lint` and confirm it passes.

## 5. Update Documentation
- [ ] Add a doc comment to the test explaining the policy: the server binary must not open any HTTP listener at any port under any configuration at MVP.

## 6. Automated Verification
- [ ] Run `./do test` and verify exit code 0.
- [ ] Verify `1_PRD-REQ-055` appears in `target/traceability.json` output from the traceability scanner.

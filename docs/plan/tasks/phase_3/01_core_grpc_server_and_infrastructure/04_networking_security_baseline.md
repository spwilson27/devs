# Task: Networking Security Baseline (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-001], [5_SECURITY_DESIGN-REQ-002], [5_SECURITY_DESIGN-REQ-013], [5_SECURITY_DESIGN-REQ-015], [5_SECURITY_DESIGN-REQ-016], [5_SECURITY_DESIGN-REQ-017], [5_SECURITY_DESIGN-REQ-018], [5_SECURITY_DESIGN-REQ-051], [5_SECURITY_DESIGN-REQ-057], [5_SECURITY_DESIGN-REQ-058]

## Dependencies
- depends_on: [01_core_grpc_server_and_lifecycle.md]
- shared_components: [devs-grpc, devs-config]

## 1. Initial Test Written
- [ ] Write a test in `crates/devs-server/tests/security_baseline.rs` that starts the server without an explicit bind address and verifies it binds ONLY to `127.0.0.1`.
- [ ] Create a test that attempts to bind to `0.0.0.0` and verifies a `WARN` is logged on startup (but the server still starts).
- [ ] Implement a test that verifies no client authentication is required to call gRPC or MCP endpoints (MVP baseline).

## 2. Task Implementation
- [ ] Set default gRPC and MCP bind addresses to `127.0.0.1:7890` and `127.0.0.1:7891`.
- [ ] Implement a startup security check: if binding to non-loopback (e.g., `0.0.0.0`), log a `WARN`-level structured event with `check_id: "SEC-BIND-ADDR"`.
- [ ] Ensure the MCP server binds to the same IP address as the gRPC server.
- [ ] Implement the `GetInfo` RPC in `ServerService` to allow clients to discover the MCP port.
- [ ] Explicitly document the "Glass-Box" observability vs. confidentiality trade-off in the codebase as a design choice.

## 3. Code Review
- [ ] Confirm that the default configuration is loopback-only.
- [ ] Verify that the `GetInfo` RPC is correctly implemented.
- [ ] Ensure that no role-based or resource-based access control is prematurely implemented (KISS).

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-server`

## 5. Update Documentation
- [ ] Document the security model (network-perimeter based) in `docs/plan/requirements/5_security_design.md` if not already updated.

## 6. Automated Verification
- [ ] Run `netstat -lnpt` (or equivalent) during an E2E test to confirm bound addresses.

# Task: MCP Server Hardening and Bind Address Warning (Sub-Epic: 41_Risk 014 Verification)

## Covered Requirements
- [RISK-015], [RISK-015-BR-001], [RISK-015-BR-002]

## Dependencies
- depends_on: [01_credential_redaction.md]
- shared_components: [devs-mcp, devs-config]

## 1. Initial Test Written
- [ ] Write an E2E test in `devs-mcp` that starts a mock MCP server and verifies that ALL responses (including 404s and 500s) contain the three mandatory security headers: `X-Content-Type-Options: nosniff`, `Cache-Control: no-store`, `X-Frame-Options: DENY`.
- [ ] Write an integration test for the server startup logic.
- [ ] The test must configure the server with a non-loopback bind address (e.g., `0.0.0.0`) and assert that a structured `WARN` log is emitted with `event_type: "security.misconfiguration"` and `check_id: "SEC-BIND-ADDR"` within 1 second.

## 2. Task Implementation
- [ ] Update `devs-mcp` server implementation to add the three mandatory security headers to every `http::Response`.
- [ ] Add a middleware or a common response wrapper to ensure these headers are NEVER omitted, even on error responses.
- [ ] Implement a startup check in `devs-server` (or the main entrypoint) that inspects `server.listen` and `mcp_port` from `ServerConfig`.
- [ ] If either is bound to a non-loopback address (not starting with `127.`), emit a structured `WARN` log with `check_id: "SEC-BIND-ADDR"` via the `tracing` crate.
- [ ] Ensure that `Redacted<T>` is used in MCP response types to correctly redact credentials (this depends on Task 1).

## 3. Code Review
- [ ] Verify that the security headers are exactly as specified (including casing and values).
- [ ] Confirm that the `SEC-BIND-ADDR` check is performed once at startup and does not block the server from proceeding.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` to verify the security headers.
- [ ] Run the integration test for non-loopback bind address.

## 5. Update Documentation
- [ ] Document the mandatory security headers in the `3_mcp_design.md` or similar if not already present.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `traceability.json` shows [RISK-015], [RISK-015-BR-001], and [RISK-015-BR-002] as covered.

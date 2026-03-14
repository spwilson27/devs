# Task: Network Security — Webhook SSRF, TLS Policy, and Size Limits (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-009], [5_SECURITY_DESIGN-REQ-012], [5_SECURITY_DESIGN-REQ-021], [5_SECURITY_DESIGN-REQ-031], [5_SECURITY_DESIGN-REQ-032], [5_SECURITY_DESIGN-REQ-033], [5_SECURITY_DESIGN-REQ-034], [5_SECURITY_DESIGN-REQ-035], [5_SECURITY_DESIGN-REQ-036], [5_SECURITY_DESIGN-REQ-037], [5_SECURITY_DESIGN-REQ-038], [5_SECURITY_DESIGN-REQ-039], [5_SECURITY_DESIGN-REQ-065], [5_SECURITY_DESIGN-REQ-066], [5_SECURITY_DESIGN-REQ-067], [5_SECURITY_DESIGN-REQ-068], [5_SECURITY_DESIGN-REQ-069], [5_SECURITY_DESIGN-REQ-070], [5_SECURITY_DESIGN-REQ-071]

## Dependencies
- depends_on: ["04_devs_server_crate_and_startup_sequence.md"]
- shared_components: ["devs-webhook (consumer)", "devs-executor (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-webhook/tests/ssrf_test.rs`:
  - `test_webhook_blocks_localhost_ip`: Attempt delivery to `http://127.0.0.1:8080/hook`; assert blocked with WARN log (exception: loopback HTTP is warned, not blocked for local testing per REQ-035).
  - `test_webhook_blocks_169_254_metadata`: Resolve `http://169.254.169.254/latest`; assert blocked (REQ-036).
  - `test_webhook_blocks_10_0_0_0_rfc1918`: Resolve to `10.x.x.x`; assert blocked.
  - `test_webhook_blocks_172_16_range`: Resolve to `172.16.x.x`; assert blocked.
  - `test_webhook_blocks_192_168_range`: Resolve to `192.168.x.x`; assert blocked.
  - `test_webhook_ssrf_check_after_dns_resolution`: Use a hostname that resolves to `127.0.0.1`; assert blocked (REQ-068 — DNS rebinding protection).
  - `test_webhook_ssrf_check_on_each_attempt`: Verify blocklist is re-evaluated per delivery attempt, not cached (REQ-068).
  - `test_webhook_url_max_2048_chars`: URL with 2049 chars; assert rejected at config validation (REQ-037).
  - `test_webhook_rejects_file_scheme`: `file:///etc/passwd`; assert rejected (REQ-037).
  - `test_webhook_rejects_ftp_scheme`: `ftp://evil.com`; assert rejected.
- [ ] In `crates/devs-webhook/tests/signing_test.rs`:
  - `test_hmac_sha256_signature_header`: Configure webhook with secret; deliver event; assert `X-Devs-Signature` header matches `sha256=<hex>` computed over raw body (REQ-021).
  - `test_no_secret_no_signature_header`: No secret configured; assert no signature header.
- [ ] In `crates/devs-webhook/tests/tls_test.rs`:
  - `test_non_loopback_http_webhook_logs_warn`: HTTP target on non-loopback; assert WARN on each delivery (REQ-035).
  - `test_loopback_http_permitted`: `http://127.0.0.1:8080` delivers without error.
- [ ] In `crates/devs-grpc/tests/size_limits_test.rs`:
  - `test_grpc_max_frame_16mib`: Already in task 01; verify here as integration.
  - `test_grpc_submit_run_request_1mib_limit`: Send >1 MiB request; assert `RESOURCE_EXHAUSTED` (REQ-070).
- [ ] In `crates/devs-server/tests/mcp_size_test.rs`:
  - `test_mcp_request_body_1mib_limit`: POST >1 MiB to MCP; assert HTTP 413 with error JSON (REQ-071).
- [ ] In `crates/devs-server/tests/mcp_bridge_test.rs`:
  - `test_mcp_bridge_rejects_malformed_json`: Send invalid JSON on stdin; assert structured error response on stdout (REQ-067).
- [ ] In `crates/devs-executor/tests/ssh_test.rs`:
  - `test_ssh_validates_host_key`: Mock SSH connection; verify host key validation is enforced (REQ-038).
- [ ] In `crates/devs-executor/tests/docker_test.rs`:
  - `test_docker_tcp_validates_tls`: `DOCKER_HOST=tcp://...` with TLS; verify certificate validation (REQ-039).
  - `test_docker_unix_socket_no_tls_required`: `DOCKER_HOST=unix:///var/run/docker.sock`; assert no TLS error.

## 2. Task Implementation
- [ ] In `devs-webhook`, implement `SsrfChecker`:
  - Resolve hostname to IP addresses immediately before HTTP connection.
  - Check against blocklist: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `::1`, `fc00::/7`, `fe80::/10`.
  - Block and log WARN if any resolved IP is in blocklist.
  - Re-evaluate on each retry attempt (no caching).
- [ ] In `devs-webhook`, implement webhook URL validation at config parse time: max 2048 chars, only `http`/`https` schemes (REQ-037).
- [ ] In `devs-webhook`, implement HMAC-SHA256 signing: compute over raw body bytes, set `X-Devs-Signature: sha256=<hex>` header (REQ-021).
- [ ] In `devs-webhook`, log WARN for HTTP (non-TLS) non-loopback webhook URLs on each delivery (REQ-035).
- [ ] In `devs-grpc`, configure per-RPC request size limits (REQ-070).
- [ ] In MCP HTTP server, enforce 1 MiB request body limit returning HTTP 413 (REQ-071).
- [ ] In `devs-mcp-bridge`, validate JSON before forwarding; return structured error for malformed input (REQ-067).
- [ ] In `devs-executor` SSH: validate host keys (REQ-038). Docker: validate TLS for TCP daemons, allow unix sockets (REQ-039).
- [ ] Apply same TLS config (rustls defaults) to MCP server on non-loopback interfaces (REQ-034). Use rustls cipher suite defaults (REQ-032).
- [ ] Document: checkpoint integrity via git SHA-1 (REQ-065), file mode 0600 (REQ-066), SSH is operator-controlled not user-controlled (REQ-069), webhook SSRF (REQ-009), docker/SSH blast radius (REQ-012).

## 3. Code Review
- [ ] Verify SSRF check happens after DNS resolution, not at config time.
- [ ] Confirm HMAC is computed over raw bytes, not re-serialized JSON.
- [ ] Ensure size limit errors return proper status codes (gRPC: RESOURCE_EXHAUSTED, MCP: HTTP 413).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook -- ssrf` and `cargo test -p devs-webhook -- signing` and all related tests.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 19 REQs.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.

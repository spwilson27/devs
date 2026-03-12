# Task: Transport Layer Security (TLS) (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-032], [5_SECURITY_DESIGN-REQ-033], [5_SECURITY_DESIGN-REQ-034]

## Dependencies
- depends_on: [01_core_grpc_server_and_lifecycle.md]
- shared_components: [devs-grpc, devs-config]

## 1. Initial Test Written
- [ ] Create a test that starts the server with TLS enabled and verifies that a non-TLS client is rejected.
- [ ] Write a test that attempts to use an insecure cipher suite (if possible with `rustls`) and verifies it is rejected.
- [ ] Verify that the MCP HTTP server correctly inherits the same TLS configuration as the gRPC server.

## 2. Task Implementation
- [ ] Integrate `rustls` with the `tonic` server for gRPC TLS support.
- [ ] Enforce TLS 1.2+ and use the audited `rustls` cipher suite defaults (no configuration override).
- [ ] Implement a startup check: if non-loopback binding is used without TLS, log a `WARN` with `check_id: "SEC-TLS-MISSING"`.
- [ ] Ensure the MCP HTTP server uses the same `rustls` configuration for its listener.
- [ ] Implement certificate validation at startup (e.g., check expiry date and log a `WARN` if close to expiry).

## 3. Code Review
- [ ] Confirm that `native-tls` and `openssl` are NOT used (deny in `Cargo.toml`).
- [ ] Verify that TLS configuration is consistently applied to both ports.
- [ ] Ensure that self-signed certificates are handled correctly (for local dev).

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-server`

## 5. Update Documentation
- [ ] Update the server configuration documentation to include TLS setup instructions.

## 6. Automated Verification
- [ ] Use `openssl s_client` or `gnutls-cli` to inspect the server's TLS handshake and verify the protocol/cipher.

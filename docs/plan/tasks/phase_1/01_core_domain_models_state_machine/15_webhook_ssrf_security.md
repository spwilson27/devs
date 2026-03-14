# Task: Implement Webhook Security and SSRF Mitigation Types (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [SEC-009], [SEC-021], [SEC-021-BR-001], [SEC-021-BR-002], [SEC-021-BR-003], [SEC-021-BR-004], [SEC-021-BR-005], [SEC-022], [SEC-022-BR-001], [SEC-022-BR-002], [SEC-022-BR-003], [SEC-022-BR-004], [SEC-035], [SEC-036], [SEC-037], [SEC-060], [SEC-061], [SEC-062], [SEC-063], [SEC-065], [SEC-066], [SEC-067], [SEC-068], [SEC-069], [SEC-070], [SEC-071], [SEC-072], [SEC-073], [SEC-074], [SEC-075], [SEC-076], [SEC-077], [SEC-078], [SEC-080], [SEC-081], [SEC-082], [SEC-083], [SEC-084], [SEC-085], [SEC-086], [SEC-087], [SEC-WH-001], [5_SECURITY_DESIGN-REQ-241], [5_SECURITY_DESIGN-REQ-242], [5_SECURITY_DESIGN-REQ-243], [5_SECURITY_DESIGN-REQ-244], [5_SECURITY_DESIGN-REQ-245], [5_SECURITY_DESIGN-REQ-246], [5_SECURITY_DESIGN-REQ-247], [5_SECURITY_DESIGN-REQ-248], [5_SECURITY_DESIGN-REQ-249], [5_SECURITY_DESIGN-REQ-250], [5_SECURITY_DESIGN-REQ-251], [5_SECURITY_DESIGN-REQ-252], [5_SECURITY_DESIGN-REQ-253], [5_SECURITY_DESIGN-REQ-254], [5_SECURITY_DESIGN-REQ-255], [5_SECURITY_DESIGN-REQ-256], [5_SECURITY_DESIGN-REQ-257], [5_SECURITY_DESIGN-REQ-258], [5_SECURITY_DESIGN-REQ-259], [5_SECURITY_DESIGN-REQ-260], [5_SECURITY_DESIGN-REQ-261], [5_SECURITY_DESIGN-REQ-262], [5_SECURITY_DESIGN-REQ-263], [5_SECURITY_DESIGN-REQ-264], [5_SECURITY_DESIGN-REQ-265], [5_SECURITY_DESIGN-REQ-266], [5_SECURITY_DESIGN-REQ-267], [5_SECURITY_DESIGN-REQ-268], [5_SECURITY_DESIGN-REQ-269], [5_SECURITY_DESIGN-REQ-270], [5_SECURITY_DESIGN-REQ-271], [5_SECURITY_DESIGN-REQ-272], [5_SECURITY_DESIGN-REQ-273], [5_SECURITY_DESIGN-REQ-274], [5_SECURITY_DESIGN-REQ-275], [5_SECURITY_DESIGN-REQ-276], [5_SECURITY_DESIGN-REQ-277], [5_SECURITY_DESIGN-REQ-278], [5_SECURITY_DESIGN-REQ-279], [5_SECURITY_DESIGN-REQ-280], [AC-SEC-1-006], [AC-SEC-1-021], [AC-SEC-1-022], [AC-SEC-1-023], [AC-SEC-1-024], [AC-SEC-1-025], [AC-SEC-1-026], [AC-SEC-2-012], [AC-SEC-2-013], [AC-SEC-2-015], [AC-SEC-2-018], [AC-SEC-2-021], [AC-SEC-3-001], [AC-SEC-3-002], [AC-SEC-3-003], [AC-SEC-3-004], [AC-SEC-3-006]

## Dependencies
- depends_on: [11_redacted_wrapper_credential_security.md]
- shared_components: [devs-core (Owner), devs-webhook (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_webhook_url_validation_rejects_rfc1918` asserting URLs like `http://192.168.1.1/hook` are rejected
- [ ] Write test `test_webhook_url_validation_rejects_metadata` asserting `http://169.254.169.254/` is rejected
- [ ] Write test `test_webhook_url_validation_rejects_localhost` asserting `http://localhost/hook` is rejected for non-loopback delivery
- [ ] Write test `test_webhook_url_accepts_public` asserting `https://hooks.example.com/notify` passes
- [ ] Write test `test_webhook_hmac_signing_spec` asserting `WebhookSigningConfig` holds HMAC-SHA256 secret wrapped in `Redacted<T>`
- [ ] Write test `test_webhook_url_length_limit` asserting URLs over 2048 characters are rejected
- [ ] Write test `test_webhook_scheme_enforcement` asserting only `https` (and `http` for loopback) are accepted
- [ ] Write test `test_resource_limits_max_stages` asserting 256 max stages constant
- [ ] Write test `test_resource_limits_max_body` asserting 1 MiB MCP body limit constant
- [ ] Write test `test_resource_limits_max_context_file` asserting 10 MiB context file limit constant
- [ ] Write test `test_resource_limits_max_fan_out` asserting 64 max fan-out count constant
- [ ] Write test `test_dependency_audit_policy` asserting `AuditPolicy` type holds deny-warnings flag

## 2. Task Implementation
- [ ] Define `WebhookUrlValidator` in `crates/devs-core/src/security/webhook.rs` with `validate(url: &str) -> Result<ValidatedUrl, SsrfError>`
- [ ] Define `SsrfError` enum with `Rfc1918Address`, `LinkLocalAddress`, `LoopbackAddress`, `InvalidScheme`, `TooLong`
- [ ] Define `SsrfBlocklist` struct containing RFC-1918 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local (`169.254.0.0/16`), and loopback (`127.0.0.0/8`)
- [ ] Define `WebhookSigningConfig` struct with `secret: Redacted<Vec<u8>>` and `algorithm: HmacAlgorithm` (SHA256 only at MVP)
- [ ] Define `ResourceLimits` struct in `crates/devs-core/src/security/limits.rs` with constants: `MAX_STAGES_PER_WORKFLOW: usize = 256`, `MAX_MCP_BODY_BYTES: usize = 1_048_576`, `MAX_CONTEXT_FILE_BYTES: usize = 10_485_760`, `MAX_FAN_OUT_COUNT: usize = 64`, `MAX_GRPC_EVENT_BUFFER: usize = 256`, `MAX_JSON_DEPTH: usize = 128`
- [ ] Define `AuditPolicy` struct with `deny_warnings: bool` and `suppression_expiry: Option<chrono::NaiveDate>`

## 3. Code Review
- [ ] Verify SSRF blocklist covers all RFC-1918 ranges and cloud metadata endpoints
- [ ] Verify HMAC secret is wrapped in `Redacted<T>`
- [ ] Verify resource limit constants match the specification values exactly

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core security::webhook` and confirm all tests pass
- [ ] Run `cargo test -p devs-core security::limits` and confirm all tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate

## 5. Update Documentation
- [ ] Add doc comments to `WebhookUrlValidator::validate` listing all blocked address categories
- [ ] Document each `ResourceLimits` constant with the spec reference that defines the value
- [ ] Document `AuditPolicy::suppression_expiry` semantics and expiry enforcement expectations

## 6. Automated Verification
- [ ] `cargo clippy -p devs-core -- -D warnings` passes with no warnings
- [ ] `cargo test -p devs-core security` passes
- [ ] `cargo fmt --check -p devs-core` passes

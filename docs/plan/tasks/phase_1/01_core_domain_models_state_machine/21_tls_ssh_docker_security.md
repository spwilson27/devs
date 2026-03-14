# Task: Implement TLS, SSH, and Docker Execution Security Types (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [SEC-SSH-001], [SEC-SSH-002], [SEC-TLS-001], [SEC-TLS-002], [SEC-TLS-003], [SEC-008], [SEC-012], [SEC-038], [SEC-039], [5_SECURITY_DESIGN-REQ-361], [5_SECURITY_DESIGN-REQ-362], [5_SECURITY_DESIGN-REQ-363], [5_SECURITY_DESIGN-REQ-364], [5_SECURITY_DESIGN-REQ-365], [5_SECURITY_DESIGN-REQ-366], [5_SECURITY_DESIGN-REQ-367], [5_SECURITY_DESIGN-REQ-368], [5_SECURITY_DESIGN-REQ-369], [5_SECURITY_DESIGN-REQ-370], [5_SECURITY_DESIGN-REQ-371], [5_SECURITY_DESIGN-REQ-372], [5_SECURITY_DESIGN-REQ-373], [5_SECURITY_DESIGN-REQ-374], [5_SECURITY_DESIGN-REQ-375], [5_SECURITY_DESIGN-REQ-376], [5_SECURITY_DESIGN-REQ-377], [5_SECURITY_DESIGN-REQ-378], [5_SECURITY_DESIGN-REQ-379], [5_SECURITY_DESIGN-REQ-380], [5_SECURITY_DESIGN-REQ-381], [5_SECURITY_DESIGN-REQ-382], [5_SECURITY_DESIGN-REQ-383], [5_SECURITY_DESIGN-REQ-384], [5_SECURITY_DESIGN-REQ-385], [5_SECURITY_DESIGN-REQ-386], [5_SECURITY_DESIGN-REQ-387], [5_SECURITY_DESIGN-REQ-388], [5_SECURITY_DESIGN-REQ-389], [5_SECURITY_DESIGN-REQ-390], [5_SECURITY_DESIGN-REQ-391], [5_SECURITY_DESIGN-REQ-392], [5_SECURITY_DESIGN-REQ-393], [5_SECURITY_DESIGN-REQ-394], [5_SECURITY_DESIGN-REQ-395], [5_SECURITY_DESIGN-REQ-396], [5_SECURITY_DESIGN-REQ-397], [5_SECURITY_DESIGN-REQ-398], [5_SECURITY_DESIGN-REQ-399], [5_SECURITY_DESIGN-REQ-400], [5_SECURITY_DESIGN-REQ-401], [5_SECURITY_DESIGN-REQ-402], [5_SECURITY_DESIGN-REQ-403], [5_SECURITY_DESIGN-REQ-404], [5_SECURITY_DESIGN-REQ-405], [5_SECURITY_DESIGN-REQ-406], [5_SECURITY_DESIGN-REQ-407], [5_SECURITY_DESIGN-REQ-408], [5_SECURITY_DESIGN-REQ-409], [5_SECURITY_DESIGN-REQ-410], [5_SECURITY_DESIGN-REQ-411], [5_SECURITY_DESIGN-REQ-412], [5_SECURITY_DESIGN-REQ-413], [5_SECURITY_DESIGN-REQ-414], [AC-SEC-2-003], [AC-SEC-2-023], [AC-SEC-4-013], [AC-SEC-4-014], [AC-SEC-4-015], [AC-SEC-4-016], [AC-SEC-4-017], [AC-SEC-4-018], [AC-SEC-4-019], [AC-SEC-4-020], [AC-SEC-4-021], [AC-SEC-4-022], [AC-SEC-4-023], [AC-SEC-4-024], [AC-SEC-4-025], [AC-SEC-4-026], [AC-SEC-4-027], [AC-SEC-4-028], [AC-SEC-4-029], [AC-SEC-4-030], [AC-SEC-4-031], [AC-SEC-4-032], [AC-SEC-4-033], [AC-SEC-4-034], [AC-SEC-4-035], [AC-SEC-4-036], [AC-SEC-4-037], [AC-SEC-4-038], [AC-SEC-4-039]

## Dependencies
- depends_on: ["11_redacted_wrapper_credential_security.md", "12_file_permission_security.md"]
- shared_components: [devs-core (Owner), devs-executor (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_tls_config_cert_and_key` asserting `TlsConfig` holds `cert_path: PathBuf` and `key_path: Redacted<PathBuf>`
- [ ] Write test `test_tls_config_shared_across_ports` asserting single TLS config is used for both gRPC and MCP
- [ ] Write test `test_ssh_known_hosts_resolution_order` asserting path resolution checks explicit config then `~/.ssh/known_hosts`
- [ ] Write test `test_ssh_key_permission_check` asserting `SshKeyPermissionCheck` validates mode 0o600
- [ ] Write test `test_docker_host_config_types` asserting `DockerHostConfig` distinguishes socket vs TCP daemon
- [ ] Write test `test_client_version_header` asserting `CLIENT_VERSION_HEADER` constant equals `"x-devs-client-version"`
- [ ] Write test `test_checkpoint_schema_version` asserting `CheckpointSchemaVersion` can be compared for compatibility

## 2. Task Implementation
- [ ] Define `TlsConfig` struct in `crates/devs-core/src/security/tls.rs` with `cert_path: PathBuf`, `key_path: Redacted<PathBuf>`, `enabled: bool`
- [ ] Define `CLIENT_VERSION_HEADER: &str = "x-devs-client-version"` constant
- [ ] Define `SshConnectionConfig` struct in `crates/devs-core/src/security/ssh.rs` with `host: String`, `port: u16`, `user: String`, `key_path: PathBuf`, `known_hosts_path: Option<PathBuf>`
- [ ] Implement `SshConnectionConfig::resolve_known_hosts(&self) -> PathBuf` checking config path then `~/.ssh/known_hosts`
- [ ] Define `DockerHostConfig` enum with `Socket(PathBuf)`, `Tcp { host: String, port: u16, tls_verify: bool }`
- [ ] Define `CheckpointSchemaVersion` struct with `major: u32`, `minor: u32` and compatibility check method
- [ ] Define `ExecutionCleanupPolicy` enum with `Always`, `OnSuccess`, `Never` for environment cleanup behavior

## 3. Code Review
- [ ] Verify TLS key path is wrapped in `Redacted<PathBuf>`
- [ ] Verify SSH config uses separate known_hosts resolution from system defaults
- [ ] Verify Docker config distinguishes socket from TCP correctly

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- tls` and confirm all TLS config tests pass
- [ ] Run `cargo test -p devs-core -- ssh` and confirm all SSH config tests pass
- [ ] Run `cargo test -p devs-core -- docker` and confirm all Docker host config tests pass
- [ ] Run `cargo clippy --workspace -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/security/tls.rs` explaining shared TLS config across gRPC and MCP
- [ ] Add module-level doc comment to `crates/devs-core/src/security/ssh.rs` explaining known_hosts resolution order
- [ ] Document `DockerHostConfig` variants with usage examples

## 6. Automated Verification
- [ ] `cargo test -p devs-core` passes with no failures
- [ ] `TlsConfig.key_path` field type verified as `Redacted<PathBuf>` by compile-time test
- [ ] `CLIENT_VERSION_HEADER` constant value verified by test assertion

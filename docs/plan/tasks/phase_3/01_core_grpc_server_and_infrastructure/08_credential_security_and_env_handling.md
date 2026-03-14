# Task: Credential Security and Environment Variable Handling (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-004], [5_SECURITY_DESIGN-REQ-010], [5_SECURITY_DESIGN-REQ-023], [5_SECURITY_DESIGN-REQ-024], [5_SECURITY_DESIGN-REQ-025], [5_SECURITY_DESIGN-REQ-026], [5_SECURITY_DESIGN-REQ-027], [5_SECURITY_DESIGN-REQ-029], [5_SECURITY_DESIGN-REQ-064]

## Dependencies
- depends_on: ["04_devs_server_crate_and_startup_sequence.md"]
- shared_components: ["Redacted<T> Security Wrapper (consumer)", "devs-config (consumer)", "devs-core (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-server/tests/credential_test.rs`:
  - `test_redacted_debug_never_shows_value`: Create `Redacted::new("sk-secret")`; assert `format!("{:?}", r)` contains `"[REDACTED]"` and not `"sk-secret"`.
  - `test_redacted_display_never_shows_value`: Same for `Display`.
  - `test_redacted_expose_returns_inner`: Assert `r.expose() == "sk-secret"`.
  - `test_env_stripping_removes_devs_vars`: Build an agent environment from server env containing `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE`; assert these are absent in the agent env.
  - `test_credential_env_vars_inherited_by_agents`: Set `CLAUDE_API_KEY` in server env; assert it appears in agent env.
  - `test_stage_env_overrides_workflow_env`: Define workflow `default_env` and stage `env` with same key; assert stage value wins.
  - `test_credential_never_in_logs`: Use tracing test subscriber; log a `Redacted` value; assert log output contains `[REDACTED]`.
  - `test_credential_never_in_checkpoint`: Serialize a config containing `Redacted` credentials; assert serialized output does not contain the secret.
  - `test_prompt_file_uses_uuid_filename`: Write a prompt file; assert filename matches `.devs_prompt_<uuid>` pattern.
  - `test_prompt_file_deleted_after_stage`: Write prompt file, run cleanup; assert file deleted.
  - `test_prompt_file_mode_0600`: On unix, assert prompt file has `0600` permissions.
  - `test_webhook_secret_never_in_logs_or_checkpoints`: Serialize `WebhookTarget` with secret; assert secret absent from serialized form.

## 2. Task Implementation
- [ ] Integrate `Redacted<T>` wrapper (from shared component) into `devs-config` credential parsing: all credential values in `ServerConfig` are `Redacted<String>`.
- [ ] Implement `AgentEnvironmentBuilder`:
  - Merges: server env → workflow `default_env` → stage `env`.
  - Strips `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` from result (REQ-026).
  - Credential vars (`*_API_KEY`, `*_TOKEN`) pass through intentionally.
- [ ] Implement prompt file writing in `devs-executor` or `devs-adapters`:
  - Filename: `<working_dir>/.devs_prompt_<uuid4>` (REQ-029, REQ-045 from input validation task).
  - File mode: `0600` on Unix (REQ-029).
  - Deleted after stage completion (REQ-029).
- [ ] Ensure `Redacted<T>` is used for `WebhookTarget.secret` (REQ-064).
- [ ] Implement `serde::Serialize` for `Redacted<T>` that emits `"[REDACTED]"` (REQ-025): credentials never appear in checkpoint files, log output, gRPC responses, or MCP tool responses.
- [ ] Checkpoint persistence (REQ-027): document that `.devs/` is not encrypted at rest; operators must use FDE.

## 3. Code Review
- [ ] Grep the codebase for any `println!`, `tracing::info!`, `tracing::debug!` that might accidentally log a credential without `Redacted`.
- [ ] Verify no `Serialize` impl on `Redacted` emits the inner value.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server -- credential` and confirm all pass.

## 5. Update Documentation
- [ ] Document credential handling policy in `devs-server` module docs.
- [ ] Add `// Covers:` annotations for all REQs.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.

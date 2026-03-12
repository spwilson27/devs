# Task: Verify MCP Credential Redaction and Agent Output Transparency (Sub-Epic: 42_Risk 015 Verification)

## Covered Requirements
- [AC-RISK-015-03], [RISK-015-BR-004], [MIT-015]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-core]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/e2e_mcp_redaction.rs` that starts the `devs` server with a `devs.toml` containing sensitive fields (e.g., API keys) wrapped in `Redacted<T>`.
- [ ] Submit a JSON-RPC request to the MCP server to fetch the configuration (e.g., via `get_config` tool call).
- [ ] Assert that the sensitive fields in the JSON response are the exact string `"[REDACTED]"`.
- [ ] Create a second test where an agent stage produces output containing a mock API key (e.g., `sk-123456789`).
- [ ] Fetch the stage output via the `get_stage_output` MCP tool.
- [ ] Assert that the mock API key is present in the response (verifying the behavior in `RISK-015-BR-004`).

## 2. Task Implementation
- [ ] Verify that `Redacted<T>` correctly implements `serde::Serialize` to always output `"[REDACTED]"`.
- [ ] Ensure `devs-mcp` uses these redacted types when exposing internal state.
- [ ] Confirm that `get_stage_output` returns raw agent stdout/stderr without any post-processing for redaction.

## 3. Code Review
- [ ] Verify that `Redacted<T>`'s serialization is exactly `"[REDACTED]"` (13 characters).
- [ ] Confirm that agent output transparency is intentional and documented.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test e2e_mcp_redaction` and verify the test passes.

## 5. Update Documentation
- [ ] Ensure `SEC-013` (if it exists) or similar security documentation reflects the transparency of agent output.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `traceability.json` shows [AC-RISK-015-03] and [RISK-015-BR-004] as covered.

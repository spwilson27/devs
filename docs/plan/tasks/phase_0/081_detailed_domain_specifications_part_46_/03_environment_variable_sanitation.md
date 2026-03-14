# Task: Environment Variable Sanitation for Agent Processes (Sub-Epic: 081_Detailed Domain Specifications (Part 46))

## Covered Requirements
- [2_TAS-REQ-482]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core", "devs-executor", "devs-adapters"]

## 1. Initial Test Written
- [ ] Create a test module `tests::env_sanitation` in the executor or adapter environment-preparation code.
- [ ] `test_stripped_keys_not_in_agent_env` — Set `DEVS_LISTEN`, `DEVS_MCP_PORT`, and `DEVS_DISCOVERY_FILE` in the server environment. Build the agent environment map. Assert none of these three keys appear in the resulting map.
- [ ] `test_stripped_keys_removed_even_if_stage_sets_them` — Configure a stage with per-stage env vars that explicitly set `DEVS_LISTEN=foo`. Assert the key is still stripped from the final agent environment.
- [ ] `test_devs_mcp_addr_injected` — Build the agent environment map with MCP server address `127.0.0.1:9999`. Assert `DEVS_MCP_ADDR` is present and equals `"127.0.0.1:9999"`.
- [ ] `test_devs_mcp_addr_overrides_stage_value` — Configure a stage that sets `DEVS_MCP_ADDR=wrong`. Assert the final agent environment has `DEVS_MCP_ADDR` set to the actual MCP server address, not `"wrong"`.
- [ ] `test_other_env_vars_pass_through` — Set arbitrary env vars like `MY_VAR=hello` in the server env. Assert they appear in the agent environment unchanged.

## 2. Task Implementation
- [ ] In the environment preparation function (likely in `devs-executor` or the adapter invocation path), after merging server env + stage env:
  1. Remove keys: `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE`.
  2. Insert/overwrite `DEVS_MCP_ADDR` with the MCP server's actual listen address.
- [ ] Define the stripped keys as constants (e.g., `const STRIPPED_ENV_KEYS: &[&str] = &["DEVS_LISTEN", "DEVS_MCP_PORT", "DEVS_DISCOVERY_FILE"];`) for maintainability.
- [ ] Use the `EnvKey` validated type from `devs-core` if available; otherwise use plain string keys.

## 3. Code Review
- [ ] Verify all three stripped keys are handled — no partial implementation.
- [ ] Verify `DEVS_MCP_ADDR` injection cannot be overridden by user config.
- [ ] Verify stripping happens after all merges (server env + stage env) so no source can sneak them through.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test env_sanitation` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments listing the stripped keys and the rationale (preventing agents from interfering with the devs server's own ports/discovery).

## 6. Automated Verification
- [ ] Run `cargo test env_sanitation -- --nocapture` and verify zero failures.

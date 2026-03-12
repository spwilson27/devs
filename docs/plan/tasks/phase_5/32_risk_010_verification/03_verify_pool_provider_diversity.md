# Task: Verify Pool Provider Diversity Enforcement (Sub-Epic: 32_Risk 010 Verification)

## Covered Requirements
- [AC-RISK-010-05]

## Dependencies
- depends_on: [none]
- shared_components: [devs-pool, devs-config]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-pool/src/pool_config_test.rs` that:
    - Defines a pool configuration where all agents use the same provider (e.g., all `claude`).
    - Calls the validation logic for that pool configuration.
    - Asserts that it returns an error containing the string `"no provider diversity"`.
- [ ] Create an integration test in `crates/devs-server/tests/server_startup_test.rs` that:
    - Starts a `devs-server` with a `devs.toml` containing a single-provider pool.
    - Asserts that the server exits non-zero with a message containing `"no provider diversity"` on stderr.

## 2. Task Implementation
- [ ] Implement a provider check in the `AgentPool` initialization or `ServerConfig` validation that:
    - Iterates over the agents in each pool.
    - Collects the unique providers (e.g., from the `tool` name or an explicit `provider` field).
    - Returns an `Err` if `unique_providers.len() < 2`.
- [ ] Ensure that for the MVP, the "provider" is correctly identified (e.g., `claude` is Anthropic, `gemini` is Google, `opencode`, `qwen`, `copilot` are others).
- [ ] Add the check to `devs-config` parser to fail early during configuration loading.

## 3. Code Review
- [ ] Verify that the provider mapping is accurate for all MVP-supported agent tools.
- [ ] Confirm that the error message follows the standard format: `INVALID_ARGUMENT: "pool '<name>' has no provider diversity: all agents use the same API provider"`.

## 4. Run Automated Tests to Verify
- [ ] Run the unit and integration tests: `cargo test --package devs-pool --lib pool_config_test` and `cargo test --package devs-server --test server_startup_test`.

## 5. Update Documentation
- [ ] Update `devs.toml` documentation or `1_prd.md` to clarify the requirement for provider diversity in pools.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `traceability.json` shows [AC-RISK-010-05] as covered by the new tests.

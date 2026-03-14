# Task: Validate Prohibited Environment Keys (Sub-Epic: 085_Detailed Domain Specifications (Part 50))

## Covered Requirements
- [2_TAS-REQ-503]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] In `devs-core/src/validation.rs`, add the `ProhibitedEnvKey { stage: String, key: String }` variant to `ValidationError` if not already present.
- [ ] In `devs-config/src/workflow_validation.rs` (or equivalent), write `test_devs_listen_env_key_rejected`:
  - Construct a `StageDefinition` with `env` map containing `"DEVS_LISTEN" => "0.0.0.0:9090"`.
  - Call the stage validation function.
  - Assert the error list contains `ValidationError::ProhibitedEnvKey` with `key = "DEVS_LISTEN"`.
- [ ] Write `test_devs_prefixed_env_keys_rejected`: test that any key starting with `DEVS_` (e.g., `"DEVS_MCP_PORT"`, `"DEVS_DISCOVERY_FILE"`) is rejected with `ProhibitedEnvKey`. This covers the broader prohibition pattern — the requirement uses `"DEVS_LISTEN"` as a specific example, but the implementation should prohibit the entire `DEVS_` prefix to prevent interference with server-controlled variables.
- [ ] Write `test_non_devs_env_key_accepted`: construct a `StageDefinition` with `env` map containing `"MY_API_KEY" => "abc123"`. Assert no `ProhibitedEnvKey` error.
- [ ] Write `test_multiple_prohibited_keys_all_reported`: provide two prohibited keys in the same stage. Assert two separate `ProhibitedEnvKey` errors appear in the list (not short-circuited).
- [ ] Add `// Covers: 2_TAS-REQ-503` annotation to all test functions.

## 2. Task Implementation
- [ ] Add `ProhibitedEnvKey { stage: String, key: String }` to `ValidationError` in `devs-core`.
- [ ] Implement `Display`: `"stage '{stage}': environment key '{key}' is prohibited (DEVS_ prefix is reserved)"`.
- [ ] In the `StageDefinition` validation function in `devs-config`, iterate the `env` map. For each key that starts with `"DEVS_"` (case-sensitive), push `ValidationError::ProhibitedEnvKey { stage: stage.name.clone(), key: key.clone() }`.
- [ ] Ensure this check does not short-circuit — all prohibited keys in a single stage must be reported.

## 3. Code Review
- [ ] Verify the prefix check is case-sensitive (`"DEVS_"` only, not `"devs_"`), consistent with Linux environment variable conventions.
- [ ] Confirm the error message includes the specific prohibited key for clear diagnostics.
- [ ] Ensure the check iterates ALL keys, not just the first match.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- env_key` and `cargo test -p devs-core` to verify all new tests pass.

## 5. Update Documentation
- [ ] Add doc comment on the `ProhibitedEnvKey` variant explaining the `DEVS_` prefix reservation.
- [ ] Add doc comment on `EnvKey` type (if it exists in `devs-core`) noting the prohibited prefix.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` includes `2_TAS-REQ-503` as covered.
- [ ] Run `./do lint` to confirm no clippy warnings or formatting issues.

# Task: Verify Pool Provider Diversity Enforcement (Sub-Epic: 31_Risk 010 Verification)

## Covered Requirements
- [RISK-010-BR-005], [MIT-010]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config, devs-pool]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-config/src/pool_validation.rs` that:
    - Provides a pool configuration containing only agents from a single provider (e.g., all `claude` agents).
    - Asserts that the validation function fails with `INVALID_ARGUMENT: "pool '<name>' has no provider diversity: all agents use the same API provider"`.
    - Provides a valid pool configuration containing agents from at least two providers (e.g., `claude` and `gemini`).
    - Asserts that the validation function passes.
- [ ] Write an integration test for `devs-server` that:
    - Tries to start the server with a diversity-violating pool config.
    - Asserts that the server exits non-zero with the correct error message.

## 2. Task Implementation
- [ ] Implement provider diversity validation in `devs-config` as part of the `ServerConfig` parsing/validation logic.
- [ ] Ensure that agents in a pool are grouped by their provider (e.g., using a `provider` field or inferring it from the tool name).
- [ ] Enforce the rule: at least two distinct providers MUST be present in any pool defined in the server configuration.
- [ ] Integrate this check into the server's startup sequence, exiting non-zero if the validation fails for any defined pool.

## 3. Code Review
- [ ] Verify that the provider identification is robust (e.g., handles different tool names from the same provider if applicable).
- [ ] Ensure the error message matches the wording in `[RISK-010-BR-005]`.
- [ ] Confirm that this validation only applies to the server-level pool definitions.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config --lib pool_validation`.
- [ ] Run `cargo test -p devs-server` (if it has integration tests for config validation).

## 5. Update Documentation
- [ ] Update the `devs.toml` configuration documentation to note the mandatory provider diversity requirement for agent pools.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `RISK-010-BR-005` is marked as covered in `target/traceability.json`.

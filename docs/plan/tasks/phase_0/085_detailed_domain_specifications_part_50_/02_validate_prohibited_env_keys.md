# Task: Validate Prohibited Env Keys (Sub-Epic: 085_Detailed Domain Specifications (Part 50))

## Covered Requirements
- [2_TAS-REQ-503]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-config/src/validation.rs` that validates a `StageDefinition` containing an environment variable map with the key `"DEVS_LISTEN"`.
- [ ] The test MUST assert that validation fails with `ValidationError::ProhibitedEnvKey`.
- [ ] Write a test verifying that other keys (e.g., `"MY_VAR"`) are accepted.

## 2. Task Implementation
- [ ] Add `ProhibitedEnvKey` variant to the `ValidationError` enum in `devs-core`.
- [ ] Update the `StageDefinition` validation logic in `devs-config` to iterate through the `env` map.
- [ ] For each key, if it matches `"DEVS_LISTEN"`, push `ValidationError::ProhibitedEnvKey` to the error collector.
- [ ] Update `devs-core` and `devs-config` crates to handle the new error variant.

## 3. Code Review
- [ ] Verify that the check is case-sensitive or case-insensitive as per the requirement (usually environment variables are case-sensitive on Linux but "DEVS_LISTEN" is the specific prohibited key mentioned).
- [ ] Ensure the error message specifically mentions the prohibited key.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and `cargo test -p devs-core`.

## 5. Update Documentation
- [ ] Ensure `EnvKey` documentation in `devs-core` mentions prohibited keys if applicable.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows `2_TAS-REQ-503` as covered.

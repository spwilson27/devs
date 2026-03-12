# Task: Server Exit on Invalid Configuration (Sub-Epic: 068_Detailed Domain Specifications (Part 33))

## Covered Requirements
- [2_TAS-REQ-418], [2_TAS-REQ-001H], [2_TAS-REQ-001L]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config, devs-server]

## 1. Initial Test Written
- [ ] Create an E2E test in `tests/e2e/test_server_config_failure.rs`.
- [ ] Prepare a malformed `devs.toml` (e.g., `[server]\nport = "NaN"`).
- [ ] Attempt to start the `devs` server pointing to this config file.
- [ ] Assert that the process exits with a non-zero code.
- [ ] Assert that `stderr` contains `"ERROR:"` prefixes for all detected configuration errors.
- [ ] Assert that no ports are listening on the default or configured addresses (e.g., using a port-checking utility).

## 2. Task Implementation
- [ ] Implement the `ConfigError` collection logic in `devs-config` as per `2_TAS-REQ-024`.
- [ ] In `devs-server` startup sequence, call config validation.
- [ ] If validation errors exist, iterate through them, print each to stderr with `"ERROR: "` prefix, and exit immediately.
- [ ] Verify that no ports are bound before the validation step (step 2 in startup sequence).

## 3. Code Review
- [ ] Ensure that the config parsing is exhaustive and doesn't abort at the first error.
- [ ] Verify the error reporting format (one per line, prefixed with `ERROR:`).

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and ensure the config failure E2E tests pass.

## 5. Update Documentation
- [ ] Update the server configuration documentation to specify that all errors are reported at once.

## 6. Automated Verification
- [ ] Run the server with a missing required field and verify it exits non-zero with a clear error message in `stderr`.

# Task: Agent Credential Supply and Priority Resolution (Sub-Epic: 038_Detailed Domain Specifications (Part 3))

## Covered Requirements
- [1_PRD-REQ-044]

## Dependencies
- depends_on: [04_configuration_precedence_logic.md]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Create a unit test `crates/devs-config/src/tests/test_credentials.rs` that:
    - Tests the resolution of an agent API key (e.g., `CLAUDE_API_KEY`).
    - Verifies that if the key is present in both an environment variable and the TOML config, the environment variable is preferred.
    - Verifies that the resolved value is available to the rest of the application through a standard configuration interface.
    - Asserts that missing credentials result in a fatal error during server startup.

## 2. Task Implementation
- [ ] Implement the logic for resolving agent API keys in the `devs-config` crate.
- [ ] Ensure that keys like `CLAUDE_API_KEY`, `GEMINI_API_KEY`, etc., are correctly resolved from the environment.
- [ ] Support keys being provided in the `devs.toml` under a `[credentials]` or `[secrets]` section (with a warning about plaintext storage).
- [ ] Implement the "resolve once" logic, ensuring credentials are not re-read during operation.
- [ ] Add the startup check that fails the server if a required credential for an active pool is missing.

## 3. Code Review
- [ ] Verify that sensitive credentials are not logged or leaked in error messages.
- [ ] Confirm that the resolution priority matches the `1_PRD-REQ-044` requirement.
- [ ] Ensure the startup failure behavior is correctly implemented.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --crate devs-config tests/test_credentials.rs`.

## 5. Update Documentation
- [ ] Document the credential supply mechanisms for users, emphasizing the security benefits of using environment variables.

## 6. Automated Verification
- [ ] Start the server without a required API key and verify that it fails with a clear error message.
- [ ] Provide the key via an environment variable and verify that the server starts successfully.

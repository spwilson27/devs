# Task: Single-Point Startup Credential Resolution (Sub-Epic: 043_Detailed Domain Specifications (Part 8))

## Covered Requirements
- [1_PRD-REQ-069], [1_PRD-REQ-070]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] In `devs-config/src/credentials.rs`, write unit tests that simulate various credential loading scenarios:
    - Case A: Credential provided in the config file.
    - Case B: Credential provided in an environment variable (e.g., `CLAUDE_API_KEY`).
    - Case C: Credential provided in BOTH (environment should take precedence or follow a defined order).
    - Case D: Credential missing in BOTH (assert that an error is returned).
- [ ] Write a test that ensures the resolution function returns a single, immutable `Credentials` struct that doesn't change after the initial call.

## 2. Task Implementation
- [ ] Implement a `CredentialsResolver` in the `devs-config` crate.
- [ ] Use `std::env::var` and the parsed `ServerConfig` to resolve required API keys and other secrets.
- [ ] Implement a `validate` method that checks for a set of "required" credentials for MVP (e.g., those needed by the configured agent pools).
- [ ] Ensure that if a required credential is missing, a clear and actionable error message is returned (naming the missing key).
- [ ] Structure the server startup sequence to call this resolver exactly once and fail hard if it returns an error.

## 3. Code Review
- [ ] Verify that no runtime re-fetching logic exists in the implementation.
- [ ] Ensure the error message clearly identifies whether the key was searched in the config, environment, or both.
- [ ] Confirm that credentials are never logged or exposed in error messages.

## 4. Run Automated Tests to Verify
- [ ] Run the `devs-config` unit tests: `cargo test -p devs-config`.
- [ ] Execute an integration test that attempts to "start" a mock server with missing credentials and verify it exits with the correct error.

## 5. Update Documentation
- [ ] Update the `devs-config` documentation to explain the credential resolution hierarchy and how to provide them securely.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and ensure [1_PRD-REQ-069] and [1_PRD-REQ-070] are marked as verified.

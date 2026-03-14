# Task: Single-Pass Credential Resolution at Startup (Sub-Epic: 043_Detailed Domain Specifications (Part 8))

## Covered Requirements
- [1_PRD-REQ-069], [1_PRD-REQ-070]

## Dependencies
- depends_on: [02_server_config_secrets_section.md]
- shared_components: [devs-config (consumer), Redacted<T> Security Wrapper (consumer)]

## 1. Initial Test Written
- [ ] In `devs-config`, create `src/credentials.rs` with the following unit tests:
  1. `test_credential_from_env_only`: Set env var `CLAUDE_API_KEY=test_key`, provide no config entry. Assert resolution succeeds and returns the key wrapped in `Redacted<String>`. Annotate with `// Covers: 1_PRD-REQ-069`.
  2. `test_credential_from_config_only`: Provide a config entry `[credentials] claude_api_key = "config_key"` with no env var. Assert resolution succeeds.
  3. `test_env_overrides_config`: Provide both env var and config entry. Assert the env var value takes precedence.
  4. `test_missing_required_credential_fails`: Provide neither env var nor config entry for a required credential. Assert the result is an error containing the string `"CLAUDE_API_KEY"` (the missing key name). Annotate with `// Covers: 1_PRD-REQ-070`.
  5. `test_credentials_are_immutable`: Assert that the returned `ResolvedCredentials` struct is `Clone` but has no mutation methods—resolution happens once and the result is frozen.
  6. `test_multiple_missing_credentials_lists_all`: When multiple required credentials are missing, assert the error message names every missing key, not just the first.
- [ ] Ensure tests use `std::env::set_var`/`remove_var` in a thread-safe manner (use `serial_test` crate or isolated process tests).

## 2. Task Implementation
- [ ] Implement `CredentialResolver` with a `resolve(config: &ServerConfig, required_keys: &[CredentialSpec]) -> Result<ResolvedCredentials, CredentialError>` method.
- [ ] `CredentialSpec` defines: `env_var_name: &str`, `config_path: &str`, `description: &str`.
- [ ] Resolution order: env var first, then config file value. First match wins.
- [ ] `ResolvedCredentials` stores values as `HashMap<String, Redacted<String>>` with only immutable accessor methods.
- [ ] `CredentialError` includes a `missing_keys: Vec<String>` field listing all missing credentials (not just the first).
- [ ] The `Display` impl for `CredentialError` must print each missing key name but never print any credential value.
- [ ] This resolver is called exactly once during server startup. It must not be re-invocable or refreshable.

## 3. Code Review
- [ ] Verify no credential values appear in `Debug`, `Display`, log output, or error messages.
- [ ] Verify the resolver collects ALL missing credentials before returning an error (no early return on first miss).
- [ ] Confirm no runtime re-fetching or refresh mechanism exists.
- [ ] Verify `Redacted<T>` is used for all stored credential values.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and confirm all credential tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `CredentialResolver` explaining the resolution hierarchy (env > config) and the single-resolution-at-startup invariant.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config` and confirm exit code 0.
- [ ] Verify `// Covers: 1_PRD-REQ-069` and `// Covers: 1_PRD-REQ-070` annotations exist in test code via grep.

# Task: Config Path Default and Explicit Behavior (Sub-Epic: 016_Foundational Technical Requirements (Part 7))

## Covered Requirements
- [2_TAS-REQ-001L], [2_TAS-REQ-001M]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config (consumer — uses config loading types)]

## 1. Initial Test Written
- [ ] In `crates/devs-config/tests/config_path_resolution.rs` (or equivalent test module), write a test `test_default_path_missing_starts_with_defaults` that:
  - Sets the default config search path to a non-existent temp directory path (no `devs.toml` present).
  - Does NOT supply `--config`.
  - Calls the config loading function and asserts it returns `Ok` with all built-in default values (e.g., default listen address, default MCP port).
  - Captures log output (use `tracing-test` or equivalent) and asserts a single `WARN`-level log line matching: `"No devs.toml found at <path>; using built-in defaults."` where `<path>` is the expected default search path.
- [ ] Write a test `test_explicit_config_missing_file_errors` that:
  - Supplies `--config /tmp/nonexistent_<uuid>/devs.toml` (a path guaranteed not to exist).
  - Calls the config loading function and asserts it returns `Err`.
  - Asserts the error message matches: `"Error: config file not found: /tmp/nonexistent_<uuid>/devs.toml"`.
  - Asserts that no port binding or server initialization occurred (i.e., the function exits before any side effects).
- [ ] Write a test `test_explicit_config_existing_file_loads` that:
  - Creates a temp directory with a valid minimal `devs.toml`.
  - Supplies `--config <tempdir>/devs.toml`.
  - Asserts config loads successfully with values from the file.

## 2. Task Implementation
- [ ] In the config loading module (e.g., `crates/devs-config/src/loader.rs`), implement the config resolution logic:
  1. If `--config` flag is provided:
     - Check if file exists. If not, return an error with message `"Error: config file not found: <path>"` immediately — no further initialization.
     - If file exists, parse and return the config.
  2. If `--config` is NOT provided:
     - Check default search path (e.g., `./devs.toml` or `~/.config/devs/devs.toml` per project convention).
     - If file does not exist, emit `tracing::warn!("No devs.toml found at {}; using built-in defaults.", path)` and return `ServerConfig::default()`.
     - If file exists, parse and return.
- [ ] Ensure `ServerConfig` implements `Default` with sensible built-in defaults for all fields.
- [ ] Ensure the error path for `--config` missing file does NOT call any port-binding or server startup code — the error must be returned/propagated before that point in the startup sequence.

## 3. Code Review
- [ ] Verify the WARN log message string exactly matches the requirement: `"No devs.toml found at <path>; using built-in defaults."`.
- [ ] Verify the error message string exactly matches: `"Error: config file not found: <path>"`.
- [ ] Verify no port binding or resource allocation happens before the config check.
- [ ] Verify `ServerConfig::default()` provides all required fields with sensible defaults.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- config_path_resolution` and confirm all three tests pass.

## 5. Update Documentation
- [ ] Add doc comments to the config loading function explaining the two-path resolution behavior and referencing [2_TAS-REQ-001L] and [2_TAS-REQ-001M].

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config -- config_path_resolution --nocapture 2>&1 | grep -c "test result: ok"` and confirm output is `1`.
- [ ] Run `cargo clippy -p devs-config -- -D warnings` and confirm zero warnings.

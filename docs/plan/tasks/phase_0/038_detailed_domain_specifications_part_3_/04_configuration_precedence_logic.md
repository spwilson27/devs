# Task: Hierarchical Configuration Precedence Logic (Sub-Epic: 038_Detailed Domain Specifications (Part 3))

## Covered Requirements
- [1_PRD-REQ-043]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Create a unit test `crates/devs-config/src/tests/test_precedence.rs` that:
    - Defines a configuration field with a default value.
    - Tests overriding the value via a simulated TOML file.
    - Tests overriding the TOML value via a simulated environment variable (`DEVS_SERVER_PORT`).
    - Tests overriding the environment variable via a simulated CLI flag.
    - Asserts that the final value matches the precedence rules: CLI > Env > TOML > Defaults.

## 2. Task Implementation
- [ ] Implement the `ConfigResolver` in the `devs-config` crate.
- [ ] Use `clap` for CLI flag parsing and `serde` for TOML parsing.
- [ ] Implement logic to map `DEVS_` prefixed environment variables to their corresponding configuration keys (e.g., `DEVS_SERVER_LISTEN` maps to `server.listen`).
- [ ] Implement the merge logic that combines these sources in the correct precedence order.
- [ ] Ensure the resolution happens at server startup as specified in the architecture.

## 3. Code Review
- [ ] Verify that all configuration fields correctly support this hierarchy.
- [ ] Confirm that environment variable mapping is robust and consistent.
- [ ] Ensure that no configuration source is inadvertently bypassed.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --crate devs-config tests/test_precedence.rs`.

## 5. Update Documentation
- [ ] Document the configuration precedence rules for users in the server setup guide.

## 6. Automated Verification
- [ ] Set `DEVS_SERVER_LISTEN=127.0.0.1:9000` and verify the server attempts to bind to that port instead of the default or TOML value.

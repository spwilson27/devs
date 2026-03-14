# Task: Implement Config Override Precedence (Sub-Epic: 047_Detailed Domain Specifications (Part 12))

## Covered Requirements
- [2_TAS-REQ-106]

## Dependencies
- depends_on: []
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-config/src/config/precedence_tests.rs` that validates the resolution of a sample configuration value across all four precedence levels:
    - Default value is returned if no others are present.
    - `devs.toml` value overrides the default.
    - Environment variable (e.g., `DEVS_SERVER_LISTEN_ADDRESS`) overrides the `devs.toml` value.
    - CLI flag (passed as a mock argument) overrides all other sources.
- [ ] Verify that environment variables follow the `DEVS_` prefix and dotted-path conversion rule (e.g., `server.listen_address` maps to `DEVS_SERVER_LISTEN_ADDRESS`).

## 2. Task Implementation
- [ ] In `devs-config`, implement a `ConfigResolver` that merges configuration from:
    - `clap` derived CLI flags.
    - `std::env::vars()` filtered by the `DEVS_` prefix.
    - A parsed `ServerConfig` struct from `devs.toml` (using `toml` crate).
    - Hardcoded defaults in the `Default` implementation of `ServerConfig`.
- [ ] Ensure that dotted-path configuration keys are correctly transformed into their environment variable counterparts (uppercase, underscores instead of dots).
- [ ] Implement a unified `resolve()` method that returns the final configuration state.

## 3. Code Review
- [ ] Verify that the precedence is strictly: CLI > Env > File > Default.
- [ ] Ensure the implementation is in `devs-config` and does not leak into other crates.
- [ ] Confirm that `missing` values at higher precedence levels do not "unset" values at lower precedence levels (standard override behavior).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and ensure all precedence tests pass.

## 5. Update Documentation
- [ ] Document the configuration override precedence in `devs-config/README.md` or a module-level doc comment.
- [ ] Update the project's agent memory with the implemented precedence rules.

## 6. Automated Verification
- [ ] Verify the traceability tag: `// Covers: 2_TAS-REQ-106` is present in the test file.
- [ ] Run `./do lint` to ensure no clippy or formatting regressions.

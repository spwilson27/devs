# Task: Server Configuration Schema (devs.toml) (Sub-Epic: 056_Detailed Domain Specifications (Part 21))

## Covered Requirements
- [2_TAS-REQ-154]

## Dependencies
- depends_on: [01_foundational_domain_types.md]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] In `devs-config/src/server.rs`, write unit tests that parse a complete `devs.toml` containing all top-level sections as specified in [2_TAS-REQ-154].
- [ ] Test parsing success with valid input.
- [ ] Test parsing failure with missing required fields or unknown fields.
- [ ] Verify default values for optional fields.

## 2. Task Implementation
- [ ] Define the `ServerConfig` struct in `devs-config/src/server.rs` with `serde` annotations for TOML parsing.
- [ ] Implement the `[server]` section: `listen_address`, `mcp_port`, `scheduling_mode`.
- [ ] Implement the `[retention]` section: `max_age_days`, `max_size_mb`.
- [ ] Implement the `[[pool]]` section: `name`, `max_concurrent`, and nested `[[pool.agent]]` entries.
- [ ] Implement the `[webhooks]` placeholder as required by [2_TAS-REQ-154].
- [ ] Use types from `devs-core` for things like port numbers (or use standard `u16`).

## 3. Code Review
- [ ] Verify that all sections from [2_TAS-REQ-154] are covered.
- [ ] Check for correct `serde` attributes to match the specified TOML structure.
- [ ] Ensure nested agent lists are handled correctly.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` to verify the configuration parsing.

## 5. Update Documentation
- [ ] Document the schema and sections of `devs.toml` in doc comments.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the requirements coverage script detects the tests.

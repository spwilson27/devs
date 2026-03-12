# Task: Agent Environment Variable Sanitation (Sub-Epic: 081_Detailed Domain Specifications (Part 46))

## Covered Requirements
- [2_TAS-REQ-482]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core`, create a test suite `env_sanitation_tests.rs`.
- [ ] Define a base environment with `DEVS_LISTEN="127.0.0.1"`, `DEVS_MCP_PORT="9000"`, `DEVS_DISCOVERY_FILE="/tmp/devs.addr"`, and `USER="test"`.
- [ ] Write a test that simulates environment preparation for an agent stage.
- [ ] Assert that `DEVS_LISTEN`, `DEVS_MCP_PORT`, and `DEVS_DISCOVERY_FILE` are MISSING from the final agent environment.
- [ ] Assert that `USER="test"` is still PRESENT in the final environment.
- [ ] Assert that `DEVS_MCP_ADDR` is PRESENT and correctly set to the server's listen address.

## 2. Task Implementation
- [ ] In `devs-core/src/env.rs` (or equivalent), implement a `SanitizeEnv` trait or function.
- [ ] Define the `STRIPPED_VARS` list: `["DEVS_LISTEN", "DEVS_MCP_PORT", "DEVS_DISCOVERY_FILE"]`.
- [ ] Implement the `sanitize` logic:
    - Iterate over the server's environment.
    - Remove any keys in `STRIPPED_VARS`.
    - Inject `DEVS_MCP_ADDR` with the server's current MCP listen address.
- [ ] Ensure that this sanitized environment is what's passed to the `AgentAdapter` (to be implemented in later phases).

## 3. Code Review
- [ ] Verify that the stripping logic is case-insensitive if applicable on the target platform (but standard Linux environment is case-sensitive).
- [ ] Confirm that `DEVS_MCP_ADDR` is always injected, even if it wasn't in the original environment.
- [ ] Ensure the implementation is reusable for all agent adapters.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test env_sanitation_tests`.
- [ ] Verify all tests pass, ensuring consistent sanitation across all test runs.

## 5. Update Documentation
- [ ] Update `devs-core` documentation to specify the list of stripped and injected environment variables for agent processes.

## 6. Automated Verification
- [ ] Run `./do test` and check the traceability report to ensure `2_TAS-REQ-482` is mapped to the passing tests.

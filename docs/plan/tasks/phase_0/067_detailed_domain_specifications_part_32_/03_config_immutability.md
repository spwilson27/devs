# Task: Immutable Configuration Pattern (Sub-Epic: 067_Detailed Domain Specifications (Part 32))

## Covered Requirements
- [2_TAS-REQ-412]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Create a test in `devs-config` that:
    - Loads a sample `devs.toml` configuration.
    - Spawns a thread that attempts to re-load or modify the global configuration object.
    - Asserts that the configuration object remains unchanged and that no re-loading takes place.
- [ ] Verify that a `devs project add` operation updates the project registry but does NOT trigger a reload of `devs.toml`.

## 2. Task Implementation
- [ ] Define the `ServerConfig` struct in `devs-config` as a read-only object after its initial load at startup.
    - Use `Arc<ServerConfig>` or a similar mechanism that prohibits modification after initialization.
- [ ] Implement a configuration loading sequence in the server entrypoint that:
    - Loads `devs.toml` exactly once.
    - Passes the resulting immutable configuration to all server subsystems.
- [ ] Implement the `ProjectRegistry` loading such that it supports live updates (via `devs project add/remove`), distinguishing it from the immutable `devs.toml` (per [2_TAS-REQ-412]).
- [ ] Ensure that `devs.toml` is NOT watched for file system changes and does not support any "reload" command or signal.

## 3. Code Review
- [ ] Verify that there is no code path that can modify `ServerConfig` after it is initially loaded.
- [ ] Check that the distinction between `devs.toml` (immutable) and the project registry (live-update) is clear and correctly implemented.
- [ ] Ensure that the configuration loading pattern is simple and robust.

## 4. Run Automated Tests to Verify
- [ ] Run the `devs-config` tests to verify immutable configuration behavior.
- [ ] Manually verify that changing `devs.toml` while the server is running has no effect until the server is restarted.

## 5. Update Documentation
- [ ] Add a section on "Configuration Management" to the architectural documentation, explaining the immutability of `devs.toml`.
- [ ] Explicitly document that project registry changes are the only exception to the immutability rule.

## 6. Automated Verification
- [ ] Use `grep -r "mut ServerConfig" .` to verify no mutable references to the server configuration exist in the codebase.
- [ ] Ensure that no file-watchers are attached to `devs.toml`.

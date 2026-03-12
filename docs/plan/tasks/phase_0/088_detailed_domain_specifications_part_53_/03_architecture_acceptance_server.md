# Task: Architecture Acceptance - Server & Discovery (Sub-Epic: 088_Detailed Domain Specifications (Part 53))

## Covered Requirements
- [2_TAS-REQ-600]

## Dependencies
- depends_on: [01_webhook_config_validation.md, 02_webhook_delivery_mechanics.md]
- shared_components: [devs-server, devs-grpc, devs-grpc]

## 1. Initial Test Written
- [ ] Create an integration test suite `tests/acceptance/architecture_server.rs` to verify the following sub-requirements from [2_TAS-REQ-600]:
    - **[2_TAS-REQ-418]**: Invalid `devs.toml` (unknown field, wrong type) results in errors to stderr, non-zero exit, and no bound ports. Use `ss -tlnp` or a similar port-probing check.
    - **[2_TAS-REQ-419]**: Attempting to bind a second server to an already-used port fails with `EADDRINUSE`.
    - **[2_TAS-REQ-420]**: CLI client auto-connects to a running server using the discovery file.
    - **[2_TAS-REQ-421]**: `SIGTERM` to the server deletes the discovery file and exits with 0.
    - **[2_TAS-REQ-422]**: CLI client handles a missing/stale discovery file and exits with code 3.
    - **[2_TAS-REQ-424]**: Independent `DEVS_DISCOVERY_FILE` for parallel E2E tests.
    - **[2_TAS-REQ-432]**: Missing config file results in exit and no port bindings.

## 2. Task Implementation
- [ ] Implement the server lifecycle management logic in `devs-server`.
- [ ] Implement the `DiscoveryFile` logic in `devs-grpc` to manage the address file at `~/.config/devs/server.addr`.
- [ ] Implement the signal handling (`SIGTERM`) and clean-up in the server.
- [ ] Implement the port-probing logic for verification in the acceptance test suite.
- [ ] Ensure that the server validation errors are printed clearly to stderr.

## 3. Code Review
- [ ] Verify that the server does not bind *any* ports until *after* all configuration (including webhooks) is validated.
- [ ] Ensure the discovery file is written atomically and removed correctly on exit.
- [ ] Confirm that `EADDRINUSE` is handled and reported with a clear message.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test architecture_server` to verify the server lifecycle.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to note the verification of server and discovery acceptance criteria.

## 6. Automated Verification
- [ ] Verify that `./do test` passes and `target/traceability.json` shows [2_TAS-REQ-600] as covered (along with its sub-IDs).

# Task: Client Discovery Logic and Error Handling (Sub-Epic: 018_Foundational Technical Requirements (Part 9))

## Covered Requirements
- [2_TAS-REQ-002H], [2_TAS-REQ-002J]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a unit test (e.g. in `devs-core` or a temporary module) that mocks the environment to test address resolution.
- [ ] Mock the presence of `DEVS_DISCOVERY_FILE` and verify the resolved path.
- [ ] Mock the absence of the file and verify the error condition.
- [ ] Mock the presence of the `--server` flag (as a `Option<String>`) and verify it takes precedence.
- [ ] Mock a malformed discovery file and verify the error condition.
- [ ] Assert that the error condition returns an exit code `3` and the specific error message: `"Server at <addr> is not reachable. Is it running?"` or `"Discovery file at <path> is malformed: <detail>"` as per TAS §1.5.

## 2. Task Implementation
- [ ] Implement a `resolve_server_addr` function that takes an optional explicit address (from CLI flag).
- [ ] Implement logic to find the discovery file:
    1. Check `DEVS_DISCOVERY_FILE` environment variable.
    2. Check a default path: `~/.config/devs/server.addr` (using `home` crate to resolve `~`).
- [ ] Read the discovery file, strip whitespace, and validate the `<host>:<port>` format.
- [ ] Ensure that if the `--server` flag is provided, it is used unconditionally and the discovery file is NOT read.
- [ ] Implement a `DiscoveryError` type that maps to exit code `3` and includes the human-readable error messages required.
- [ ] Use `thiserror` for error definitions.

## 3. Code Review
- [ ] Verify that the `--server` flag precedence is absolute [2_TAS-REQ-002J].
- [ ] Verify that exit code `3` is used for all discovery-related failures [2_TAS-REQ-002H].
- [ ] Ensure the error messages match the TAS exactly.
- [ ] Verify that whitespace is stripped from the discovery file content [2_TAS-REQ-002F].

## 4. Run Automated Tests to Verify
- [ ] Run the unit tests: `cargo test` in the relevant crate.
- [ ] Verify that all mocks (flag, env, file) behave as expected.

## 5. Update Documentation
- [ ] Update internal developer documentation regarding the server discovery protocol.
- [ ] Record the implementation of these requirements in the agent's memory.

## 6. Automated Verification
- [ ] Run `./do test` to ensure 100% traceability for [2_TAS-REQ-002H] and [2_TAS-REQ-002J].
- [ ] Verify `target/traceability.json` reflects the coverage.

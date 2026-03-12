# Task: Implement E2E tests for Server Discovery and Graceful Shutdown (Sub-Epic: 069_Detailed Domain Specifications (Part 34))

## Covered Requirements
- [2_TAS-REQ-420], [2_TAS-REQ-421], [2_TAS-REQ-422]

## Dependencies
- depends_on: [none]
- shared_components: [devs-server, devs-cli, devs-grpc]

## 1. Initial Test Written
- [ ] Create a new E2E test file `tests/e2e/test_discovery_and_shutdown.rs`.
- [ ] Write a test `test_discovery_lifecycle` that:
  - Generates a unique temporary path for `DEVS_DISCOVERY_FILE`.
  - Starts the `devs-server` subprocess.
  - Polls until the discovery file exists and contains a valid `<host>:<port>`.
  - Asserts that the gRPC port is reachable at that address.
  - Spawns the `devs` CLI subprocess without the `--server` flag.
  - Asserts that the CLI successfully connects (exits 0 for `devs list`).
  - Sends a `SIGTERM` signal to the server subprocess.
  - Asserts that the server subprocess exits with code 0.
  - Asserts that the discovery file has been deleted from the filesystem.
  - Attempts to run the CLI again and asserts that it fails with exit code 3 and a "not reachable" error message.

## 2. Task Implementation
- [ ] Ensure `devs-server` implements the startup sequence that writes the discovery file atomically (Step 9 of [2_TAS-REQ-001]).
- [ ] Ensure `devs-server` implements the graceful shutdown sequence that deletes the discovery file (Step 8 of [2_TAS-REQ-002]).
- [ ] Ensure `devs-cli` implements the discovery logic: reading the file if `--server` is absent (Step 3 of [2_TAS-REQ-078]).
- [ ] Ensure `devs-cli` returns exit code 3 when the server is unreachable (Step 3 of [2_TAS-REQ-062]).

## 3. Code Review
- [ ] Verify that the discovery file write/delete operations are atomic and safe.
- [ ] Verify that the CLI correctly handles the absence of the discovery file and stale addresses.
- [ ] Ensure `tracing` logs capture the discovery file lifecycle events.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test --test e2e::test_discovery_and_shutdown`.
- [ ] Ensure the test achieves at least 80% line coverage in the discovery and shutdown logic.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that server discovery and graceful shutdown have been verified with E2E tests.

## 6. Automated Verification
- [ ] Verify traceability by running `./do test` and checking `target/traceability.json` for coverage of [2_TAS-REQ-420], [2_TAS-REQ-421], [2_TAS-REQ-422].

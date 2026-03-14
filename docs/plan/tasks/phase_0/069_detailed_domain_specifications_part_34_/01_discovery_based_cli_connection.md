# Task: Discovery-Based CLI Connection E2E Test (Sub-Epic: 069_Detailed Domain Specifications (Part 34))

## Covered Requirements
- [2_TAS-REQ-420]

## Dependencies
- depends_on: ["none"]
- shared_components: [Server Discovery Protocol, devs-cli, devs-server]

## 1. Initial Test Written
- [ ] Create an E2E integration test in `tests/e2e/` (e.g., `discovery_cli_connection.rs`) that:
  1. Sets `DEVS_DISCOVERY_FILE` to a unique temp file path for isolation.
  2. Starts a `devs` server process in the background, configured to write its discovery file to the `DEVS_DISCOVERY_FILE` path.
  3. Waits for the discovery file to appear (poll with 100ms intervals, 10s timeout).
  4. Invokes `devs list` as a subprocess **without** the `--server` flag.
  5. Asserts the CLI process exits with code 0.
  6. Asserts stdout contains valid output (e.g., empty list JSON or table header).
  7. Cleans up: sends SIGTERM to the server, removes the temp discovery file.
- [ ] Add `// Covers: 2_TAS-REQ-420` annotation to the test function.

## 2. Task Implementation
- [ ] Ensure the CLI client's connection logic checks for `--server` flag first; if absent, reads `DEVS_DISCOVERY_FILE` (or the default `~/.config/devs/server.addr`).
- [ ] Ensure the server writes `host:grpc_port` to the discovery file atomically (temp file + rename) on startup.
- [ ] Ensure the CLI parses the discovery file content as `host:port` and connects via gRPC.
- [ ] The `devs list` command must issue a `ListRuns` RPC and return exit code 0 on success.

## 3. Code Review
- [ ] Verify the CLI never hardcodes a server address — it must derive it from either `--server` or the discovery file.
- [ ] Verify the discovery file read path handles missing file gracefully (covered by REQ-422, but should not panic here).
- [ ] Verify the test uses `DEVS_DISCOVERY_FILE` for isolation per the shared component contract.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test discovery_cli_connection` (or the appropriate test binary) and confirm it passes.
- [ ] Run `./do test` and confirm no regressions.

## 5. Update Documentation
- [ ] Add doc comments to the CLI discovery resolution function explaining the precedence order (`--server` > `DEVS_DISCOVERY_FILE` > default path).

## 6. Automated Verification
- [ ] Run `./do presubmit` and confirm exit 0.
- [ ] Verify `// Covers: 2_TAS-REQ-420` appears in the test file via `grep -r "Covers: 2_TAS-REQ-420" tests/`.

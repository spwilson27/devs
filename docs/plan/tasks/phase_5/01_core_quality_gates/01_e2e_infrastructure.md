# Task: E2E Test Infrastructure & Subprocess Management (Sub-Epic: 01_Core Quality Gates)

## Covered Requirements
- [2_TAS-REQ-082]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-grpc, ./do Entrypoint Script, Server Discovery Protocol]

## 1. Initial Test Written
- [ ] Create a "canary" E2E test in `crates/devs-cli/tests/e2e/canary.rs` that:
  1. Uses `std::process::Command` to spawn a real `devs-server` subprocess.
  2. Waits for the server to write the discovery file (`~/.config/devs/server.addr` or `DEVS_DISCOVERY_FILE`).
  3. Connects to the server via the CLI client interface only (no internal function calls).
  4. Runs `devs status` or an equivalent harmless command.
  5. Asserts the command exits with code 0.
  6. Cleans up by killing the server process and removing the discovery file.
- [ ] Annotate the test with `// Covers: [2_TAS-REQ-082]`.
- [ ] Ensure the test imports ONLY from `devs-cli` public interface or uses `assert_cmd::Command` to invoke the binary — NO imports from `devs-core`, `devs-scheduler`, `devs-pool`, or other server-internal crates.
- [ ] Run the test to confirm it fails (red) before implementation because the infrastructure doesn't exist yet:
  ```
  cargo test -p devs-cli --test canary -- --nocapture 2>&1 | tee /tmp/e2e_canary_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Create a shared E2E test utility module** at `crates/devs-cli/tests/e2e_helpers.rs` (or a separate `devs-test-utils` crate if preferred) to centralize E2E harness logic:
  - Implement `ServerManager` struct:
    - Constructor finds an ephemeral port by binding to `127.0.0.1:0` and extracting the port.
    - Sets `DEVS_DISCOVERY_FILE` env var to a unique temp path for test isolation.
    - Spawns `devs-server` as a subprocess using `std::process::Command` with args for gRPC port and MCP port.
    - Implements "wait-for-ready": polls the discovery file for up to 5 seconds, or reads stderr for "Server listening on..." log line.
    - Implements `Drop` to kill the server process and remove the discovery file.
    - Provides `grpc_addr()` and `mcp_addr()` accessors for clients.
  - Annotate with `// Covers: [2_TAS-REQ-082]`.

- [ ] **Implement interface-specific wrappers**:
  - `CliWrapper`:
    - Uses `assert_cmd::Command` to invoke the `devs-cli` binary.
    - Provides methods like `status()`, `list()`, `submit(workflow)` that return `assert_cmd::Output`.
    - Uses `ServerManager::grpc_addr()` to set `--server` flag or relies on discovery file.
  - `TuiWrapper`:
    - Uses `ratatui::backend::TestBackend` to simulate TUI interaction without a real terminal.
    - Provides methods to render frames, send key events, and capture buffer contents as strings.
  - `McpWrapper`:
    - Uses `reqwest` or `ureq` to send HTTP POST requests to the MCP port.
    - Implements JSON-RPC 2.0 client for calling `devs` MCP tools (`submit_run`, `get_run`, etc.).
  - Annotate all with `// Covers: [2_TAS-REQ-082]`.

- [ ] **Ensure E2E test isolation**:
  - E2E tests MUST NOT have `devs-core`, `devs-scheduler`, `devs-pool`, `devs-checkpoint`, or other server-internal crates in their `[dev-dependencies]`.
  - E2E tests MUST ONLY import from the client crate's public API or use subprocess/HTTP wrappers.
  - Verify `crates/devs-cli/Cargo.toml` and `crates/devs-tui/Cargo.toml` do not expose internal crates to E2E test targets.

- [ ] **Update `./do` script** to support E2E test filtering:
  - Add `--e2e` flag to `./do test` that runs only tests in `tests/e2e/` directories.
  - Annotate with `# [2_TAS-REQ-082]`.

## 3. Code Review
- [ ] Verify that E2E tests are located strictly within `tests/e2e/` directories of `devs-cli`, `devs-tui`, and `devs-mcp` crates.
- [ ] Verify that the server is treated as a "black box" — no shared memory, no internal state manipulation, no direct function calls into server crates.
- [ ] Check that `ServerManager::Drop` implementation handles cleanup correctly even if the test panics (use `std::process::Command::kill` and ignore errors).
- [ ] Verify that `DEVS_DISCOVERY_FILE` is set to a unique temp path per test to avoid conflicts between parallel test runs.
- [ ] Confirm all public symbols have doc comments per project standards.
- [ ] Verify `// Covers: [2_TAS-REQ-082]` annotations are present in all E2E test files and helpers.

## 4. Run Automated Tests to Verify
- [ ] Run the CLI canary test:
  ```
  cargo test -p devs-cli --test canary -- --nocapture
  ```
  The test must pass (green) — meaning the server subprocess was spawned, the CLI connected, and the command succeeded.
- [ ] Run the full E2E suite:
  ```
  ./do test --e2e
  ```
- [ ] Run traceability verification:
  ```
  python3 .tools/verify_requirements.py --ids 2_TAS-REQ-082
  ```
  Must exit 0 and report `2_TAS-REQ-082` as "covered".

## 5. Update Documentation
- [ ] Add a section to `docs/architecture/testing.md` (or create it) titled "E2E Test Infrastructure" explaining:
  - E2E tests MUST start a real server subprocess and connect via CLI/TUI/MCP interfaces only.
  - No direct function calls into server internals are permitted.
  - `ServerManager` handles server lifecycle; interface wrappers provide client interactions.
- [ ] Update `GEMINI.md` to record the E2E harness pattern and the `// Covers: [2_TAS-REQ-082]` annotation convention.
- [ ] In `docs/plan/phases/phase_5.md`, update the entry for `[2_TAS-REQ-082]`:
  ```
  - [2_TAS-REQ-082]: Covered by `crates/devs-cli/tests/e2e/canary.rs` and E2E harness in `crates/devs-cli/tests/e2e_helpers.rs`
  ```

## 6. Automated Verification
- [ ] Confirm the requirement is covered in the traceability report:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_e2e.txt
  grep "2_TAS-REQ-082" /tmp/presubmit_e2e.txt
  ```
  The ID must appear as `COVERED`.
- [ ] Verify that E2E test crates do NOT depend on server-internal crates:
  ```bash
  grep -E "devs-(core|scheduler|pool|checkpoint|executor|adapters|webhook)" crates/devs-cli/Cargo.toml crates/devs-tui/Cargo.toml crates/devs-mcp/Cargo.toml | grep -v "^#" || echo "OK: No internal deps"
  ```
  Must return "OK: No internal deps" or show only non-test dependencies.
- [ ] Verify the canary test passes:
  ```
  cargo test -p devs-cli --test canary 2>&1 | grep -E "test .* ok"
  ```
  Must list the test as `ok`.

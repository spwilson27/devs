# Task: E2E Test Infrastructure & Subprocess Management (Sub-Epic: 01_Core Quality Gates)

## Covered Requirements
- [2_TAS-REQ-082]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-grpc, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a "canary" E2E test in `crates/devs-cli/tests/e2e/canary.rs` that attempts to start a `devs-server` subprocess, connect to it via the CLI client, and run `devs status`. This test should fail initially because the infrastructure doesn't exist.
- [ ] Ensure the test verifies that it is NOT using internal function calls by only importing the `devs-cli` binary or its public library interface.

## 2. Task Implementation
- [ ] Create a shared test utility crate (e.g., `crates/devs-test-utils`) if one doesn't exist, to centralize E2E harness logic.
- [ ] Implement `ServerManager`:
    - Handles finding an ephemeral port (port 0).
    - Spawns `devs-server` as a subprocess using `std::process::Command`.
    - Implements a "wait-for-ready" check (e.g., polling the gRPC health check or looking for a "Server listening on..." log line).
    - Ensures the server process is killed on `Drop`.
- [ ] Implement interface-specific wrappers:
    - `CliWrapper`: Uses `assert_cmd::Command` to invoke the `devs-cli` binary.
    - `TuiWrapper`: Uses `ratatui::backend::TestBackend` to simulate TUI interaction without a real terminal.
    - `McpWrapper`: Uses a standard HTTP/JSON-RPC client (e.g., `reqwest`) to interact with the server's MCP port.
- [ ] Ensure no server internal crates (like `devs-core` or `devs-scheduler`) are linked as dependencies in the E2E test targets.

## 3. Code Review
- [ ] Verify that E2E tests are located strictly within `tests/e2e/` directories of their respective crates.
- [ ] Verify that the server is treated as a "black box" — no shared memory or internal state manipulation is permitted in the tests.
- [ ] Check that `ServerManager` handles cleanup correctly even if the test panics.

## 4. Run Automated Tests to Verify
- [ ] Run the CLI canary test: `cargo test --test canary --features e2e` (or similar command).
- [ ] Verify that the server subprocess is actually spawned and then terminated.

## 5. Update Documentation
- [ ] Document the E2E testing pattern in `docs/architecture/testing.md` (or similar).
- [ ] Update `GEMINI.md` to record the established E2E harness pattern.

## 6. Automated Verification
- [ ] Verify that `crates/devs-cli/Cargo.toml` does NOT have `devs-core` in its `[dev-dependencies]` for the `e2e` feature/target.
- [ ] Run `./do test --e2e` and ensure the harness is correctly utilized.

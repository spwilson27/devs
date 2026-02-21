# Task: CLI IPC Client & Parity Controls (Sub-Epic: 02_Headless Mode & IPC Parity)

## Covered Requirements
- [3_MCP-REQ-SYS-003], [8_RISKS-REQ-054]

## 1. Initial Test Written
- [ ] Write integration tests in `@devs/cli` that attempt to connect to a mock IPC server at a standard socket path.
- [ ] Write a test that simulates the CLI `status` command connecting to a running orchestrator via IPC and printing the state.
- [ ] Write a test that verifies the CLI can successfully send a `PAUSE` signal via IPC and receives a confirmation.

## 2. Task Implementation
- [ ] Implement the `IPCClient` class in `@devs/cli/src/ipc-client.ts`.
- [ ] Configure the CLI to check for an existing IPC socket in the `.devs/` directory before starting its own internal orchestrator.
- [ ] Update CLI commands (`status`, `pause`, `resume`, `rewind`) to use the `IPCClient` to communicate with a running core process if available.
- [ ] Implement the logic that ensures the CLI remains fully functional independently: if no IPC server is detected, it starts its own local orchestrator instance.
- [ ] Ensure that the CLI can cleanly detach from an IPC session without terminating the core process if the core was already running.

## 3. Code Review
- [ ] Verify that the CLI/Extension parity is maintained: all core orchestration controls must be available via the CLI through the IPC layer.
- [ ] Check that the IPC client handles connection timeouts and reconnections gracefully.
- [ ] Ensure the 128-bit/256-bit handshake token is correctly managed between the CLI and the core server.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -w @devs/cli` and verify the new IPC client integration tests.
- [ ] Manually test the "Parity" by starting an orchestrator and ensuring the CLI can control it (e.g., `devs status` shows matching state).

## 5. Update Documentation
- [ ] Update `@devs/cli` documentation to reflect the new IPC-based communication model.
- [ ] Update the CLI's `--help` output if necessary to explain how it interacts with running sessions.

## 6. Automated Verification
- [ ] Run a shell script that starts a background orchestrator and uses the CLI to `pause` it, then verifies the `state.sqlite` reflects the `PAUSED` status.
- [ ] Validate that the CLI doesn't leave orphaned socket connections on exit.

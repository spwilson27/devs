# Task: Implement Orchestrator IPC Server (Sub-Epic: 02_Headless Mode & IPC Parity)

## Covered Requirements
- [3_MCP-REQ-SYS-003], [8_RISKS-REQ-054]

## 1. Initial Test Written
- [ ] Write integration tests in `@devs/core` to verify that the `OrchestratorServer` can listen on a Unix Socket (macOS/Linux) and a Named Pipe (Windows).
- [ ] Write a test client that attempts to connect to the socket/pipe and send a `HEARTBEAT` or `GET_STATE` request, expecting a valid SAOP-compliant response.
- [ ] Verify that the server handles concurrent connection attempts gracefully and enforces a 256-bit ephemeral handshake token as per security requirements.

## 2. Task Implementation
- [ ] Implement the `IPCServer` class within `@devs/core/src/ipc`.
- [ ] Configure the server to use the `net` module in Node.js, dynamically choosing between Unix Sockets and Named Pipes based on the OS.
- [ ] Integrate the `IPCServer` with the `OrchestratorServer` (LangGraph state machine) to expose state transitions and allow incoming control signals (pause, resume).
- [ ] Implement the handshake logic that requires a 128-bit/256-bit token passed via an environment variable or a shared temporary file with `0600` permissions.
- [ ] Ensure the server lifecycle is managed correctly (closing the socket/pipe on process exit).

## 3. Code Review
- [ ] Verify that the IPC implementation follows the "Headless First" design, ensuring the server is the primary interface for both CLI and Extension.
- [ ] Ensure that the socket file is created with restricted permissions (`0700` or `0600`) to prevent unauthorized access from other local users.
- [ ] Check for proper error handling if the socket file already exists or cannot be created.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -w @devs/core` and specifically the new IPC integration tests.
- [ ] Verify that the server passes "Chaos Testing" (simulated connection drops and rapid reconnects).

## 5. Update Documentation
- [ ] Update `@devs/core` documentation (e.g., `CORE_IPC.md`) to describe the IPC protocol, handshake mechanism, and message schema.
- [ ] Update the internal agent "memory" (AOD) with the new IPC interface details for future agents.

## 6. Automated Verification
- [ ] Run a script that starts the orchestrator, connects via `nc -U` (or equivalent), and validates that the JSON state is streamed correctly.
- [ ] Validate that the socket file is automatically cleaned up on a clean exit.

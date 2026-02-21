# Task: Implement Secure IPC Transport (Unix Domain Socket / Named Pipe) (Sub-Epic: 03_IPC Security & Authentication)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-014], [5_SECURITY_DESIGN-REQ-SEC-SD-031]

## 1. Initial Test Written

- [ ] In `packages/ipc/src/__tests__/transport.test.ts`, write unit tests for `IpcTransport`:
  - Test that on Linux/macOS a Unix Domain Socket is created at a path within the OS temp directory (`os.tmpdir()`), e.g., `/tmp/devs-<uuid>.sock`.
  - Test that on Windows a Named Pipe is created using a path of the form `\\\\.\\pipe\\devs-<uuid>`.
  - Test that the socket file/pipe path is NOT world-readable (mode `0o600` or stricter on Unix).
  - Test that a second process attempting to connect without the correct credentials is rejected with an `EACCES` or equivalent error.
  - Test that on Unix the socket file is unlinked when the server closes (no stale socket files).
  - Write an integration test that starts an `IpcServer`, connects with an `IpcClient`, sends a framed message, and asserts the server receives it correctly.
  - All tests must be written using `vitest` (or the project-standard test runner) and must **fail** before implementation.

## 2. Task Implementation

- [ ] Create `packages/ipc/src/transport.ts` exporting `IpcServer` and `IpcClient` classes:
  - Detect platform via `process.platform`; use `net.createServer()` with a UDS path on Linux/macOS and a Named Pipe path on Windows.
  - Generate the socket path using `crypto.randomUUID()` to guarantee uniqueness per session.
  - On Unix: call `fs.chmodSync(socketPath, 0o600)` immediately after `server.listen()` to restrict permissions. Remove the socket file in the `close` event handler.
  - On Windows: the pipe name must include a random UUID component; set `pipe.allowHalfOpen = false`.
  - Apply OS-level ACLs via a helper `applyAcl(socketPath: string): void` that on Unix is a no-op (permissions suffice) and on Windows calls `icacls` via `child_process.execSync` to restrict access to the current user SID only.
  - Implement a length-prefixed framing protocol (4-byte big-endian uint32 length + body) in `packages/ipc/src/framing.ts` so messages are not subject to stream fragmentation.
  - Export `IpcTransportOptions` interface with fields: `socketPath?: string` (auto-generated if omitted), `connectTimeoutMs: number` (default 5000).
  - Ensure the module compiles cleanly under TypeScript strict mode.

## 3. Code Review

- [ ] Verify that no socket path is ever predictable or user-controlled (always UUID-based).
- [ ] Verify `chmod 0o600` is called synchronously before any client can connect (race-condition check).
- [ ] Confirm Windows Named Pipe path includes `\\\\.\\pipe\\` prefix, not a filesystem path.
- [ ] Confirm framing handles partial reads and back-pressure correctly using `readable` events or `async iterators`.
- [ ] Ensure no plaintext data (including the handshake token) is logged at `info` level or below; only `debug` level with redaction markers.
- [ ] Confirm the `applyAcl` helper is called in every code path that creates a socket/pipe.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/ipc test` and confirm all tests in `transport.test.ts` pass.
- [ ] Run `pnpm --filter @devs/ipc tsc --noEmit` to confirm TypeScript compilation with no errors.
- [ ] If running on a Linux CI environment, also verify the socket file mode using `fs.statSync(socketPath).mode & 0o777 === 0o600`.

## 5. Update Documentation

- [ ] Update `packages/ipc/README.md` (create if absent) with: purpose of the module, transport selection logic (Unix vs. Windows), socket path format, and the framing protocol specification.
- [ ] Add an entry to `docs/security/ipc-security.md` (create if absent) describing: UDS/Named Pipe usage, path randomization strategy, permission hardening, and ACL enforcement.
- [ ] Update agent memory / `index.agent.md` in `packages/ipc/` to record: "IPC transport uses UDS on Unix (chmod 0o600) and Named Pipes on Windows (icacls restricted). Framing uses 4-byte length prefix."

## 6. Automated Verification

- [ ] Run the full test suite with coverage: `pnpm --filter @devs/ipc test --coverage` and assert line coverage ≥ 90% for `transport.ts` and `framing.ts`.
- [ ] Execute the integration smoke test script: `node scripts/verify-ipc-transport.mjs` (create this script) which: spawns a child process, establishes a UDS/Named Pipe connection, sends a 1 KB payload, and asserts echo response within 1 second. Exit code 0 = pass, non-zero = fail.
- [ ] Confirm CI pipeline (`.github/workflows/ci.yml` or equivalent) runs the above commands; add them if missing.

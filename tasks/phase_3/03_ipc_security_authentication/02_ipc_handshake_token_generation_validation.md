# Task: Implement IPC Session Handshake Token (Ephemeral 256-bit Token via Environment Variable) (Sub-Epic: 03_IPC Security & Authentication)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-014], [5_SECURITY_DESIGN-REQ-SEC-SD-032]

## 1. Initial Test Written

- [ ] In `packages/ipc/src/__tests__/handshake.test.ts`, write unit and integration tests:
  - **Token generation**: assert that `generateHandshakeToken()` returns a `Buffer` of exactly 32 bytes (256 bits), and that two successive calls produce different values (entropy check).
  - **Environment injection**: assert that `injectHandshakeToken(env, token)` sets `DEVS_IPC_HANDSHAKE_TOKEN` in the provided env map as a 64-character hex string.
  - **Token parsing**: assert that `parseHandshakeToken(env)` reads `DEVS_IPC_HANDSHAKE_TOKEN`, decodes it, and returns a 32-byte `Buffer`; assert it throws `HandshakeTokenError` if the variable is absent or malformed (not 64 hex chars).
  - **Server validation**: write an integration test using `IpcServer` from task 01 where the server enforces the handshake token. The test:
    1. Generates a token, injects it into an env object, starts `IpcServer` with `{ requireHandshake: true, handshakeToken: token }`.
    2. Connects a client that sends the correct token as the first framed message and asserts the server sends back `{ ok: true }`.
    3. Connects a second client with a wrong token and asserts the connection is terminated with a `HANDSHAKE_FAILED` framed error within 100ms.
  - **Timing safety**: assert that the handshake comparison uses `crypto.timingSafeEqual` by mocking `crypto` and checking the call.
  - All tests must fail before implementation.

## 2. Task Implementation

- [ ] In `packages/ipc/src/handshake.ts`, implement:
  - `generateHandshakeToken(): Buffer` — calls `crypto.randomBytes(32)`.
  - `injectHandshakeToken(env: Record<string, string>, token: Buffer): void` — sets `env['DEVS_IPC_HANDSHAKE_TOKEN'] = token.toString('hex')`.
  - `parseHandshakeToken(env: Record<string, string>): Buffer` — reads and validates `DEVS_IPC_HANDSHAKE_TOKEN`; throws `HandshakeTokenError` on failure.
  - `class HandshakeTokenError extends Error` with a `code: 'HANDSHAKE_TOKEN_MISSING' | 'HANDSHAKE_TOKEN_INVALID'` field.
- [ ] Extend `IpcServer` (from task 01) to accept `requireHandshake: boolean` and `handshakeToken: Buffer` options:
  - After TCP/UDS connection is established, wait for the first framed message (timeout: 2000ms).
  - Parse the framed message as `{ type: 'HANDSHAKE', token: string }` JSON.
  - Compare using `crypto.timingSafeEqual(Buffer.from(received, 'hex'), handshakeToken)`.
  - On success: send framed `{ type: 'HANDSHAKE_OK' }` and promote the connection to authenticated state.
  - On failure or timeout: send framed `{ type: 'HANDSHAKE_FAILED', code: 'INVALID_TOKEN' | 'TIMEOUT' }`, then `socket.destroy()`.
- [ ] Extend `IpcClient` to accept `handshakeToken: Buffer` option:
  - Immediately after connection, send framed `{ type: 'HANDSHAKE', token: handshakeToken.toString('hex') }`.
  - Wait for `HANDSHAKE_OK` frame; throw `HandshakeTokenError` if `HANDSHAKE_FAILED` or timeout.
- [ ] The 128-bit token variant referenced in REQ-SEC-SD-014 is served by using the first 16 bytes of the 32-byte token for backwards compatibility; document this explicitly.

## 3. Code Review

- [ ] Confirm `crypto.timingSafeEqual` is used for all token comparisons (grep for `===` applied to token buffers; must be zero results).
- [ ] Confirm the handshake token never appears in structured logs — verify logger calls redact `DEVS_IPC_HANDSHAKE_TOKEN` before emission.
- [ ] Confirm the handshake timeout (2000ms) is configurable via `IpcServerOptions` but has a secure default.
- [ ] Confirm failed handshake attempts are counted and logged (as `warn`) with IP/socket path but not the token value.
- [ ] Verify that `injectHandshakeToken` mutates only the provided env object and never `process.env` directly (to avoid global state pollution).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/ipc test` — all tests in `handshake.test.ts` must pass.
- [ ] Run `pnpm --filter @devs/ipc tsc --noEmit` — zero TypeScript errors.
- [ ] Run the integration test with an intentionally wrong token and verify the connection is rejected and the test process does not hang.

## 5. Update Documentation

- [ ] Extend `docs/security/ipc-security.md` with a "Handshake Protocol" section:
  - Token size (256 bits), generation method (`crypto.randomBytes`), encoding (hex string in env var).
  - Protocol sequence diagram (mermaid): client connects → sends HANDSHAKE frame → server validates with `timingSafeEqual` → sends HANDSHAKE_OK or HANDSHAKE_FAILED.
  - Timeout and failure behaviour.
- [ ] Update `packages/ipc/index.agent.md` to record: "Handshake token: 32 bytes from `crypto.randomBytes`, passed as hex in `DEVS_IPC_HANDSHAKE_TOKEN`. Server uses `timingSafeEqual`. Timeout 2 s."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/ipc test --coverage` and assert branch coverage ≥ 90% for `handshake.ts`.
- [ ] Run `node scripts/verify-ipc-handshake.mjs` (create this script): spawns a server with a generated token, connects a client with the correct token, asserts `HANDSHAKE_OK`, then connects another client with a zero-filled token buffer and asserts the connection is destroyed within 200ms. Exit 0 = pass.
- [ ] Grep source for `timingSafeEqual` and assert exactly one occurrence per comparison site: `grep -rn "timingSafeEqual" packages/ipc/src/` must show ≥ 1 result.

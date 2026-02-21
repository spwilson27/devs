# Task: Implement Ephemeral 128-bit Session Key Rotation Per Sandbox Task (Sub-Epic: 08_Sandbox Lifecycle & Environment Management)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-043]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/sessionKey.test.ts`, write unit tests for a `SessionKeyManager` class:
  - Test `generateKey()`: assert the returned key is a `Buffer` of exactly 16 bytes (128 bits), generated via `crypto.randomBytes(16)`.
  - Test `generateKey()` called 1000 times: assert no two keys are identical (statistical uniqueness).
  - Test `registerKey(sandboxId, key)`: assert the key is stored associated with the `sandboxId` and can be retrieved via `getKey(sandboxId)`.
  - Test `revokeKey(sandboxId)`: assert that after revocation, `getKey(sandboxId)` returns `undefined` and the key buffer is zeroed in memory (overwrite with `0x00`).
  - Test that calling `revokeKey` on a non-existent `sandboxId` is a no-op and does not throw.
  - Test the full lifecycle: `generateKey` → `registerKey` → `getKey` → `revokeKey` → confirm key is gone.
  - Write an integration test verifying that when two sandbox tasks run concurrently, each receives a distinct key that cannot be retrieved by the other sandbox's ID.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/keys/SessionKeyManager.ts`:
  - Use a `Map<string, Buffer>` as internal key store (not persisted to disk).
  - Implement `generateKey(): Buffer`: returns `crypto.randomBytes(16)` (Node.js built-in, no external library).
  - Implement `registerKey(sandboxId: string, key: Buffer): void`: stores the key under `sandboxId`. Throws if a key is already registered for that `sandboxId` (force explicit revoke-then-register to prevent accidental overwrite).
  - Implement `getKey(sandboxId: string): Buffer | undefined`: returns the registered key or `undefined`.
  - Implement `revokeKey(sandboxId: string): void`:
    - Retrieves the buffer, overwrites it with `Buffer.alloc(16, 0)` to zero memory before GC.
    - Deletes the entry from the map.
  - Emit a structured log `{ event: 'session_key_rotated', sandboxId }` on each revocation (never log the key value).
- [ ] Integrate `SessionKeyManager` into the `SandboxOrchestrator`:
  - Before spawning a sandbox: call `generateKey()` and `registerKey(sandboxId, key)`.
  - Pass the key to `SecretInjector.inject` as part of the secrets map under the key name `DEVS_SESSION_KEY` (as a hex string).
  - After teardown (both success and failure paths): call `revokeKey(sandboxId)`.
- [ ] Export `SessionKeyManager` from `packages/sandbox/src/index.ts`.

## 3. Code Review
- [ ] Verify `crypto.randomBytes` is the sole source of entropy (no `Math.random`, no UUID libraries for key generation).
- [ ] Verify the key is zeroed in memory on revocation (buffer overwrite confirmed in unit test).
- [ ] Confirm that `DEVS_SESSION_KEY` is passed via `SecretInjector` (stdin/ephemeral file), never via command-line argument or environment variable in the Docker spawn call.
- [ ] Verify that `SessionKeyManager` is a singleton in the orchestrator process scope (single instance managing all sandbox keys).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test` and confirm all unit tests in `sessionKey.test.ts` pass, including the 1000-iteration uniqueness test.
- [ ] Run the concurrent-sandbox integration test and confirm distinct keys per sandbox.
- [ ] Confirm test coverage for `SessionKeyManager.ts` is ≥ 95%.

## 5. Update Documentation
- [ ] Create `packages/sandbox/src/keys/session_key.agent.md` documenting: key generation algorithm (128-bit, `crypto.randomBytes`), lifecycle (generate → register → use → revoke), the memory-zeroing revocation behavior, and the `DEVS_SESSION_KEY` contract consumed by agents inside the sandbox.
- [ ] Update `packages/sandbox/README.md` to add a "Session Key Rotation" section.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage --coverageThreshold='{"global":{"lines":95}}'` and confirm exit code 0.
- [ ] Run `grep -r "Math.random\|uuid" packages/sandbox/src/keys/` and assert empty output (no weak entropy sources).
- [ ] In CI, run the concurrent integration test and confirm exit code 0 and log lines showing `session_key_rotated` for each sandbox ID.

# Task: Implement Cryptographic Signing and Encryption MCP Tools in OrchestratorServer (Sub-Epic: 03_IPC Security & Authentication)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-CRY-006]

## 1. Initial Test Written

- [ ] In `packages/mcp-server/src/__tests__/crypto-tools.test.ts`, write unit and integration tests using the MCP SDK test utilities:
  - **`sign_payload` tool**:
    - Assert the tool is registered in the MCP tool manifest returned by `list_tools`.
    - Assert that calling `sign_payload({ payload: "hello", keyId: "session-key-1" })` returns `{ signature: string, keyId: string, algorithm: "HMAC-SHA256" }`.
    - Assert that the signature changes when the payload changes.
    - Assert that calling with an unknown `keyId` returns a structured error `{ error: 'KEY_NOT_FOUND' }`.
    - Assert that `verify_payload({ payload, signature, keyId })` returns `{ valid: true }` for a correctly signed payload and `{ valid: false }` for a tampered one.
  - **`encrypt_payload` tool**:
    - Assert the tool is registered in `list_tools`.
    - Assert `encrypt_payload({ plaintext: "secret", keyId: "session-key-1" })` returns `{ ciphertext: string, iv: string, tag: string, algorithm: "AES-256-GCM", keyId: string }`.
    - Assert `decrypt_payload({ ciphertext, iv, tag, keyId })` correctly recovers the original plaintext.
    - Assert that decryption with a tampered `tag` returns a structured error `{ error: 'DECRYPTION_FAILED' }`.
  - **`rotate_session_key` tool**:
    - Assert `rotate_session_key({ keyId: "session-key-1" })` returns `{ newKeyId: string, rotatedAt: string }`.
    - Assert the old `keyId` is no longer usable after rotation (subsequent `sign_payload` with old `keyId` returns `KEY_NOT_FOUND`).
  - **Key isolation**: assert that calling any crypto tool from an unauthenticated context (no Bearer token) returns HTTP 401 before reaching tool logic.
  - All tests must fail before implementation.

## 2. Task Implementation

- [ ] Create `packages/mcp-server/src/tools/crypto-tools.ts`:
  - Implement a `KeyStore` class (in-memory, scoped to the server process lifetime):
    - Stores `Map<string, CryptoKey>` where `CryptoKey` wraps a `Buffer` with metadata `{ algorithm, createdAt, rotatedAt? }`.
    - `set(keyId, key)`, `get(keyId): Buffer | undefined`, `rotate(keyId): string` (generates new key, stores under a new `keyId` with `v${n+1}` suffix, deletes old key).
  - **`sign_payload` MCP tool handler**:
    - Retrieves session key from `KeyStore` by `keyId`.
    - Computes `crypto.createHmac('sha256', key).update(payload).digest('base64url')`.
    - Returns `{ signature, keyId, algorithm: 'HMAC-SHA256' }`.
  - **`verify_payload` MCP tool handler**:
    - Recomputes signature and compares with `crypto.timingSafeEqual`.
    - Returns `{ valid: boolean }`.
  - **`encrypt_payload` MCP tool handler**:
    - Retrieves key from `KeyStore`.
    - Generates a 12-byte IV via `crypto.randomBytes(12)`.
    - Uses `crypto.createCipheriv('aes-256-gcm', key, iv)`.
    - Returns `{ ciphertext: base64url, iv: base64url, tag: base64url, algorithm: 'AES-256-GCM', keyId }`.
  - **`decrypt_payload` MCP tool handler**:
    - Uses `crypto.createDecipheriv('aes-256-gcm', key, iv)`, sets `authTag`.
    - Catches `Error` from GCM auth failure and returns `{ error: 'DECRYPTION_FAILED' }` (never re-throws to avoid stack trace leakage).
  - **`rotate_session_key` MCP tool handler**:
    - Calls `KeyStore.rotate(keyId)`, returns `{ newKeyId, rotatedAt: new Date().toISOString() }`.
  - Register all four tools in `OrchestratorServer` via `server.tool(name, schema, handler)` from the MCP SDK.
  - Ensure `KeyStore` is instantiated once per `OrchestratorServer` instance and injected into each tool handler (no global singleton).
- [ ] Session key seeding: at `OrchestratorServer` startup, generate an initial 256-bit key with `crypto.randomBytes(32)`, store it in `KeyStore` under key ID `"session-key-1"`. This key is used for initial CLI/Extension IPC message authentication before X25519 key exchange completes.

## 3. Code Review

- [ ] Verify `KeyStore` has no persistence to disk — all keys are ephemeral and exist only in process memory.
- [ ] Verify that key material is never serialised into any log output; tool responses must not include the raw key bytes.
- [ ] Confirm `decrypt_payload` swallows the GCM auth error internally and does not propagate the original exception (which may contain internal crypto state).
- [ ] Confirm `rotate_session_key` deletes the old key from `KeyStore` so it cannot be used after rotation.
- [ ] Verify all four tools appear in the `list_tools` response with accurate `inputSchema` and `description` fields (MCP spec compliance).
- [ ] Confirm the tool handlers themselves are protected by the Bearer auth middleware (tools are unreachable without a valid token).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/mcp-server test` — all tests in `crypto-tools.test.ts` must pass.
- [ ] Run `pnpm --filter @devs/mcp-server tsc --noEmit` — zero TypeScript errors.
- [ ] Manually invoke `list_tools` against a running dev server and verify the four crypto tools are listed with correct schemas.

## 5. Update Documentation

- [ ] Create `docs/architecture/mcp-crypto-tools.md` documenting:
  - Rationale: all cryptographic operations are centralised in the Orchestrator to keep key material out of agent sandboxes (REQ-SEC-CRY-006).
  - Tool catalogue with input/output schemas: `sign_payload`, `verify_payload`, `encrypt_payload`, `decrypt_payload`, `rotate_session_key`.
  - `KeyStore` lifetime: ephemeral, scoped to process, never written to disk.
  - Key rotation flow (mermaid sequence diagram).
- [ ] Update `packages/mcp-server/index.agent.md`: "Crypto tools available: sign_payload, verify_payload, encrypt_payload (AES-256-GCM), decrypt_payload, rotate_session_key. KeyStore is in-memory only. Keys never logged."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/mcp-server test --coverage` — line coverage ≥ 90% for `crypto-tools.ts`.
- [ ] Run `node scripts/verify-mcp-crypto-tools.mjs` (create this script):
  - Starts `OrchestratorServer` with a valid Bearer token.
  - Calls `sign_payload`, asserts a signature is returned.
  - Calls `verify_payload` with the correct signature, asserts `{ valid: true }`.
  - Calls `verify_payload` with a tampered signature, asserts `{ valid: false }`.
  - Calls `encrypt_payload` then `decrypt_payload`, asserts original plaintext is recovered.
  - Calls `rotate_session_key`, asserts new key ID returned.
  - Calls `sign_payload` with the old key ID, asserts `{ error: 'KEY_NOT_FOUND' }`.
  - Exit 0 = all assertions passed.
- [ ] Run `grep -rn "createHmac\|createCipheriv\|createDecipheriv" packages/mcp-server/src/tools/crypto-tools.ts` and assert all calls use approved algorithms (`sha256`, `aes-256-gcm`).

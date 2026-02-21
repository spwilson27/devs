# Task: Implement X25519 Key Exchange for IPC Session Encryption (Sub-Epic: 03_IPC Security & Authentication)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-CRY-004]

## 1. Initial Test Written

- [ ] In `packages/ipc/src/__tests__/key-exchange.test.ts`, write unit and integration tests:
  - **Key pair generation**: assert `generateX25519KeyPair()` returns an object with `publicKey: Buffer` (32 bytes) and `privateKey: Buffer` (32 bytes), and that successive calls return different key pairs.
  - **ECDH shared secret**: assert `deriveSharedSecret(privateKey, peerPublicKey)` returns a `Buffer` of 32 bytes, and that both sides of an exchange derive the **same** shared secret (symmetric property).
  - **Key derivation**: assert `deriveSessionKeys(sharedSecret, salt)` returns `{ encryptKey: Buffer, macKey: Buffer }` where each key is 32 bytes (HKDF-SHA256 with labels `"devs-ipc-enc"` and `"devs-ipc-mac"`).
  - **Rotation**: assert that after `rotateSessionKey(session)`, the old `encryptKey` is replaced and the new key differs from the old one.
  - **Integration**: write a full key exchange round-trip test: two virtual peers each generate a key pair, exchange public keys, derive shared secrets independently, and assert both `encryptKey` values are byte-for-byte identical.
  - **Replay prevention**: assert that reusing the same ephemeral public key twice in the same session triggers a `KeyReuseError`.
  - All tests must fail before implementation.

## 2. Task Implementation

- [ ] In `packages/ipc/src/key-exchange.ts`, implement using Node.js built-in `crypto` module (no external libraries):
  - `generateX25519KeyPair(): { publicKey: Buffer; privateKey: Buffer }` — uses `crypto.generateKeyPairSync('x25519', { publicKeyEncoding: { type: 'raw', format: 'buffer' }, privateKeyEncoding: { type: 'raw', format: 'buffer' } })`.
  - `deriveSharedSecret(privateKey: Buffer, peerPublicKey: Buffer): Buffer` — creates `crypto.createDiffieHellman` or uses `crypto.diffieHellman({ privateKey: ..., publicKey: ... })` with `x25519` curve.
  - `deriveSessionKeys(sharedSecret: Buffer, salt: Buffer): { encryptKey: Buffer; macKey: Buffer }` — uses `crypto.hkdfSync('sha256', sharedSecret, salt, Buffer.from('devs-ipc-enc'), 32)` and `Buffer.from('devs-ipc-mac')` for mac key.
  - `class IpcKeyExchange` that encapsulates the full exchange flow:
    - `constructor()` calls `generateX25519KeyPair()` and stores the key pair internally.
    - `getPublicKey(): Buffer` returns the ephemeral public key to send to the peer.
    - `completeExchange(peerPublicKey: Buffer, salt: Buffer): IpcSession` — calls `deriveSharedSecret` + `deriveSessionKeys`, returns `IpcSession` containing `{ encryptKey, macKey, sessionId: uuid }`.
    - Tracks used peer public keys in a `Set<string>` (hex-encoded); throws `KeyReuseError` on reuse.
  - `class KeyReuseError extends Error` with `code: 'KEY_REUSE'`.
- [ ] Integrate key exchange into the `IpcServer`/`IpcClient` handshake flow (extend task 02's handshake):
  - After the HANDSHAKE_OK, the server sends its ephemeral X25519 public key as a framed `{ type: 'KEY_EXCHANGE_INIT', publicKey: hex }` message.
  - The client replies with its own ephemeral public key as `{ type: 'KEY_EXCHANGE_RESPONSE', publicKey: hex }`.
  - Both sides derive the shared secret and session keys independently.
  - A shared `salt` is derived as `SHA256(serverPublicKey || clientPublicKey)`.
  - Subsequent messages on the channel use AEAD encryption (ChaCha20-Poly1305 or AES-256-GCM) with the derived `encryptKey`.
- [ ] Implement `rotateSessionKey(session: IpcSession): IpcSession` that performs a new HKDF derivation from the current session's mac key as input key material, producing new `encryptKey` and `macKey`.

## 3. Code Review

- [ ] Verify only `node:crypto` built-ins are used (no `tweetnacl`, `sodium-native`, or other user-land X25519 libraries).
- [ ] Confirm `privateKey` bytes are overwritten with zeros after `completeExchange` using `privateKey.fill(0)`.
- [ ] Confirm `peerPublicKey` reuse detection is in place and raises `KeyReuseError`.
- [ ] Confirm HKDF uses a non-empty salt (derived from both public keys) and distinct info strings for each derived key.
- [ ] Confirm that if the `KEY_EXCHANGE_RESPONSE` is not received within 3 seconds, the server destroys the socket.
- [ ] Ensure `IpcSession` objects are not logged in their entirety; only `sessionId` (UUID) is safe to log.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/ipc test` — all tests in `key-exchange.test.ts` must pass.
- [ ] Run `pnpm --filter @devs/ipc tsc --noEmit` — zero TypeScript errors.
- [ ] Confirm the `KeyReuseError` path is exercised by at least one test.

## 5. Update Documentation

- [ ] Extend `docs/security/ipc-security.md` with a "Key Exchange" section:
  - Algorithm: X25519 ECDH.
  - Key derivation: HKDF-SHA256 with distinct labels for enc/mac keys.
  - Session rotation trigger: on-demand via `rotateSessionKey`.
  - Private key zeroing after use.
  - Mermaid sequence diagram showing: Server generates key pair → sends public key → Client generates key pair → replies with public key → both derive session keys.
- [ ] Update `packages/ipc/index.agent.md`: "Key exchange: X25519 ECDH with HKDF-SHA256 session key derivation. Private keys zeroed after exchange. Peer public key reuse tracked per session."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/ipc test --coverage` — branch coverage ≥ 90% for `key-exchange.ts`.
- [ ] Run `node scripts/verify-ipc-key-exchange.mjs` (create this script): performs a full key exchange between two in-process `IpcKeyExchange` instances, asserts derived `encryptKey` bytes are identical, then intentionally reuses a peer public key and asserts `KeyReuseError` is thrown. Exit 0 = pass.
- [ ] Run `grep -rn "require\|from" packages/ipc/src/key-exchange.ts | grep -v "node:crypto\|./\|../\|types"` and assert zero results (no third-party crypto imports).

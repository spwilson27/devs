# Task: Implement Vector Database Encryption at Rest (Sub-Epic: 16_Vector_Memory_Security_and_Integrity)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-037]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/__tests__/vector-encryption.test.ts`.
- [ ] Write a unit test `encryptBlob_roundtrip` that:
  - Generates a 256-bit AES-GCM project master key using `crypto.subtle.generateKey`.
  - Calls a `encryptBlob(plaintext: Uint8Array, key: CryptoKey): Promise<EncryptedBlob>` function.
  - Asserts the returned object contains `{ iv: Uint8Array, ciphertext: Uint8Array }` and that `ciphertext` is NOT equal to `plaintext`.
  - Calls a matching `decryptBlob(blob: EncryptedBlob, key: CryptoKey): Promise<Uint8Array>` function and asserts round-trip equality.
- [ ] Write a unit test `encryptBlob_differentIVEachCall` that calls `encryptBlob` twice with the same plaintext and key, then asserts that the two returned `iv` values are different (each call uses a fresh random IV).
- [ ] Write a unit test `VectorStore_persistsEncryptedRecord` that:
  - Stubs LanceDB's `table.add()` to capture what is actually written.
  - Calls `VectorStore.add(record)` on a store configured with a master key.
  - Asserts that the captured `content` field is a `Buffer`/`Uint8Array` (encrypted ciphertext), NOT a plain string.
- [ ] Write a unit test `VectorStore_decryptsOnRead` that:
  - Stubs LanceDB's `table.search()` to return a pre-built row where `content` is an encrypted blob.
  - Calls `VectorStore.search(query)` and asserts the returned record's `content` field is the original plaintext string.
- [ ] Write an integration test `VectorStore_integration_encryptDecryptRoundtrip` that:
  - Instantiates a real `LanceDB` table in a temp directory.
  - Inserts one record via `VectorStore.add()`.
  - Reads it back via `VectorStore.search()`.
  - Asserts plaintext is preserved and the raw on-disk LanceDB file does NOT contain the plaintext string (use `grep -r` on the temp dir).
- [ ] Write a unit test `MasterKeyManager_loadsKeyFromEnv` that mocks `process.env.DEVS_MASTER_KEY` and asserts `MasterKeyManager.getKey()` imports it as a `CryptoKey`.
- [ ] Write a unit test `MasterKeyManager_throwsIfKeyMissing` that unsets `DEVS_MASTER_KEY` and asserts `MasterKeyManager.getKey()` throws a `MissingMasterKeyError`.

## 2. Task Implementation
- [ ] Create `packages/memory/src/crypto/blob-cipher.ts`:
  - Export `interface EncryptedBlob { iv: Uint8Array; ciphertext: Uint8Array }`.
  - Export `async function encryptBlob(plaintext: Uint8Array, key: CryptoKey): Promise<EncryptedBlob>` using `crypto.subtle.encrypt` with algorithm `{ name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) }`.
  - Export `async function decryptBlob(blob: EncryptedBlob, key: CryptoKey): Promise<Uint8Array>` using `crypto.subtle.decrypt`.
- [ ] Create `packages/memory/src/crypto/master-key-manager.ts`:
  - Export `class MasterKeyManager` with a static `getKey(): Promise<CryptoKey>` method.
  - Read `process.env.DEVS_MASTER_KEY` (a base64-encoded 256-bit key). Throw `MissingMasterKeyError` if absent.
  - Import the raw bytes with `crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])`.
  - Cache the resolved `CryptoKey` in a module-level singleton to avoid repeated imports.
- [ ] Modify `packages/memory/src/vector-store.ts` (`VectorStore` class):
  - Accept an optional `masterKey?: CryptoKey` in the constructor (obtained via `MasterKeyManager.getKey()` when not supplied).
  - In `add(record: MemoryRecord)`: serialize `record.content` to `Uint8Array`, call `encryptBlob`, then store `{ ...record, content: Buffer.from(ciphertext), iv: Buffer.from(iv) }` in LanceDB. Store `iv` as a separate column named `iv` (type `blob`).
  - In `search(query, opts)`: after receiving rows from LanceDB, for each row call `decryptBlob({ iv: row.iv, ciphertext: row.content }, this.masterKey)` and replace `row.content` with the decoded UTF-8 string before returning.
- [ ] Update the LanceDB schema definition in `packages/memory/src/schema.ts` to add an `iv` column of type `blob` (non-null) alongside the existing `content: blob` column.
- [ ] Add `DEVS_MASTER_KEY` to the project's `.env.example` with a comment: `# 256-bit AES-GCM key, base64-encoded. Generate with: openssl rand -base64 32`.
- [ ] Document key generation in `docs/memory/encryption.md` (one paragraph explaining the AES-GCM scheme, IV handling, and key sourcing).

## 3. Code Review
- [ ] Verify that `encryptBlob` never reuses IVs (fresh `crypto.getRandomValues` per call).
- [ ] Verify that the `CryptoKey` is imported with `extractable: false` so it cannot be serialized back.
- [ ] Verify that `MasterKeyManager` caches the key in memory and does NOT log or expose it.
- [ ] Verify that the `iv` column is stored alongside every encrypted row — no row should be inserted without a corresponding `iv`.
- [ ] Verify that no plaintext `content` string is ever passed directly to LanceDB's `table.add()`.
- [ ] Verify that the `decryptBlob` call in `search` is `await`-ed before the results array is returned.
- [ ] Confirm there are no circular imports between `vector-store.ts`, `master-key-manager.ts`, and `blob-cipher.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="vector-encryption|VectorStore"` and confirm all new tests pass.
- [ ] Run the full memory package test suite `pnpm --filter @devs/memory test` and confirm no regressions.
- [ ] Run the integration test with `pnpm --filter @devs/memory test:integration` and confirm the on-disk plaintext check passes.

## 5. Update Documentation
- [ ] Update `docs/memory/encryption.md` with: AES-GCM scheme details, IV column storage rationale, and instructions for rotating the master key.
- [ ] Update `packages/memory/README.md` to note that `VectorStore` now requires `DEVS_MASTER_KEY` in the environment.
- [ ] Add an entry to the project-level `CHANGELOG.md` under `Phase 4` noting vector encryption at rest.
- [ ] Update agent memory (`docs/agent-memory/phase_4_decisions.md`) with decision: "All LanceDB content blobs are encrypted at rest with AES-GCM using a per-deployment master key stored in `DEVS_MASTER_KEY`."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test -- --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm the coverage threshold is met.
- [ ] Run the integration test shell script `scripts/verify_vector_encryption.sh` which:
  1. Generates a fresh `DEVS_MASTER_KEY`.
  2. Inserts a known plaintext string (`"SENTINEL_PLAINTEXT"`) via `VectorStore.add()`.
  3. Uses `grep -r "SENTINEL_PLAINTEXT"` on the `.devs/memory.lancedb` directory and asserts the string is NOT found (exit code 1).
  4. Retrieves the record via `VectorStore.search()` and asserts the plaintext IS returned correctly.
  5. Exits 0 on success, non-zero on any failure.
- [ ] Confirm CI pipeline step `test:memory` exits 0.

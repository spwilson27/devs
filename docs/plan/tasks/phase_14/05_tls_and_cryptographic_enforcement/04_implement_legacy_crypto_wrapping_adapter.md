# Task: Implement Legacy Crypto Wrapping Adapter with Audit Flags (Sub-Epic: 05_TLS and Cryptographic Enforcement)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-EDG-001]

## 1. Initial Test Written
- [ ] In `src/crypto/__tests__/legacy-adapter.test.ts`, write a unit test that imports `LegacyCryptoAdapter` and calls `wrapHash('md5', data)`. Assert: (a) the correct MD5 digest is returned, and (b) the audit log emitter fires a `'legacy-crypto-usage'` event with `{ primitive: 'md5', callerStack: string }`.
- [ ] Write a test for `wrapHash('sha1', data)` asserting the same audit event fires with `primitive: 'sha1'`.
- [ ] Write a test for `wrapSymmetricCipher('aes-128-cbc', ...)` asserting: (a) encryption/decryption round-trips correctly, and (b) the audit event fires with `primitive: 'aes-128-cbc'`.
- [ ] Write a test verifying `LegacyCryptoAdapter` throws `LegacyPrimitiveError` when called with a primitive that is neither a recognized legacy primitive nor an approved modern one (i.e., an unknown string), to prevent misuse as a generic crypto facade.
- [ ] Write a test confirming that `getAuditLog()` returns an in-memory list of all `LegacyCryptoUsageEvent` entries emitted during the test run.

## 2. Task Implementation
- [ ] Create `src/crypto/legacy-adapter.ts`. Add a top-of-file comment block:
  ```ts
  /**
   * HUMAN AUDIT REQUIRED
   * [5_SECURITY_DESIGN-REQ-SEC-EDG-001]: This module wraps legacy cryptographic
   * primitives (MD5, SHA-1, AES-CBC) required for compatibility with external
   * systems. These primitives are cryptographically weak and MUST be reviewed
   * during each security audit cycle. Do NOT use for new code.
   */
  ```
- [ ] Define and export:
  - `LEGACY_PRIMITIVES: readonly string[]` — `['md5', 'sha1', 'aes-128-cbc', 'des-ede3-cbc']`.
  - `LegacyPrimitiveError extends Error`.
  - `LegacyCryptoUsageEvent: { primitive: string; timestamp: string; callerStack: string }`.
  - `legacyCryptoAuditEmitter: EventEmitter` — emits `'legacy-crypto-usage'` events.
  - `getAuditLog(): LegacyCryptoUsageEvent[]` — returns accumulated in-memory log.
  - `wrapHash(algorithm: string, data: Buffer | string): Buffer` — calls `crypto.createHash(algorithm)`, emits audit event, returns digest.
  - `wrapSymmetricCipher(algorithm: string, key: Buffer, iv: Buffer): { encrypt(plain: Buffer): Buffer; decrypt(cipher: Buffer): Buffer }` — creates cipher/decipher pair, emits audit event.
- [ ] Both `wrapHash` and `wrapSymmetricCipher` MUST validate that `algorithm` is in `LEGACY_PRIMITIVES`; throw `LegacyPrimitiveError` otherwise.
- [ ] Capture caller stack via `new Error().stack` at call time and include it in the audit event.
- [ ] In `src/crypto/index.ts` (create if absent), re-export `LegacyCryptoAdapter` with a JSDoc `@deprecated` tag to trigger IDE warnings at call sites.

## 3. Code Review
- [ ] Verify the audit emitter fires synchronously before the crypto operation returns, so no audit event is lost if the caller throws.
- [ ] Verify `LEGACY_PRIMITIVES` is `readonly` and not exported as a mutable array.
- [ ] Verify the `@deprecated` JSDoc is present on every exported symbol in `src/crypto/index.ts` that proxies legacy functions.
- [ ] Verify TypeScript strict mode: no `any`, no implicit `any` in event types.
- [ ] Confirm there is no path through `wrapHash` or `wrapSymmetricCipher` that silently skips audit logging.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/crypto/__tests__/legacy-adapter.test.ts --coverage` and confirm all tests pass with ≥ 95 % line coverage on `legacy-adapter.ts`.
- [ ] Run `npm test` to confirm no regressions.

## 5. Update Documentation
- [ ] Add a section "Legacy Cryptographic Primitives" to `docs/security.md`: "Legacy primitives (MD5, SHA-1, AES-CBC) are wrapped in `src/crypto/legacy-adapter.ts` (REQ-SEC-EDG-001). Every invocation emits a `legacy-crypto-usage` audit event. This module is flagged `@deprecated` and requires human review each security audit cycle."
- [ ] Create `docs/runbooks/legacy-crypto-audit.md` explaining how to query the audit log, review `LegacyCryptoUsageEvent` entries, and plan migration away from legacy primitives.
- [ ] Update `memory/architecture-decisions.md`: "ADR-SEC-004: Legacy crypto primitives wrapped in LegacyCryptoAdapter with mandatory audit event emission and human-review annotation."

## 6. Automated Verification
- [ ] Run:
  ```bash
  node -e "
  const {wrapHash, getAuditLog, legacyCryptoAuditEmitter} = require('./dist/crypto/legacy-adapter');
  const events = [];
  legacyCryptoAuditEmitter.on('legacy-crypto-usage', e => events.push(e));
  wrapHash('md5', Buffer.from('test'));
  if (events.length === 0) { console.error('No audit event emitted'); process.exit(1); }
  if (events[0].primitive !== 'md5') { console.error('Wrong primitive in event'); process.exit(1); }
  console.log('Legacy crypto audit event verified ✓');
  "
  ```
  Assert exit code 0.
- [ ] Run `grep -r "HUMAN AUDIT REQUIRED" dist/crypto/legacy-adapter.js` (or the source map equivalent) and assert the comment is present in source.

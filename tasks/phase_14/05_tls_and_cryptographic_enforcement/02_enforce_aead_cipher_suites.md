# Task: Enforce AEAD-Only Cipher Suites for External Communication (Sub-Epic: 05_TLS and Cryptographic Enforcement)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-028]

## 1. Initial Test Written
- [ ] In `src/network/__tests__/cipher-policy.test.ts`, write a unit test that imports `getAeadCipherList()` from `src/network/cipher-policy.ts` and asserts every entry in the returned array matches the pattern `/^(TLS_AES|TLS_CHACHA20)/` (TLS 1.3 AEAD suites).
- [ ] Write a test that constructs the composed `https.Agent` (via `buildSecureAgent()`) and reads its `ciphers` property, asserting it equals the colon-joined output of `getAeadCipherList()`.
- [ ] Write a negative test: construct an `https.Agent` with a known non-AEAD cipher (`RC4-SHA`) and confirm a custom validation function `validateCiphers(agent)` returns `false` (or throws).
- [ ] Write an integration test using an HTTPS test server forced to negotiate a non-AEAD cipher suite; assert the client refuses the handshake with a TLS error.

## 2. Task Implementation
- [ ] Create `src/network/cipher-policy.ts`. Export:
  - `AEAD_CIPHER_LIST: readonly string[]` — the approved list:
    ```
    ['TLS_AES_256_GCM_SHA384', 'TLS_AES_128_GCM_SHA256', 'TLS_CHACHA20_POLY1305_SHA256']
    ```
  - `getAeadCipherList(): readonly string[]` — returns `AEAD_CIPHER_LIST`.
  - `validateCiphers(agent: https.Agent): boolean` — introspects `agent.options.ciphers` and asserts all suites are in `AEAD_CIPHER_LIST`.
- [ ] Update `getTlsAgentOptions()` in `src/network/http-client.ts` to spread the cipher configuration:
  ```ts
  ciphers: getAeadCipherList().join(':'),
  honorCipherOrder: true,
  ```
- [ ] Add a module-level comment `// [5_SECURITY_DESIGN-REQ-SEC-SD-028]: AEAD-only cipher suites enforced` above `AEAD_CIPHER_LIST`.
- [ ] Update `buildSecureAgent()` (or the singleton construction) in `http-client.ts` to call `getTlsAgentOptions()`, which now includes the cipher list.

## 3. Code Review
- [ ] Verify `AEAD_CIPHER_LIST` contains only TLS 1.3 suites (GCM or CHACHA20-POLY1305). No CBC, RC4, or stream ciphers.
- [ ] Confirm `honorCipherOrder: true` is set so the server cannot downgrade to a weaker suite.
- [ ] Confirm `cipher-policy.ts` has zero runtime side effects at import time (pure constants and functions).
- [ ] Check TypeScript: `AEAD_CIPHER_LIST` must be `readonly string[]`, not a mutable array.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/network/__tests__/cipher-policy.test.ts --coverage` and confirm all tests pass with ≥ 90 % line coverage on `cipher-policy.ts`.
- [ ] Run `npm test` to confirm no regressions in the broader suite.

## 5. Update Documentation
- [ ] Append to `docs/security.md` under "TLS Policy": "Permitted cipher suites are restricted to AEAD-only (REQ-SEC-SD-028). Approved list: `TLS_AES_256_GCM_SHA384`, `TLS_AES_128_GCM_SHA256`, `TLS_CHACHA20_POLY1305_SHA256`. Defined in `src/network/cipher-policy.ts`."
- [ ] Update `memory/architecture-decisions.md` with: "ADR-SEC-002: Cipher suite allowlist restricted to AEAD suites for all external TLS connections."

## 6. Automated Verification
- [ ] Run:
  ```bash
  node -e "
  const {getAeadCipherList} = require('./dist/network/cipher-policy');
  const list = getAeadCipherList();
  const nonAead = list.filter(c => !c.startsWith('TLS_AES') && !c.startsWith('TLS_CHACHA20'));
  if (nonAead.length > 0) { console.error('Non-AEAD ciphers found:', nonAead); process.exit(1); }
  console.log('AEAD-only cipher policy verified ✓');
  "
  ```
  Assert exit code 0.
- [ ] Confirm `grep -r "honorCipherOrder" dist/network/http-client.js` returns a match.

# Task: Implement Certificate Pinning for Gemini API Endpoints (Sub-Epic: 05_TLS and Cryptographic Enforcement)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-029]

## 1. Initial Test Written
- [ ] In `src/network/__tests__/cert-pin.test.ts`, write a unit test for `PinningAgent` that mocks Node's TLS `'secureConnect'` event and passes a fake `getPeerCertificate()` response with a known SPKI SHA-256 fingerprint. Assert the connection is accepted.
- [ ] Write a unit test where the fake peer certificate returns an SPKI fingerprint NOT in `GEMINI_PINS`; assert the socket is destroyed and a `CertPinViolationError` is emitted / thrown.
- [ ] Write a test for `loadPins(pinFilePath: string)` that reads a fixture JSON file (`tests/fixtures/gemini-pins.json`) and asserts the returned `Set<string>` matches the expected SHA-256 hex strings.
- [ ] Write a test that calls `PinningAgent` with an expired / revoked certificate fingerprint that IS in the pin set; assert it is still accepted (pinning does not replace OCSP but supplements it).
- [ ] Write a regression test that passes `null` from `getPeerCertificate()` (e.g., non-TLS upgrade) and asserts the socket is destroyed.

## 2. Task Implementation
- [ ] Create `src/network/cert-pin.ts`. Implement:
  - `GEMINI_PINS: ReadonlySet<string>` — SHA-256 SPKI fingerprints for `generativelanguage.googleapis.com` and its intermediate CA. Populate by running:
    ```bash
    openssl s_client -connect generativelanguage.googleapis.com:443 2>/dev/null \
      | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der \
      | openssl dgst -sha256 -binary | base64
    ```
    Store as hex strings. Also pin the intermediate (Google Trust Services) for rotation resilience.
  - `CertPinViolationError extends Error` — thrown on mismatch.
  - `createPinningAgent(pins: ReadonlySet<string>): https.Agent` — subclasses (or wraps) `https.Agent` to attach a `'secureConnect'` listener per socket that validates the peer's SPKI fingerprint.
  - `loadPins(filePath: string): Promise<ReadonlySet<string>>` — loads pins from a JSON file at `filePath` for operator-managed pin rotation.
- [ ] In `src/network/http-client.ts`, update `buildSecureAgent()` to compose `createPinningAgent(GEMINI_PINS)` on top of the existing TLS 1.3 + AEAD options.
- [ ] Add a module-level comment `// [5_SECURITY_DESIGN-REQ-SEC-SD-029]: SPKI certificate pinning for Gemini API endpoints` above `GEMINI_PINS`.
- [ ] Add a `DEVS_PIN_FILE` environment variable check: if set, call `loadPins(process.env.DEVS_PIN_FILE)` at startup to override the bundled pins (supports operator-managed rotation without code deploys).
- [ ] Create `config/gemini-pins.json` containing the initial set of SPKI pins (base64 and hex both present for auditability).

## 3. Code Review
- [ ] Verify the SPKI fingerprint is extracted from `certificate.raw` (DER-encoded SubjectPublicKeyInfo) and hashed with `crypto.createHash('sha256')`, not from the full certificate DER.
- [ ] Confirm the socket is destroyed synchronously on mismatch — no async gap where data could flow.
- [ ] Confirm `CertPinViolationError` includes the mismatched fingerprint in its message for forensic logging.
- [ ] Confirm `createPinningAgent` composes cleanly with the shared `https.Agent` options from `getTlsAgentOptions()` (no duplication of TLS version or cipher settings).
- [ ] Confirm `GEMINI_PINS` is a `ReadonlySet` — not a mutable array — to prevent accidental mutation.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/network/__tests__/cert-pin.test.ts --coverage` and confirm all tests pass with ≥ 90 % line coverage on `cert-pin.ts`.
- [ ] Run `npm test` to confirm no regressions.

## 5. Update Documentation
- [ ] Append to `docs/security.md`: "Certificate Pinning (REQ-SEC-SD-029): SPKI SHA-256 pins for `generativelanguage.googleapis.com` are bundled in `config/gemini-pins.json`. Operator rotation is supported via `DEVS_PIN_FILE` env var. A `CertPinViolationError` is thrown on mismatch and the socket is immediately destroyed."
- [ ] Document pin rotation procedure in `docs/runbooks/cert-pin-rotation.md`: steps to extract a new SPKI fingerprint, update `config/gemini-pins.json`, and redeploy.
- [ ] Update `memory/architecture-decisions.md`: "ADR-SEC-003: Certificate pinning uses SPKI SHA-256 fingerprints bundled at build time with operator override via DEVS_PIN_FILE."

## 6. Automated Verification
- [ ] Run:
  ```bash
  node -e "
  const {GEMINI_PINS} = require('./dist/network/cert-pin');
  if (!GEMINI_PINS || GEMINI_PINS.size === 0) { console.error('No pins loaded'); process.exit(1); }
  console.log('Certificate pins loaded (' + GEMINI_PINS.size + ' pins) ✓');
  "
  ```
  Assert exit code 0 and pin count ≥ 2 (leaf + intermediate).
- [ ] Run `npx jest --testPathPattern=cert-pin --verbose` and assert 0 test failures in CI output.

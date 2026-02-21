# Task: SHA-256 Hash-Based Secret Masking with Collision Mitigation (Sub-Epic: 22_Agent Identity and Conflict Resolution)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-RSK-201]

## 1. Initial Test Written
- [ ] Create `src/security/masking/__tests__/SecretMasker.hash.test.ts`.
- [ ] Write a unit test `should replace a detected secret with a SHA-256 prefix placeholder` that calls `maskSecret('ghp_MySecretToken123', 'test-input')` and asserts the output matches the pattern `[REDACTED:sha256:<first-12-chars-of-sha256-hex>]` where `<first-12-chars-of-sha256-hex>` is the first 12 hexadecimal characters of the SHA-256 hash of the literal secret string.
- [ ] Write a unit test `should produce deterministic placeholders for the same secret` that calls `maskSecret` twice with the same secret and asserts both produce identical `[REDACTED:sha256:...]` strings.
- [ ] Write a unit test `should produce distinct placeholders for different secrets` that masks two different secret strings and asserts their 12-char SHA-256 prefixes are different.
- [ ] Write a unit test `should not truncate placeholders to fewer than 12 characters` that asserts `placeholder.length === 'REDACTED:sha256:'.length + 12` (i.e., exactly 12 hex chars after the prefix).
- [ ] Write a property-based test (using `fast-check` or similar) `any two distinct secrets should have a collision probability below 1 in 2^48` — generate 10,000 random secret strings, compute 12-char SHA-256 prefixes, and assert the collision count is 0.
- [ ] Write a regression test `should correctly reconstruct which secret produced a given redaction marker` by building a `SecretCorrelationLog` from the masking run and asserting the 12-char hash prefix appears in the log alongside the original secret length (but NOT the secret plaintext).

## 2. Task Implementation
- [ ] Open `src/security/masking/SecretMasker.ts` (the existing implementation).
- [ ] Replace any existing truncation/placeholder scheme with the following: when a secret is detected (by regex or entropy heuristic), compute `crypto.createHash('sha256').update(secretPlaintext).digest('hex').slice(0, 12)` and replace the secret occurrence with `[REDACTED:sha256:<12-char-prefix>]`.
- [ ] Maintain an in-memory `SecretCorrelationLog` (a `Map<string, { hashPrefix: string; secretLength: number; detectedAt: string }>`) that records the 12-char prefix → metadata mapping WITHOUT storing the plaintext secret. This enables audit correlation without re-exposing the secret.
- [ ] Expose `getCorrelationLog(): ReadonlyMap<string, { hashPrefix: string; secretLength: number; detectedAt: string }>` on the `SecretMasker` class.
- [ ] Ensure `crypto.createHash` is imported from Node.js built-ins (no third-party hashing library).
- [ ] Add `// REQ: 5_SECURITY_DESIGN-REQ-SEC-RSK-201` inline comment above the `slice(0, 12)` call.
- [ ] Update `src/security/masking/index.ts` to export `SecretCorrelationLog` type.

## 3. Code Review
- [ ] Confirm no plaintext secret is ever stored in the `SecretCorrelationLog` — only the 12-char prefix and metadata.
- [ ] Verify the `slice(0, 12)` is applied to the hex-encoded digest (64 chars), not the raw binary buffer, ensuring the prefix is always printable ASCII.
- [ ] Confirm the `SecretCorrelationLog` is scoped to the `SecretMasker` instance (not a global singleton) so it is garbage-collected when the masking context ends, preventing long-lived memory growth.
- [ ] Verify TypeScript strict mode: the `getCorrelationLog` return type uses `ReadonlyMap` to prevent external mutation.
- [ ] Ensure the property-based test is included in the CI test run (not skipped via `.skip`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=SecretMasker.hash` and confirm all tests pass with zero failures.
- [ ] Run `npm run lint` and confirm zero errors in `src/security/masking/`.
- [ ] Run `npm run build` and confirm zero TypeScript compilation errors.

## 5. Update Documentation
- [ ] Update `docs/security/secret-masking.md` (create if absent) to document the SHA-256 12-char prefix scheme, the collision probability rationale (2^48 space), and the `SecretCorrelationLog` audit capability. Reference `5_SECURITY_DESIGN-REQ-SEC-RSK-201`.
- [ ] Add a note to `docs/security/agent-identity.md` cross-referencing the redaction scheme used when logging agent identity violations (to ensure identity-related secrets in logs are also redacted via this mechanism).

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=SecretMasker.hash --coverage` and assert line coverage for `SecretMasker.ts` is ≥ 90%.
- [ ] Run `grep -rn "5_SECURITY_DESIGN-REQ-SEC-RSK-201" src/` and confirm at least one match exists in `SecretMasker.ts`.
- [ ] Run the property-based test in isolation (`npm test -- --testPathPattern=SecretMasker.hash --verbose`) and confirm the collision count line logs `0 collisions detected in 10000 samples`.

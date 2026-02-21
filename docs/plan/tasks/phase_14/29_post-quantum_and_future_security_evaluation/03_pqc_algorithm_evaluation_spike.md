# Task: Post-Quantum Cryptography Algorithm Evaluation Spike (Sub-Epic: 29_Post-Quantum and Future Security Evaluation)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-QST-201]

## 1. Initial Test Written
- [ ] In `src/crypto/__tests__/pqc-evaluation.test.ts`, write unit tests that:
  - Assert `PQCAlgorithmRegistry` exports a `getAlgorithm(name: 'kyber-768' | 'kyber-1024' | 'dilithium3')` function that returns a typed `PQCAlgorithmDescriptor`.
  - Assert `PQCAlgorithmDescriptor` has fields: `name: string`, `securityLevel: number`, `keyEncapsulationMechanism: boolean`, `nistStatus: 'draft' | 'final' | 'candidate'`, `nodeJsSupport: 'native' | 'wasm' | 'unavailable'`.
  - Assert `assessNodeJsSupport(algorithmName: string): 'native' | 'wasm' | 'unavailable'` returns `'unavailable'` for unrecognized names.
  - Assert `assessNodeJsSupport('kyber-768')` returns either `'wasm'` or `'unavailable'` (never `'native'` for Kyber until Node.js adds native support).
  - Assert `generatePQCEvaluationReport()` returns a `PQCEvaluationReport` with at least one algorithm entry.
  - Assert `PQCEvaluationReport.recommendation` is one of `'implement-now' | 'monitor' | 'defer'`.
  - Assert the report serializes to valid JSON.
  - Write a test that `recommendation` is `'monitor'` when NIST status is `'final'` but Node.js support is `'wasm'` (no native support yet).
  - Write a test that `recommendation` is `'defer'` when NIST status is `'candidate'`.
  - Write a test verifying the report includes a `currentIPCCipherSuite` field describing the existing TLS 1.3 AEAD cipher in use.

## 2. Task Implementation
- [ ] Create `src/crypto/pqc-algorithm-registry.ts`:
  - Define types: `PQCAlgorithmDescriptor`, `PQCEvaluationReport`.
  - Populate registry with NIST PQC finalists: Kyber-768, Kyber-1024 (FIPS 203 / ML-KEM), Dilithium3 (FIPS 204 / ML-DSA).
  - Implement `assessNodeJsSupport(name: string)` that checks the Node.js `crypto.getHashes()` and `crypto.getCiphers()` output plus tries dynamic `require('kyber-crystals')` with a try/catch to determine `'wasm'` vs `'unavailable'`.
  - Add `// REQ: 5_SECURITY_DESIGN-REQ-SEC-QST-201` comment at top of file.
- [ ] Create `src/crypto/pqc-evaluation.ts`:
  - Implement `generatePQCEvaluationReport(): PQCEvaluationReport`:
    - Enumerate all registry entries.
    - For each: record `nistStatus`, `nodeJsSupport`, `keySize` (bytes), `ciphertextSize` (bytes).
    - Derive `recommendation` per algorithm using the rule set:
      - `nistStatus === 'final' && nodeJsSupport !== 'unavailable'` → `'implement-now'`
      - `nistStatus === 'final' && nodeJsSupport === 'unavailable'` → `'monitor'`
      - `nistStatus !== 'final'` → `'defer'`
    - Include `currentIPCCipherSuite: 'TLS_AES_256_GCM_SHA384'` (current enforced cipher per `[5_SECURITY_DESIGN-REQ-SEC-SD-028]`).
    - Include `migrationPathNotes: string[]` describing what would need to change in the IPC handshake.
  - Implement `writePQCEvaluationReport(report, outputPath): Promise<void>`.
- [ ] Add CLI subcommand `devs evaluate pqc` in `src/cli/commands/evaluate.ts`:
  - Calls `generatePQCEvaluationReport()` and `writePQCEvaluationReport()`.
  - Prints a markdown-formatted summary table to stdout.
- [ ] Commit an initial placeholder at `docs/evaluations/pqc-evaluation.json` with `"status": "pending"`.

## 3. Code Review
- [ ] Verify no PQC library is added as a production runtime dependency — only used in evaluation/devDependencies.
- [ ] Verify `assessNodeJsSupport` uses try/catch and never throws — always returns a valid enum value.
- [ ] Verify all enum values for `recommendation` and `nistStatus` are exhaustive (TypeScript `never` check).
- [ ] Verify the `migrationPathNotes` array is non-empty and contains actionable strings (e.g., "Replace ECDH in IPC handshake with ML-KEM-768 encapsulation").
- [ ] Verify TypeScript strict mode compliance; no `any`.
- [ ] Confirm `[TAS-063]` requirement mapping comment is present.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="pqc-evaluation"` — all tests pass.
- [ ] Run `npx ts-node src/cli/index.ts evaluate pqc` and confirm JSON output is written to `docs/evaluations/pqc-evaluation.json`.
- [ ] Validate output JSON: `node -e "const r=require('./docs/evaluations/pqc-evaluation.json'); console.assert(Array.isArray(r.algorithms))"`.
- [ ] Run `npm run typecheck` — zero errors.
- [ ] Run `npm run lint` — zero warnings/errors.

## 5. Update Documentation
- [ ] Create `docs/evaluations/pqc-evaluation.md` documenting: purpose, NIST FIPS 203/204/205 references, current recommendation, and re-run instructions (`devs evaluate pqc`).
- [ ] Create `src/crypto/pqc-algorithm-registry.agent.md` (AOD file per `[9_ROADMAP-REQ-041]`): algorithm list, support matrix, recommendation logic.
- [ ] Update `docs/security.md` with a "Post-Quantum Readiness" section referencing `docs/evaluations/pqc-evaluation.md` and `[5_SECURITY_DESIGN-REQ-SEC-QST-201]`.
- [ ] Add changelog entry: `feat: post-quantum cryptography algorithm evaluation and CLI command (REQ-SEC-QST-201)`.

## 6. Automated Verification
- [ ] Run `npm run validate-all` — exit code 0.
- [ ] Run `grep -r "REQ-SEC-QST-201" src/` — at least one match in `src/crypto/`.
- [ ] Run `node -e "const r=require('./docs/evaluations/pqc-evaluation.json'); console.assert(['implement-now','monitor','defer'].includes(r.algorithms[0].recommendation))"` — no assertion error.
- [ ] Run `npm run test:coverage -- --testPathPattern="pqc-evaluation"` — line coverage ≥ 90%.

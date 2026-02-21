# Task: Post-Quantum IPC Handshake Migration Design (Sub-Epic: 29_Post-Quantum and Future Security Evaluation)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-QST-201]

## 1. Initial Test Written
- [ ] In `src/crypto/__tests__/pqc-ipc-migration.test.ts`, write unit tests that:
  - Assert `PQCMigrationPlan` is a typed interface with fields: `targetAlgorithm: string`, `currentAlgorithm: string`, `migrationSteps: MigrationStep[]`, `breakingChanges: string[]`, `estimatedEffort: 'low' | 'medium' | 'high'`, `blockers: string[]`.
  - Assert `buildIPCMigrationPlan(from: string, to: string): PQCMigrationPlan` returns a valid plan when called with `('ECDH-P256', 'ML-KEM-768')`.
  - Assert `migrationSteps` contains a step with `action: 'replace-key-exchange'` and non-empty `description`.
  - Assert `breakingChanges` is non-empty (key exchange replacement is always a breaking change).
  - Assert `estimatedEffort` is `'high'` when `blockers` is non-empty.
  - Assert `estimatedEffort` is `'medium'` when `blockers` is empty but native Node.js support is `'unavailable'`.
  - Write a test that `blockers` includes a string mentioning "native Node.js support" when `assessNodeJsSupport(to)` returns `'unavailable'`.
  - Assert `serializeMigrationPlan(plan): string` returns valid JSON.
  - Write a test that `writeMigrationPlan(plan, path)` writes a file at the specified path containing the serialized plan.

## 2. Task Implementation
- [ ] Create `src/crypto/pqc-ipc-migration.ts`:
  - Define interfaces: `MigrationStep { action: string; description: string; requiredLibrary?: string }`, `PQCMigrationPlan`.
  - Implement `buildIPCMigrationPlan(from: string, to: string): PQCMigrationPlan`:
    - Hard-code the `ML-KEM-768` migration steps: (1) add `kyber-crystals` or equivalent WASM wrapper, (2) update IPC `ClientHello` to advertise PQC group, (3) replace ephemeral ECDH in `src/ipc/handshake.ts` with hybrid KEM (classical + PQC), (4) update TLS context options in `src/network/tls-config.ts`.
    - Populate `blockers` using `assessNodeJsSupport(to)` from the registry.
    - Set `estimatedEffort` per rules: blockers present → `'high'`; wasm only → `'medium'`; native → `'low'`.
  - Implement `serializeMigrationPlan(plan): string` — `JSON.stringify(plan, null, 2)`.
  - Implement `writeMigrationPlan(plan: PQCMigrationPlan, outputPath: string): Promise<void>` using `fs/promises.writeFile`.
  - Add `// REQ: 5_SECURITY_DESIGN-REQ-SEC-QST-201` comment at top of file.
- [ ] Create placeholder file `docs/evaluations/pqc-ipc-migration-plan.json` with `{ "status": "pending" }`.
- [ ] Extend `devs evaluate pqc` CLI command to also call `buildIPCMigrationPlan` and write `docs/evaluations/pqc-ipc-migration-plan.json`.

## 3. Code Review
- [ ] Verify `buildIPCMigrationPlan` is a pure function with no side effects (no file I/O, no network calls).
- [ ] Verify `MigrationStep.description` strings are human-readable and actionable (no cryptic abbreviations).
- [ ] Verify the hybrid KEM approach (classical + PQC) is explicitly captured in migration steps (defense in depth during transition).
- [ ] Verify TypeScript strict mode compliance; no `any`.
- [ ] Verify `[TAS-063]` requirement comment is present.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="pqc-ipc-migration"` — all tests pass.
- [ ] Run `npx ts-node src/cli/index.ts evaluate pqc` and confirm `docs/evaluations/pqc-ipc-migration-plan.json` is written.
- [ ] Validate: `node -e "const p=require('./docs/evaluations/pqc-ipc-migration-plan.json'); console.assert(Array.isArray(p.migrationSteps))"`.
- [ ] Run `npm run typecheck` — zero errors.
- [ ] Run `npm run lint` — zero warnings/errors.

## 5. Update Documentation
- [ ] Create `docs/evaluations/pqc-ipc-migration-plan.md` documenting: current IPC cipher, target algorithm, migration steps table, estimated effort, and blockers.
- [ ] Create `src/crypto/pqc-ipc-migration.agent.md` (AOD file) documenting: migration plan structure, how blockers are derived, and when to re-evaluate.
- [ ] Update `docs/security.md` "Post-Quantum Readiness" section to link to the IPC migration plan.
- [ ] Add changelog entry: `feat: PQC IPC handshake migration design document and plan generator (REQ-SEC-QST-201)`.

## 6. Automated Verification
- [ ] Run `npm run validate-all` — exit code 0.
- [ ] Run `grep -r "REQ-SEC-QST-201" src/crypto/pqc-ipc-migration.ts` — match found.
- [ ] Run `node -e "const p=require('./docs/evaluations/pqc-ipc-migration-plan.json'); console.assert(p.targetAlgorithm && p.currentAlgorithm)"` — no assertion error.
- [ ] Run `npm run test:coverage -- --testPathPattern="pqc-ipc-migration"` — line coverage ≥ 90%.

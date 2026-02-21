# Task: Document Formal Cryptographic & Smart Contract Auditing as Out-of-Scope and Enforce Standard Unit Testing Boundary (Sub-Epic: 04_Out-of-Scope Manifest - Quality & Compliance)

## Covered Requirements
- [1_PRD-REQ-OOS-018]

## 1. Initial Test Written
- [ ] In `src/oos/__tests__/oos-manifest.test.ts`, add a unit test asserting the `OOS_MANIFEST` array contains an entry with `id: "1_PRD-REQ-OOS-018"`.
- [ ] Assert the entry has:
  - `id`: `"1_PRD-REQ-OOS-018"`
  - `name`: a string matching `"Formal Cryptographic & Smart Contract Auditing"`
  - `description`: a string containing `"formal verification"` or `"unit testing"`
  - `rationale`: a non-empty string
  - `futureConsideration`: `false`
- [ ] Create a test file at `src/security/__tests__/crypto-audit-policy.test.ts`.
- [ ] Write a unit test asserting the crypto audit policy config (`src/security/crypto-audit-policy.ts`) has:
  - `allowFormalCryptographicVerification`: `false`
  - `allowSmartContractAudit`: `false`
  - `allowedCryptographyValidationTypes`: an array containing `"unit-test"` and/or `"dependency-audit"`, and NOT containing `"formal-verification"`, `"zkp-audit"`, `"smart-contract-audit"`, or `"theorem-prover"`
- [ ] Write an integration test: when the `TaskDAGBuilder` receives a task specification that includes a cryptographic audit step of a forbidden type, assert it throws `OosViolationError` with `oosId: "1_PRD-REQ-OOS-018"`.
- [ ] Write a test asserting the generated project scaffold does not include any smart contract files (e.g., `.sol`, `.vy` Solidity/Vyper), formal verification config files (e.g., Coq scripts, TLA+ specs), or blockchain deployment configs.
- [ ] Write a test asserting that if a user's project brief mentions `"smart contract"`, `"blockchain"`, `"Solidity"`, or `"formal proof"`, the input validator emits a `ValidationWarning` with `oosReferenceId: "1_PRD-REQ-OOS-018"` and does not scaffold those components.

## 2. Task Implementation
- [ ] Add the `1_PRD-REQ-OOS-018` entry to `src/oos/oos-manifest.ts`:
  ```typescript
  {
    id: "1_PRD-REQ-OOS-018",
    name: "Formal Cryptographic & Smart Contract Auditing",
    description: "Out of Scope: No formal verification beyond standard unit testing.",
    rationale: "Formal cryptographic verification (e.g., Coq proofs, TLA+ model checking, ZK-proof circuit audits) and smart contract security auditing (e.g., Slither, Certora, Mythril) require domain-specific expertise and toolchains outside the scope of a general-purpose greenfield code generator. Standard cryptographic usage (e.g., using established libraries like libsodium or Node.js built-in `crypto`) is within scope and should be covered by standard unit tests.",
    futureConsideration: false,
  }
  ```
- [ ] Create `src/security/crypto-audit-policy.ts` exporting:
  ```typescript
  export const CRYPTO_AUDIT_POLICY = {
    allowFormalCryptographicVerification: false,
    allowSmartContractAudit: false,
    allowedCryptographyValidationTypes: ["unit-test", "dependency-audit", "known-vulnerability-scan"],
    forbiddenProjectBriefKeywords: ["smart contract", "solidity", "blockchain audit", "formal proof", "zkp circuit", "theorem prover"],
  } as const;
  ```
- [ ] Update the orchestrator's input validator (`src/orchestrator/input-validator.ts`) to import `CRYPTO_AUDIT_POLICY` and scan the user's project brief for `forbiddenProjectBriefKeywords`. For each match, emit a `ValidationWarning` with `oosReferenceId: "1_PRD-REQ-OOS-018"` and exclude those components from scaffolding.
- [ ] Update the `TaskDAGBuilder` to import `CRYPTO_AUDIT_POLICY` and enforce that any task with a cryptography validation type not in `allowedCryptographyValidationTypes` throws `OosViolationError` (with `oosId: "1_PRD-REQ-OOS-018"`).
- [ ] Update the scaffolding file extension allowlist (e.g., `src/scaffolding/file-type-policy.ts`) to explicitly exclude `.sol`, `.vy`, and `.tla` file extensions, referencing `1_PRD-REQ-OOS-018`.

## 3. Code Review
- [ ] Verify `CRYPTO_AUDIT_POLICY` uses `as const` and is fully typed with a strict interface.
- [ ] Confirm the forbidden keyword scan in the input validator is case-insensitive.
- [ ] Ensure the scaffolding file extension exclusion is not a blocklist maintained inline — it must import from `file-type-policy.ts` or the equivalent config module.
- [ ] Verify `OosViolationError` carries both `oosId` and a user-readable `message` explaining that formal cryptographic auditing is post-handover work.
- [ ] Confirm no test mocks the keyword scanner or the file extension check — both must be tested against real data.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=crypto-audit-policy` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern=oos-manifest` and confirm the `1_PRD-REQ-OOS-018` entry assertion passes.
- [ ] Run `npm test` (full suite) and confirm zero regressions.

## 5. Update Documentation
- [ ] Add a section `## Formal Cryptographic & Smart Contract Auditing (1_PRD-REQ-OOS-018)` to `docs/oos/README.md` explaining the boundary: standard cryptographic library usage is in-scope; formal verification and smart contract audits are not.
- [ ] Update `docs/agent-memory/phase_15.agent.md` to record: "Formal cryptographic verification and smart contract auditing are out of scope per [1_PRD-REQ-OOS-018]. Standard crypto library usage is in-scope and covered by unit tests. The input validator and `TaskDAGBuilder` enforce this boundary."
- [ ] Add a comment referencing `1_PRD-REQ-OOS-018` above the `CRYPTO_AUDIT_POLICY` export in its source file.

## 6. Automated Verification
- [ ] Extend `scripts/verify-oos-manifest.js` to assert `1_PRD-REQ-OOS-018` is present and all fields are non-empty.
- [ ] Add CI step `verify:crypto-audit-policy` running `scripts/verify-crypto-audit-policy.js` which:
  1. Imports `CRYPTO_AUDIT_POLICY`.
  2. Asserts `allowFormalCryptographicVerification === false`.
  3. Asserts `allowSmartContractAudit === false`.
  4. Asserts `allowedCryptographyValidationTypes` does not contain `"formal-verification"` or `"smart-contract-audit"`.
  5. Asserts `forbiddenProjectBriefKeywords` includes `"smart contract"` and `"solidity"`.
  6. Exits with code `0` on success, `1` on failure.
- [ ] Confirm CI passes on a clean run.

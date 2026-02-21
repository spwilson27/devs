# Task: Setup AOD Auditor Infrastructure (Sub-Epic: 07_Documentation Auditing (AOD))

## Covered Requirements
- [1_PRD-REQ-OBS-002], [1_PRD-REQ-MET-007], [3_MCP-REQ-MET-007], [8_RISKS-REQ-061]

## 1. Initial Test Written
- [ ] Create a new unit test file `tests/unit/core/quality/AODAuditor.test.ts`.
- [ ] Write a test `should initialize AOD_Auditor with target directory and throw Error if directory is invalid`.
- [ ] Write a test `should define the interface for AuditResult returning density score and missing modules`.
- [ ] Ensure tests fail because the `AOD_Auditor` class and `AuditResult` interfaces do not exist yet.

## 2. Task Implementation
- [ ] Create `src/core/quality/AODAuditor.ts`.
- [ ] Define the `AuditResult` interface, containing `densityScore: number`, `missingAODs: string[]`, `invalidAODs: string[]`, and `passed: boolean`.
- [ ] Implement the `AOD_Auditor` class constructor accepting a `projectRoot` absolute path.
- [ ] Add basic path validation in the constructor using Node's `fs` and `path` modules to ensure `projectRoot` exists, throwing an error if it doesn't.

## 3. Code Review
- [ ] Verify that `AODAuditor.ts` strictly uses TypeScript types and avoids `any`.
- [ ] Ensure that dependency injection or configuration is handled cleanly without hardcoding paths.
- [ ] Confirm no extraneous business logic (like parsing) is included in this purely structural PR.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- AODAuditor.test.ts` to ensure the constructor tests pass.
- [ ] Confirm code coverage for `AODAuditor.ts` is 100%.

## 5. Update Documentation
- [ ] Create or update `src/core/quality/.agent.md` to document the Intent and Testability of the newly created `AODAuditor` class.
- [ ] Log this architectural foundation step in `.devs/state.sqlite` or project memory.

## 6. Automated Verification
- [ ] Execute `npm run test:verify -- AODAuditor.test.ts --json` and assert the `passRate` is 100%.
- [ ] Run `npx eslint src/core/quality/AODAuditor.ts` to ensure 0 warnings and errors.

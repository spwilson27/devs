# Task: Implement AOD Content and Hook Verification (Sub-Epic: 07_Documentation Auditing (AOD))

## Covered Requirements
- [1_PRD-REQ-OBS-002], [8_RISKS-REQ-061], [3_MCP-REQ-MET-007]

## 1. Initial Test Written
- [ ] In `tests/unit/core/quality/AODAuditor.test.ts`, add a test suite for `verifyContent()`.
- [ ] Write a test passing a valid `.agent.md` string that contains the required markdown headers (`## Intent`, `## Architecture`, `## Testability`, `## Edge Cases`, `## Agentic Hooks`).
- [ ] Write tests passing invalid `.agent.md` strings missing one or more of these mandatory headers, asserting that `verifyContent()` returns `passed: false` and lists the specific missing sections in `invalidAODs`.

## 2. Task Implementation
- [ ] In `AOD_Auditor.ts`, implement the `verifyContent()` method.
- [ ] Implement a markdown parsing mechanism (using regex or a library like `marked`) to scan the content of each discovered `.agent.md` file.
- [ ] Validate that every file explicitly includes the mandatory sections defined in the requirements: Intent, Architecture, Testability, Edge Cases, and Agentic Hooks.
- [ ] If a file is missing required sections, append its path and the missing sections to the `invalidAODs` array in the `AuditResult`.

## 3. Code Review
- [ ] Verify the parsing logic is resilient to variations in markdown formatting (e.g., extra spaces, alternate header depths like `# Intent` vs `## Intent`).
- [ ] Ensure that large files are read efficiently to prevent memory bloat (e.g., using streams or limits).
- [ ] Confirm the method strictly enforces the required sections as outlined in [1_PRD-REQ-OBS-002] and [3_MCP-REQ-MET-007].

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- AODAuditor.test.ts` to confirm content parsing accurately identifies valid and invalid AOD files.

## 5. Update Documentation
- [ ] Document the required schema for `.agent.md` files in the central TAS and update the `src/core/quality/.agent.md` edge cases.

## 6. Automated Verification
- [ ] Execute `npm run test:verify -- AODAuditor.test.ts --json` and ensure passing assertions.
- [ ] Verify using `node -e "require('./dist/src/core/quality/AODAuditor.js')"` that the compiled class can be instantiated without runtime errors.

# Task: Implement AOD Density Verification (Sub-Epic: 07_Documentation Auditing (AOD))

## Covered Requirements
- [1_PRD-REQ-MET-007], [3_MCP-REQ-MET-007]

## 1. Initial Test Written
- [ ] In `tests/unit/core/quality/AODAuditor.test.ts`, add a test suite for `verifyDensity()`.
- [ ] Mock a filesystem structure using a library like `memfs` or `mock-fs` containing 3 logic modules (`.ts` files) and only 2 `.agent.md` files.
- [ ] Write a test asserting that `verifyDensity()` correctly calculates a `densityScore` of 0.66 (2/3), lists the missing `.agent.md` file in `missingAODs`, and sets `passed` to `false`.
- [ ] Write a test asserting that a 1:1 ratio yields a `densityScore` of 1.0 and sets `passed` to `true`.

## 2. Task Implementation
- [ ] In `AOD_Auditor.ts`, implement the `verifyDensity()` method.
- [ ] Use `glob` or Node's `fs.promises.readdir` to recursively find all logic modules (e.g., `*.ts`, `*.js`, `*.py` depending on project language configuration) in the target source directories.
- [ ] Exclude test directories, `node_modules`, and `.devs` from the search.
- [ ] For every logic module found, check if a companion `.agent.md` file exists in the same directory (or a configured `.agent/` parallel directory).
- [ ] Compute the density ratio and populate the `missingAODs` array with the exact paths of the orphaned modules.

## 3. Code Review
- [ ] Ensure filesystem operations are asynchronous and do not block the event loop.
- [ ] Check that exclusion rules for tests and dependencies are robust.
- [ ] Verify that the density ratio calculation avoids division by zero if the project has no logic modules yet.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- AODAuditor.test.ts` to confirm both the mocked 1:1 and partial density scenarios pass.

## 5. Update Documentation
- [ ] Update `src/core/quality/.agent.md` to explain how `verifyDensity()` maps modules to AOD files and what exclusion rules apply.

## 6. Automated Verification
- [ ] Validate that the density script passes automated verification via `npm run test:verify -- AODAuditor.test.ts --json`.
- [ ] Run `npm run typecheck` to ensure no Type errors were introduced during globbing implementation.

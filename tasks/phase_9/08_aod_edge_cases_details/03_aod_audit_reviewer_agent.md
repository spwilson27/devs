# Task: Implement AOD Audit in ReviewerAgent (Sub-Epic: 08_AOD Edge Cases & Details)

## Covered Requirements
- [8_RISKS-REQ-098]

## 1. Initial Test Written
- [ ] Write unit tests for the ReviewerAgent's AOD audit functionality in `src/agents/ReviewerAgent.spec.ts`.
- [ ] Create a mock "Pull Request" or changeset where a source file is modified but its corresponding `.agent.md` file is missing or lacks updated "Agentic Hooks". The test MUST fail the review and reject the commit.
- [ ] Create a passing mock where the source file and the `.agent.md` are updated in sync, ensuring the testability, edge cases, and hooks reflect the new code. The test MUST pass the review.

## 2. Task Implementation
- [ ] Implement an `AOD_Auditor` module within `src/agents/ReviewerAgent/AOD_Auditor.ts`.
- [ ] The auditor must diff incoming changes, identify all modified production modules, and locate their corresponding 1:1 `.agent.md` files.
- [ ] Integrate a verification step utilizing a prompt or AST logic to check if the `.agent.md` documentation accurately reflects the "Agentic Hooks", testability instructions, and edge cases corresponding to the recent code changes.
- [ ] Hook this auditor into the main `ReviewerAgent` workflow, ensuring a `ReviewNode` rejection is triggered if the AOD is stale or missing.

## 3. Code Review
- [ ] Ensure the AOD audit logic accurately handles file renames, deletions, and new file creations.
- [ ] Verify the "Hostile Auditor" prompt effectively critiques the quality of the updated AOD, rather than just checking for file existence.
- [ ] Ensure the architecture remains modular and the `AOD_Auditor` does not tightly couple with unrelated review tasks like SAST scanning.

## 4. Run Automated Tests to Verify
- [ ] Execute `pnpm run test:unit src/agents/ReviewerAgent.spec.ts` and ensure all AOD audit test cases pass.
- [ ] Run the E2E verification suite to confirm the `ReviewerAgent` successfully rejects a real task with stale AOD.

## 5. Update Documentation
- [ ] Update the `ReviewerAgent` documentation in `docs/architecture/ReviewerAgent.md` to detail the AOD audit step.
- [ ] Add agent memory instructing the Implementation Agent that it must always update the corresponding `.agent.md` when modifying code to pass the Reviewer.

## 6. Automated Verification
- [ ] Execute an automated sandbox script `node scripts/simulate_reviewer.js --task=missing_aod` and ensure the script exits with a non-zero code and logs a specific `AOD_AUDIT_FAILURE` event.
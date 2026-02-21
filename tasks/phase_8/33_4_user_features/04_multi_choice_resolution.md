# Task: Implement Multi-Choice Resolution Proposals for Agent Conflicts (Sub-Epic: 33_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-067]

## 1. Initial Test Written
- [ ] Write tests in `src/tests/engine/resolution.test.ts` simulating a state of unresolvable conflict (e.g., TAS constraint contradicts implementation reality).
- [ ] Assert that the `ConflictDetector` generates a `ResolutionProposalEvent` strictly containing 2-3 distinct actionable strategies.

## 2. Task Implementation
- [ ] Update the `RootCauseAgent` or conflict manager (e.g., `src/engine/conflict_resolver.ts`) to intercept repeating unresolvable errors and generate multiple alternative paths.
- [ ] Structure the prompt output into a standardized `ResolutionProposal` object (e.g., Option A: Refactor code, Option B: Update TAS to relax constraints).
- [ ] Implement an interactive prompt in the CLI/UI (`src/cli/interactive.ts` or VSCode equivalent) to display these 2-3 options to the user, halting execution until selection.

## 3. Code Review
- [ ] Check that the agent's prompt forces distinct, actionable options rather than broad or open-ended questions.
- [ ] Ensure that the main execution loop suspends cleanly while awaiting the user's choice and resumes with the exact selected strategy applied to its context.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- src/tests/engine/resolution.test.ts` to verify the proposal generation and selection workflow.

## 5. Update Documentation
- [ ] Update `docs/architecture/conflict-resolution.md` explaining the multi-choice resolution feature.
- [ ] Note in the project architecture that agent suspension is acceptable when generating resolution proposals.

## 6. Automated Verification
- [ ] Run a headless automated script simulating a conflict, programmatically selecting "Option B", and asserting the engine immediately applies that chosen path and resumes execution.

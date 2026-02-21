# Task: Implement Multi-Choice Resolution Proposals for Agent Conflicts (Sub-Epic: 15_CLI and UI State Controls)

## Covered Requirements
- [4_USER_FEATURES-REQ-067]

## 1. Initial Test Written
- [ ] In `src/core/__tests__/resolutionProposals.test.ts`, write unit tests for `ResolutionProposalGenerator`:
  - Test that `ResolutionProposalGenerator.generate({ conflictType, context })` returns an array of 2–3 `ResolutionProposal` objects.
  - Test that each `ResolutionProposal` has: `id: string`, `label: string` (short title ≤ 60 chars), `description: string` (detailed explanation), `type: 'UPDATE_TAS' | 'REFACTOR_IMPLEMENTATION' | 'SKIP_TASK' | 'MANUAL_OVERRIDE'`.
  - Test for conflict type `'SPEC_IMPLEMENTATION_MISMATCH'`: proposals must include at least one `UPDATE_TAS` and one `REFACTOR_IMPLEMENTATION` option.
  - Test for conflict type `'REPEATED_FAILURE'`: proposals must include a `SKIP_TASK` option.
  - Test that proposals never include duplicate `type` values in the same response.
  - Test that `ResolutionProposalGenerator.generate()` throws `InsufficientContextError` if `context` is missing required fields (`taskId`, `failedStrategies`).
- [ ] In `src/core/__tests__/resolutionProposalIntegration.test.ts`, write integration tests:
  - Test that when a conflict is detected and `AICDialogManager.prompt()` is called, the `options` array passed to it is derived from `ResolutionProposalGenerator.generate()` labels.
  - Test that after user selects a proposal, the `OrchestrationLoop` receives the full `ResolutionProposal` object (not just the label) and routes execution accordingly (mock the routing logic).

## 2. Task Implementation
- [ ] Create `src/core/ResolutionProposalGenerator.ts`:
  - `generate(input: ProposalInput): ResolutionProposal[]`:
    1. Validate `input` has `taskId` and `failedStrategies`; throw `InsufficientContextError` otherwise.
    2. Use a rule-based decision table (plain `if/switch` logic, no LLM call) keyed on `conflictType` to select 2–3 `ResolutionProposal` templates.
    3. Populate template `description` fields with `input.context` data (e.g., task ID, last error, failed strategies list).
    4. Return the proposals array (2–3 items, no duplicates by `type`).
  - Define the proposal templates as a static constant `PROPOSAL_TEMPLATES` in the same file.
- [ ] Update `AICDialogManager.prompt()` to accept an optional `proposals?: ResolutionProposal[]` parameter. If provided, pass `proposals.map(p => p.label)` as the `options` array to the CLI/VSCode dialog renderers, and store the full proposal objects so the selected label can be mapped back to a `ResolutionProposal`.
- [ ] In `OrchestrationLoop`, after a conflict is detected:
  1. Call `ResolutionProposalGenerator.generate({ conflictType, context: { taskId, failedStrategies, lastError } })`.
  2. Pass proposals to `AICDialogManager.prompt()`.
  3. Map the user's response label back to the selected `ResolutionProposal`.
  4. Route: `UPDATE_TAS` → call `TASUpdater.applyProposal(proposal)`; `REFACTOR_IMPLEMENTATION` → re-queue task with blacklisted strategies; `SKIP_TASK` → `StateController.skip(taskId)`; `MANUAL_OVERRIDE` → pause and print instructions.
- [ ] Persist the selected proposal type to the `aic_interactions` table's `response` column.

## 3. Code Review
- [ ] Verify `PROPOSAL_TEMPLATES` is a pure data structure (no side effects) and is unit-testable in isolation.
- [ ] Confirm proposals are always in the range of 2–3; add an assertion (`invariant`) that throws if the generator produces fewer than 2.
- [ ] Verify the label→proposal mapping in `AICDialogManager` is done by `id` (not label string matching) to prevent bugs if labels contain similar text.
- [ ] Confirm `InsufficientContextError` is a custom named error class.
- [ ] Verify the `OrchestrationLoop` routing for each proposal type is covered by the integration tests.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="resolutionProposal"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="aicDialog"` to confirm the updated `AICDialogManager` still passes its tests.
- [ ] Run `npm test -- --testPathPattern="OrchestrationLoop"` to confirm routing integration is correct.

## 5. Update Documentation
- [ ] Create `src/core/ResolutionProposalGenerator.agent.md` (AOD) documenting `ProposalInput`, `ResolutionProposal` type, `PROPOSAL_TEMPLATES`, conflict type routing table, and `InsufficientContextError`.
- [ ] Update `docs/human-in-the-loop.md` with a section on Multi-Choice Resolution Proposals: the 4 proposal types, how they are generated, and how each type is acted upon by the orchestrator.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="ResolutionProposalGenerator"` and confirm ≥ 90% line coverage.
- [ ] Run E2E test `npm run test:e2e -- --grep "resolution proposals"` simulating a `SPEC_IMPLEMENTATION_MISMATCH` conflict, auto-selecting the `REFACTOR_IMPLEMENTATION` proposal, and asserting the task is re-queued with updated blacklisted strategies in the DB.

# Task: Implement Human Intervention Trigger — Auto-Log and Vectorize on User Fix (Sub-Epic: 12_Strategy_Blacklist_and_Lesson_Learned)

## Covered Requirements
- [4_USER_FEATURES-REQ-068], [8_RISKS-REQ-077]

## 1. Initial Test Written
- [ ] Create `packages/agents/src/__tests__/human-intervention-trigger.test.ts` with the following test cases:
  - When `InterventionHandler.handleManualFix(fix)` is called:
    1. `DirectiveHistoryService.logIntervention()` is called with `intervention_type: 'MANUAL_FIX'`, `task_id`, `description`, and `actor: 'USER'`.
    2. `DnaEncoder.encodeUserFix()` is called with a `UserFix` whose `directive_history_id` is the `id` returned by `logIntervention`.
    3. The method returns an object `{ entry: DirectiveHistoryEntry, vector_id: string }`.
  - When `InterventionHandler.handleFeedback(feedback)` is called:
    1. `DirectiveHistoryService.logIntervention()` is called with `intervention_type: 'FEEDBACK'`.
    2. `DnaEncoder.encodeUserFix()` is NOT called (feedback is logged but NOT vectorized at this stage).
  - When `DnaEncoder.encodeUserFix()` throws `DnaEncodingError`, `handleManualFix` catches it, logs at `ERROR` level, and still returns the `DirectiveHistoryEntry` (DNA encoding failure is non-fatal).
  - Mock `DirectiveHistoryService` and `DnaEncoder` via `jest.spyOn`; no real SQLite or LanceDB I/O.

## 2. Task Implementation
- [ ] Define input types in `packages/agents/src/types/intervention.ts`:
  ```ts
  export interface ManualFixInput {
    task_id: string;
    description: string;   // Plain-language summary of what the user changed
    code_diff: string;     // Unified diff of the manual fix
    actor?: string;        // Defaults to 'USER'
  }

  export interface FeedbackInput {
    task_id: string;
    description: string;
    actor?: string;
  }
  ```
- [ ] Create `packages/agents/src/InterventionHandler.ts`:
  - Constructor accepts `DirectiveHistoryService` and `DnaEncoder` (both injected).
  - `async handleManualFix(input: ManualFixInput): Promise<{ entry: DirectiveHistoryEntry; vector_id: string | null }>`:
    1. Calls `this.directiveHistoryService.logIntervention({ task_id, intervention_type: 'MANUAL_FIX', description, actor })`.
    2. Calls `await this.dnaEncoder.encodeUserFix({ directive_history_id: entry.id, task_id, description, code_diff })`.
    3. Returns `{ entry, vector_id }`.
    4. Catches `DnaEncodingError`, logs at `ERROR`, returns `{ entry, vector_id: null }`.
  - `handleFeedback(input: FeedbackInput): DirectiveHistoryEntry`:
    1. Calls `this.directiveHistoryService.logIntervention({ task_id, intervention_type: 'FEEDBACK', description, actor })`.
    2. Returns the entry (synchronous, no encoding).
- [ ] Export `InterventionHandler` from `packages/agents/src/index.ts`.
- [ ] Wire `InterventionHandler` into the CLI command `devs fix` (or the equivalent human-feedback entry point) so that when a user invokes the fix command, `handleManualFix` is called with the diff captured from the workspace.

## 3. Code Review
- [ ] Confirm that `handleManualFix` and `handleFeedback` share the `logIntervention` call path — no duplicate insertion logic.
- [ ] Confirm `DnaEncodingError` is the only error swallowed in `handleManualFix`; any other unexpected errors propagate.
- [ ] Confirm `InterventionHandler` does NOT import from the CLI layer — it should be CLI-agnostic and reusable from both CLI and VSCode extension contexts.
- [ ] Confirm `handleFeedback` is synchronous (no `async`/`await`) since it only writes to SQLite.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/agents test -- --testPathPattern="human-intervention-trigger"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/agents test` to confirm zero regressions.

## 5. Update Documentation
- [ ] Update `packages/agents/AGENT.md` with an `## InterventionHandler` section documenting: when it is invoked, what it writes to SQLite, when it calls `DnaEncoder`, and its error handling contract.
- [ ] Update the CLI `devs fix` command documentation to describe the fix capture and logging flow.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/agents test -- --coverage --testPathPattern="human-intervention-trigger"` and confirm exit code 0 with branch coverage ≥ 85% for `InterventionHandler.ts`.
- [ ] Run `pnpm tsc --noEmit --project packages/agents/tsconfig.json` and confirm zero TypeScript errors.

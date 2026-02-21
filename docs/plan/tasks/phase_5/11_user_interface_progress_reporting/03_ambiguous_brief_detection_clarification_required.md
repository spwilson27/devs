# Task: Ambiguous Brief Detection & CLARIFICATION_REQUIRED Status Emission (Sub-Epic: 11_User Interface & Progress Reporting)

## Covered Requirements
- [4_USER_FEATURES-REQ-026]

## 1. Initial Test Written
- [ ] In `packages/core/src/agents/__tests__/BriefValidator.test.ts`, write unit tests for the `BriefValidator` class:
  - Test: returns `{ status: 'CLARIFICATION_REQUIRED', reason: 'BRIEF_TOO_SHORT' }` when the input prompt is fewer than 100 characters.
  - Test: returns `{ status: 'CLARIFICATION_REQUIRED', reason: 'NO_CLEAR_OBJECTIVE' }` when the prompt is ≥ 100 characters but contains no identifiable objective (use a fixture string of filler text with no imperative or goal clause).
  - Test: returns `{ status: 'VALID' }` when the prompt is ≥ 100 characters and contains a discernible objective.
  - Test: trims whitespace before measuring character length (a 99-char string padded with spaces is still too short).
  - Test: the `reason` field is `undefined` when status is `VALID`.
- [ ] In `packages/core/src/agents/__tests__/ResearchManager.integration.test.ts`, write an integration test:
  - Test: when `ResearchManager.start(brief)` is called with a brief < 100 chars, it emits a `CLARIFICATION_REQUIRED` event on the core `EventEmitter` before starting any search queries.
  - Test: the emitted event payload includes `{ status: 'CLARIFICATION_REQUIRED', reason: 'BRIEF_TOO_SHORT', clarificationPrompt: string }` where `clarificationPrompt` is a non-empty string.
  - Test: no search queries are dispatched (mock `SearchTool.execute` is never called) when `CLARIFICATION_REQUIRED` is emitted.

## 2. Task Implementation
- [ ] Create `packages/core/src/agents/BriefValidator.ts`:
  - Export a `BriefValidationResult` type: `{ status: 'VALID' | 'CLARIFICATION_REQUIRED'; reason?: 'BRIEF_TOO_SHORT' | 'NO_CLEAR_OBJECTIVE'; clarificationPrompt?: string }`.
  - Implement `validate(brief: string): BriefValidationResult`:
    - Trim the brief and check `brief.length < 100` → return `BRIEF_TOO_SHORT`.
    - Apply a heuristic check for objective presence: verify the brief contains at least one of: an imperative verb pattern (build, create, make, develop, design), or a goal clause (e.g., "so that", "in order to", "which allows"). If absent → return `NO_CLEAR_OBJECTIVE`.
    - If both pass → return `{ status: 'VALID' }`.
  - Generate a `clarificationPrompt` string when returning `CLARIFICATION_REQUIRED` (e.g., "Your brief is too short. Please describe your project in at least 100 characters, including what it should do and for whom.").
- [ ] In `packages/core/src/agents/ResearchManager.ts`, at the start of the `start(brief: string)` method:
  - Instantiate `BriefValidator` and call `validate(brief)`.
  - If result is `CLARIFICATION_REQUIRED`, emit `CLARIFICATION_REQUIRED` on the core `EventEmitter` with the full result payload, then `return` immediately (do not proceed to search query dispatch).
- [ ] Export `BriefValidationResult` and `BriefValidator` from `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Verify `BriefValidator.validate()` is a pure function with no side effects or I/O.
- [ ] Verify the heuristic is case-insensitive (use `.toLowerCase()` before pattern matching).
- [ ] Confirm `ResearchManager` does not call any `SearchTool` methods before the `BriefValidator` check.
- [ ] Confirm the `CLARIFICATION_REQUIRED` event payload schema matches the `BriefValidationResult` type exactly.
- [ ] Verify `clarificationPrompt` is always a non-empty, user-readable string when `status === 'CLARIFICATION_REQUIRED'`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter core test` and confirm all new tests pass with zero failures.
- [ ] Run `pnpm --filter core build` to verify TypeScript compilation succeeds.
- [ ] Run `pnpm --filter core lint` to confirm no ESLint errors.

## 5. Update Documentation
- [ ] Document `BriefValidator` in `packages/core/docs/agents.md` with the validation rules, threshold (100 chars), and the two failure reasons.
- [ ] Document the `CLARIFICATION_REQUIRED` event payload in `docs/ipc-events.md` under a new section "Brief Validation Events".
- [ ] Update the agent memory file `docs/agent-memory/phase_5.md` to record: "`ResearchManager` validates brief length (< 100 chars → `BRIEF_TOO_SHORT`) and objective presence before dispatching any search queries."

## 6. Automated Verification
- [ ] Run `pnpm --filter core test --coverage` and assert coverage for `BriefValidator.ts` is 100% (it is pure logic with no branching complexity).
- [ ] Run `node scripts/verify_task.mjs --task 03_ambiguous_brief_detection` to confirm: (a) `BriefValidator` is exported from `packages/core/src/index.ts`, (b) `ResearchManager.ts` contains a call to `validate(brief)` before any `SearchTool` invocation (statically verifiable via AST or grep).

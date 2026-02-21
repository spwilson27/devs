# Task: Agent-Initiated Clarification (AIC) Protocol — Contradiction Detection (Sub-Epic: 11_User Interface & Progress Reporting)

## Covered Requirements
- [1_PRD-REQ-UI-013]
- [9_ROADMAP-REQ-UI-013]

## 1. Initial Test Written
- [ ] In `packages/core/src/agents/__tests__/AICEngine.test.ts`, write unit tests for the `AICEngine` class:
  - Test: `detectContradictions(context)` returns an empty array when the context contains no logical contradictions.
  - Test: `detectContradictions(context)` returns a `Contradiction[]` array with at least one entry when the context contains two mutually exclusive constraints (e.g., "must be real-time" AND "must work offline only").
  - Test: each `Contradiction` object has shape `{ id: string, description: string, affectedRequirements: string[], clarificationQuestion: string }`.
  - Test: `emitAIC(contradictions)` emits a `AIC_REQUESTED` event on the core `EventEmitter` with payload `{ contradictions: Contradiction[] }`.
  - Test: calling `emitAIC([])` (empty array) does NOT emit any event.
- [ ] In `packages/core/src/agents/__tests__/ResearchManager.aic.integration.test.ts`, write an integration test:
  - Test: when `ResearchManager` finishes a research stream and the resulting data contains a pre-seeded contradiction fixture, it calls `AICEngine.detectContradictions()` and emits `AIC_REQUESTED` before proceeding to report generation.
  - Test: when no contradictions are detected, research proceeds to report generation without emitting `AIC_REQUESTED`.

## 2. Task Implementation
- [ ] Create `packages/core/src/agents/AICEngine.ts`:
  - Export types:
    ```ts
    type Contradiction = {
      id: string;
      description: string;
      affectedRequirements: string[];
      clarificationQuestion: string;
    };
    ```
  - Implement `detectContradictions(context: ResearchContext): Contradiction[]`:
    - Accept the aggregated `ResearchContext` object (which includes all scraped content, extracted requirements, and user brief).
    - Apply a set of contradiction detection rules. Initial rule set must include:
      1. Offline-vs-realtime: flag if both "offline" and "real-time sync" constraints are present.
      2. Scale contradiction: flag if both "single-user" and "100,000 concurrent users" are present.
      3. License contradiction: flag if both "open-source" and "proprietary only" are present.
    - Each rule produces a `Contradiction` object with a unique `id` (e.g., `AIC-001`), human-readable `description`, `affectedRequirements` (list of extracted requirement strings), and a `clarificationQuestion` (a direct question for the user).
  - Implement `emitAIC(contradictions: Contradiction[]): void`:
    - If `contradictions.length === 0`, return without emitting.
    - Emit `AIC_REQUESTED` on the shared core `EventEmitter` with payload `{ contradictions }`.
- [ ] In `packages/core/src/agents/ResearchManager.ts`, after all research streams complete and before invoking the report generator:
  - Call `AICEngine.detectContradictions(researchContext)`.
  - Call `AICEngine.emitAIC(contradictions)`.
  - If `contradictions.length > 0`, suspend report generation and await a `AIC_RESOLVED` event (with a configurable timeout; default 10 minutes) before proceeding.
- [ ] Export `AICEngine`, `Contradiction` from `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Verify `detectContradictions` is a pure function — no I/O, no event emission, no mutation of the input context.
- [ ] Verify the suspension logic in `ResearchManager` uses a promise-based await on `AIC_RESOLVED` event, not a polling loop.
- [ ] Confirm the timeout on `AIC_RESOLVED` is configurable via the project config (not hardcoded beyond a default).
- [ ] Verify `Contradiction.id` values are deterministic and unique within a single `detectContradictions` call (not random UUIDs).
- [ ] Confirm `AIC_REQUESTED` event payload type is exported and documented.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter core test` and confirm all new tests pass with zero failures.
- [ ] Run `pnpm --filter core build` to verify TypeScript compilation succeeds.
- [ ] Run `pnpm --filter core lint` to confirm no ESLint errors.

## 5. Update Documentation
- [ ] Document `AICEngine` in `packages/core/docs/agents.md` with the initial rule set, `Contradiction` type schema, and the suspension/resume flow in `ResearchManager`.
- [ ] Document the `AIC_REQUESTED` and `AIC_RESOLVED` event payloads in `docs/ipc-events.md` under a new section "Agent-Initiated Clarification Events".
- [ ] Update the agent memory file `docs/agent-memory/phase_5.md` to record: "`AICEngine` runs post-research and pre-report; detects contradictions; suspends pipeline via `AIC_REQUESTED` / `AIC_RESOLVED` event pair."

## 6. Automated Verification
- [ ] Run `pnpm --filter core test --coverage` and assert coverage for `AICEngine.ts` is ≥ 95%.
- [ ] Run `node scripts/verify_task.mjs --task 04_aic_protocol` to confirm: (a) `AIC_REQUESTED` is emitted in `ResearchManager` after research streams complete (grep/AST check), (b) `AICEngine` is exported from the core index, (c) at least 3 contradiction detection rules are present in the source.

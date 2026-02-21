# Task: Implement Semantic Drift Prevention — Raw Terminal Observation Retention (Sub-Epic: 17_Context_Drift_and_Semantic_Integrity)

## Covered Requirements
- [3_MCP-RISK-501]

## 1. Initial Test Written

- [ ] Create test file at `packages/memory/src/__tests__/semantic-drift-prevention.test.ts`.
- [ ] Write a unit test `ContextPruner retains the last 5 terminal observations in raw form`:
  - Build a context window with:
    - 15 `tool_result` entries with sequential timestamps (simulating terminal observations).
    - TAS, requirements, and reasoning entries.
  - Trigger pruning with a tight token budget that would normally remove all tool results.
  - Assert that exactly the **5 most recent** `tool_result` entries are retained.
  - Assert their `content` is unchanged (not summarized).
- [ ] Write a unit test `ContextPruner retains fewer than 5 terminal observations when fewer exist`:
  - Build a context window with only 3 `tool_result` entries.
  - Trigger pruning.
  - Assert all 3 are retained.
- [ ] Write a unit test `ContextPruner does not retain more than 5 terminal observations under any budget`:
  - Set a very large token budget.
  - Assert only the most recent 5 `tool_result` entries are "guaranteed retained" regardless of budget — the rest are treated as normal prunable entries.
  - (Note: with large budget, older ones may also be retained, but the 5 newest must always be present.)
- [ ] Write a unit test `getTerminalObservationWindow returns exactly the last N entries`:
  - Directly call `TerminalObservationWindow.getLast(entries, 5)`.
  - Assert correct slicing by timestamp for various input sizes (0, 3, 5, 10).
- [ ] Write an integration test `TieredMemoryManager preserves raw terminal observations after pruning`:
  - Push 20 tool_result turns into `TieredMemoryManager`.
  - Force a prune.
  - Assert that the short-term buffer contains exactly the 5 most recent tool_result entries in their original raw form.
  - Assert that the older tool_result entries are present in the medium-term SQLite store.

## 2. Task Implementation

- [ ] In `packages/memory/src/context-pruner.ts`, introduce `TERMINAL_OBSERVATION_WINDOW = 5` as a named constant (configurable via env `DEVS_TERMINAL_WINDOW_SIZE`, defaulting to `5`).
- [ ] Create `packages/memory/src/terminal-observation-window.ts`:
  ```typescript
  export class TerminalObservationWindow {
    static getLast(entries: ContextEntry[], n: number): ContextEntry[] {
      return entries
        .filter(e => e.type === 'tool_result')
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, n);
    }
  }
  ```
- [ ] Update `ContextPruner.prune()` to enforce this retention:
  - Before computing prunable entries, call `TerminalObservationWindow.getLast(entries, TERMINAL_OBSERVATION_WINDOW)` to get the `anchoredObservations` set (by `entry.id`).
  - Add `anchoredObservations` to the **Pinned** bucket alongside TAS/requirements.
  - Log a `DEBUG` message listing the IDs of the anchored observations.
- [ ] Ensure that when `tool_result` entries are flushed to medium-term SQLite during pruning (as implemented in Task 01), only the non-anchored tool_result entries are flushed.
- [ ] Add `DEVS_TERMINAL_WINDOW_SIZE` to the project's environment variable schema in `packages/core/src/config/env-schema.ts` (or equivalent config file), with a default of `5` and a minimum of `1`.

## 3. Code Review

- [ ] Verify `TERMINAL_OBSERVATION_WINDOW` is defined as a constant, not a magic number inlined in logic.
- [ ] Confirm that `TerminalObservationWindow.getLast()` is a pure function with no side effects.
- [ ] Ensure the anchoring of the last N observations happens **before** the token budget calculation so that their token cost is correctly counted against the pinned budget.
- [ ] Verify that if the last 5 tool_result entries combined with pinned entries exceed the token budget, a critical warning is logged (not a silent failure or throw).
- [ ] Confirm the `tool_result` entries in the anchored window are never mutated or summarized.
- [ ] Ensure `DEVS_TERMINAL_WINDOW_SIZE` env var is validated at startup (must be integer ≥ 1), with a descriptive error if invalid.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm test --filter @devs/memory -- --testPathPattern=semantic-drift-prevention` and confirm all tests pass.
- [ ] Run `pnpm test --filter @devs/memory -- --testPathPattern=context-drift-guard` and confirm the existing Task 01 tests still pass (no regression).
- [ ] Run the full `@devs/memory` test suite: `pnpm test --filter @devs/memory` and confirm no regressions.
- [ ] Check test coverage: `pnpm test --filter @devs/memory -- --coverage` and confirm `terminal-observation-window.ts` has 100% line coverage.

## 5. Update Documentation

- [ ] Update `packages/memory/README.md`:
  - Add a `## Semantic Drift Prevention` section explaining the last-N terminal observation anchoring.
  - Document the `DEVS_TERMINAL_WINDOW_SIZE` environment variable.
  - Explain why raw (unsummarized) form is required for these entries.
- [ ] Add TSDoc comments to `TerminalObservationWindow.getLast()` describing the timestamp-based sorting and the N parameter.
- [ ] Update agent memory file `.devs/memory/architectural_decisions.md` with an entry:
  ```
  Decision: The last 5 terminal (tool_result) observations are ALWAYS retained in raw, unsummarized form in the active context window. This prevents semantic drift caused by lossy summarization of recent tool outputs. Requirement: [3_MCP-RISK-501]. Configurable via DEVS_TERMINAL_WINDOW_SIZE.
  ```

## 6. Automated Verification

- [ ] Run `pnpm test --filter @devs/memory -- --testPathPattern=semantic-drift-prevention --reporter=json > /tmp/semantic-drift-results.json` and assert exit code is `0`.
- [ ] Verify the JSON output contains `"numFailedTests": 0` using: `node -e "const r=require('/tmp/semantic-drift-results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `pnpm build --filter @devs/memory` and assert exit code is `0`.
- [ ] Confirm that the env variable schema change is validated by running `pnpm test --filter @devs/core -- --testPathPattern=env-schema` (or equivalent config validation tests).

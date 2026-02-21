# Task: Implement Summarization Handoff Pipeline to Medium-Term Memory (Sub-Epic: 11_Memory_Refresher_and_Summarization)

## Covered Requirements
- [1_PRD-REQ-PERF-004], [2_TAS-REQ-029]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/handoff/__tests__/SummarizationHandoff.test.ts`.
- [ ] Write a unit test for `SummarizationHandoff.transfer(agentId: string, turnWindow: TurnEntry[])`:
  - Mock the Gemini Flash LLM client to return a deterministic summary.
  - Assert that the method persists the summary to the SQLite `medium_term_memory` table with fields `{ agent_id, summary_text, turn_range_start, turn_range_end, created_at }`.
  - Assert that the raw `TurnEntry` records whose turn indices fall within `turn_range_start` to `turn_range_end` are marked `archived = true` in the SQLite `turn_log` table.
- [ ] Write a unit test asserting that if `turnWindow` is empty, `transfer()` is a no-op and returns without calling the LLM.
- [ ] Write a unit test for `SummarizationHandoff.retrieveRecentSummaries(agentId: string, limit: number)`: assert it returns the most recent `limit` summaries from `medium_term_memory` ordered by `created_at DESC`.
- [ ] Write an integration test using a real in-process SQLite DB that runs `transfer()` and then calls `retrieveRecentSummaries()`, asserting that the returned summary matches the mock LLM output and the source turns are marked archived.

## 2. Task Implementation

- [ ] Create `packages/memory/src/handoff/types.ts` with:
  ```ts
  export interface TurnEntry {
    turnIndex: number;
    agentId: string;
    role: 'user' | 'assistant' | 'tool';
    content: string;
    createdAt: Date;
  }

  export interface MediumTermSummary {
    agentId: string;
    summaryText: string;
    turnRangeStart: number;
    turnRangeEnd: number;
    createdAt: Date;
  }
  ```
- [ ] Create SQLite migration `packages/memory/migrations/0003_medium_term_memory.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS medium_term_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    summary_text TEXT NOT NULL,
    turn_range_start INTEGER NOT NULL,
    turn_range_end INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  ALTER TABLE turn_log ADD COLUMN archived INTEGER NOT NULL DEFAULT 0;
  ```
- [ ] Create `packages/memory/src/handoff/SummarizationHandoff.ts`:
  - Constructor accepts `{ llmClient: LLMClient, sqliteLogStore: SQLiteLogStore }`.
  - `transfer(agentId: string, turnWindow: TurnEntry[]): Promise<MediumTermSummary | null>`:
    1. Return `null` immediately if `turnWindow` is empty.
    2. Compose a prompt from the turn window entries (role-prefixed, truncated to 1500 chars each).
    3. Call `llmClient.generate(prompt)` with Gemini Flash to produce `summaryText`.
    4. Persist a row to `medium_term_memory` with `agent_id`, `summary_text`, `turn_range_start = turnWindow[0].turnIndex`, `turn_range_end = turnWindow[turnWindow.length-1].turnIndex`, `created_at`.
    5. Bulk-update `turn_log` rows where `turn_index BETWEEN turn_range_start AND turn_range_end AND agent_id = agentId` to `archived = 1`.
    6. Return the persisted `MediumTermSummary`.
  - `retrieveRecentSummaries(agentId: string, limit: number): Promise<MediumTermSummary[]>`:
    1. Query `medium_term_memory WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?`.
    2. Return mapped `MediumTermSummary[]`.
- [ ] Export `SummarizationHandoff` from `packages/memory/src/index.ts`.
- [ ] Run the migration against the dev SQLite DB as part of `pnpm --filter @devs/memory db:migrate`.

## 3. Code Review

- [ ] Verify that `transfer()` wraps the SQLite writes in a transaction — if the summary persistence succeeds but archival fails, the transaction must roll back to prevent orphaned summaries.
- [ ] Verify that the prompt does NOT include tool call results (role `tool`) in the summary input — only `user` and `assistant` turns are included to prevent leaking internal tool output into long-lived memory.
- [ ] Verify that `summaryText` is never stored if the LLM response is an empty string or whitespace-only — the method must throw `SummarizationError` in this case.
- [ ] Verify that `retrieveRecentSummaries` does not leak archived turn content — it only returns the summary rows, not raw turns.
- [ ] Confirm no N+1 SQL queries: archival must use a bulk `UPDATE ... WHERE turn_index BETWEEN ? AND ?` not a per-row update loop.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test` and confirm all new `SummarizationHandoff` unit tests pass.
- [ ] Run `pnpm --filter @devs/memory test:integration` and confirm the integration test passes.
- [ ] Run `pnpm --filter @devs/memory build` and confirm TypeScript compiles without errors.
- [ ] Run `pnpm --filter @devs/memory lint` to confirm no linting violations.

## 5. Update Documentation

- [ ] Add a `## SummarizationHandoff` section to `packages/memory/README.md` describing the handoff pipeline, the role of Gemini Flash, and the SQLite schema.
- [ ] Update `docs/agent-memory/tiered-memory.md` to document that `SummarizationHandoff` is the canonical mechanism for compressing in-context short-term turn logs into medium-term SQLite summaries, per `[1_PRD-REQ-PERF-004]`.
- [ ] Note in `docs/agent-memory/tiered-memory.md` that archived turn logs remain queryable via `get_task_trace` but are excluded from the active context window.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json --outputFile=test-results/summarization-handoff.json` and verify zero `failed` entries.
- [ ] Run `pnpm tsc --noEmit -p packages/memory/tsconfig.json` and confirm exit code 0.
- [ ] Query the test SQLite DB after the integration test and confirm `SELECT COUNT(*) FROM medium_term_memory` returns > 0 and `SELECT COUNT(*) FROM turn_log WHERE archived = 1` returns > 0.

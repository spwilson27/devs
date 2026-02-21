# Task: Implement MemoryRefresher Core Module (Sub-Epic: 11_Memory_Refresher_and_Summarization)

## Covered Requirements
- [2_TAS-REQ-029], [1_PRD-REQ-PERF-004]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/refresher/__tests__/MemoryRefresher.test.ts`.
- [ ] Write a unit test that instantiates `MemoryRefresher` with a mock `LanceDBStore` and a mock `SQLiteLogStore`, and asserts that the constructor exposes `refresh()`, `summarizeEpic()`, and `getLastRefreshTimestamp()` methods.
- [ ] Write a unit test for `summarizeEpic(epicId: string)`: mock the Gemini Flash LLM client, stub it to return a deterministic summary string, and assert that the returned `EpicSummary` object contains `{ epicId, summaryText, createdAt, embeddingVector }`.
- [ ] Write a unit test for `refresh()`: assert that when called, it fetches all unsummarized epic progress entries from `SQLiteLogStore`, calls `summarizeEpic` for each, and upserts each resulting `EpicSummary` into `LanceDBStore`.
- [ ] Write a unit test for `getLastRefreshTimestamp()`: assert it reads the `last_memory_refresh` key from the SQLite metadata table and returns a `Date` (or `null` if not set).
- [ ] Write an integration test (in `packages/memory/src/__tests__/integration/MemoryRefresher.integration.test.ts`) using a real in-memory LanceDB table and a real in-process SQLite DB. Assert that after `refresh()`, the LanceDB table contains at least one row with a non-null `vector` field, and that the SQLite `memory_metadata` table is updated with `last_memory_refresh`.
- [ ] Ensure all tests are written with Vitest and follow existing test conventions in `packages/memory`.

## 2. Task Implementation

- [ ] Create `packages/memory/src/refresher/types.ts` defining the following TypeScript interfaces:
  ```ts
  export interface EpicSummary {
    epicId: string;
    summaryText: string;
    createdAt: Date;
    embeddingVector: number[];
  }

  export interface MemoryRefresherConfig {
    llmClient: LLMClient;       // Gemini Flash abstraction
    lanceDBStore: LanceDBStore;
    sqliteLogStore: SQLiteLogStore;
    embeddingClient: EmbeddingClient; // text-embedding-004 abstraction
  }
  ```
- [ ] Create `packages/memory/src/refresher/MemoryRefresher.ts`:
  - Constructor accepts `MemoryRefresherConfig`.
  - `summarizeEpic(epicId: string): Promise<EpicSummary>`:
    1. Query `sqliteLogStore` for all log entries where `epic_id = epicId` and `summarized = false`, ordered by `created_at ASC`.
    2. Concatenate log entries into a structured prompt.
    3. Call `llmClient.generate(prompt)` using Gemini Flash model (`gemini-3-flash-latest`) to produce a `summaryText`.
    4. Call `embeddingClient.embed(summaryText)` using `text-embedding-004` to produce `embeddingVector`.
    5. Return an `EpicSummary` object.
  - `refresh(): Promise<void>`:
    1. Query `sqliteLogStore` for all distinct `epic_id` values where at least one unsummarized log entry exists.
    2. For each `epicId`, call `summarizeEpic(epicId)`.
    3. Upsert each `EpicSummary` into `lanceDBStore` (table: `epic_summaries`, key: `epicId`).
    4. Mark the processed log entries in SQLite as `summarized = true`.
    5. Update `memory_metadata` table with `key = 'last_memory_refresh'`, `value = new Date().toISOString()`.
  - `getLastRefreshTimestamp(): Promise<Date | null>`:
    1. Query SQLite `memory_metadata` for `key = 'last_memory_refresh'`.
    2. Return parsed `Date` or `null`.
- [ ] Export `MemoryRefresher` from `packages/memory/src/index.ts`.
- [ ] Add `MemoryRefresherConfig`, `EpicSummary` to the package's public type exports.

## 3. Code Review

- [ ] Verify that `MemoryRefresher` is stateless between calls (no mutable class-level cache that could cause cross-call contamination).
- [ ] Verify that the LLM prompt sent to Gemini Flash is constructed with clear section headers (`## Epic Logs`, `## Instructions`) to minimize hallucination risk.
- [ ] Verify that `summarizeEpic` does not directly reference raw user content without sanitization — all log entries must be trimmed and truncated to 2000 characters each before inclusion in the prompt.
- [ ] Verify that errors from `llmClient.generate()` or `embeddingClient.embed()` cause `summarizeEpic` to throw a typed `MemoryRefreshError` (not a raw `Error`), which `refresh()` catches and logs without aborting the entire batch.
- [ ] Verify that the `refresh()` method is idempotent: running it twice should not create duplicate LanceDB rows (upsert must be by `epicId`).
- [ ] Check that all async methods are properly awaited and no floating promises exist.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test` and confirm all new unit tests pass.
- [ ] Run `pnpm --filter @devs/memory test:integration` and confirm the integration test passes.
- [ ] Run `pnpm --filter @devs/memory build` and confirm TypeScript compiles without errors.
- [ ] Run `pnpm --filter @devs/memory lint` and confirm no linting errors.

## 5. Update Documentation

- [ ] Add a `## MemoryRefresher` section to `packages/memory/README.md` describing the class purpose, configuration options, and the two primary methods (`refresh()`, `summarizeEpic()`).
- [ ] Update the agent memory document at `docs/agent-memory/tiered-memory.md` to note that `MemoryRefresher` is the canonical mechanism for promoting Epic progress logs into long-term LanceDB storage.
- [ ] Add an entry to `docs/architecture-decisions/adr-memory-refresher.md` recording the decision to use Gemini Flash for summarization (rationale: lower cost, sufficient quality for log compression).

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json --outputFile=test-results/memory-refresher.json` and verify the JSON output contains zero `failed` entries for the `MemoryRefresher` test suite.
- [ ] Run `pnpm tsc --noEmit -p packages/memory/tsconfig.json` and assert exit code 0.
- [ ] Confirm `packages/memory/src/refresher/MemoryRefresher.ts` is present and non-empty using `ls -la packages/memory/src/refresher/`.

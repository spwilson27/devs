# Task: Implement Deterministic Tool Output Pruning and State Persistence (Sub-Epic: 07_Sliding_Relevance_Window)

## Covered Requirements
- [8_RISKS-REQ-012]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/tool-output-pruner/__tests__/tool-output-pruner.test.ts`.
- [ ] Write a test: `ToolOutputPruner.shouldTruncate(entry: ToolOutputEntry): boolean` returns `false` for an entry with `turnAge: 1` (first turn it appears).
- [ ] Write a test: `shouldTruncate` returns `true` for an entry with `turnAge >= 2` and `byteSize > LARGE_OUTPUT_THRESHOLD_BYTES` (set threshold to `51_200` — 50 KB).
- [ ] Write a test: `shouldTruncate` returns `false` for an entry with `turnAge >= 2` but `byteSize <= LARGE_OUTPUT_THRESHOLD_BYTES` (small outputs are not truncated even when stale).
- [ ] Write a test: `ToolOutputPruner.truncate(entry: ToolOutputEntry): TruncatedToolOutput` returns an object with `summary` (non-empty string), `rawStoredAt` (ISO timestamp string), and `originalByteSize: number`.
- [ ] Write a test with a mock `StateRepository`: `ToolOutputPruner.persistRaw(entry: ToolOutputEntry, db: StateRepository): Promise<void>` calls `db.insertRawToolOutput(entry)` exactly once and does NOT throw on success.
- [ ] Write a test: if `db.insertRawToolOutput` rejects, `persistRaw` propagates a `ToolOutputPersistenceError`.
- [ ] Write a test: `truncate()` produces a `summary` that includes the first 500 characters of the raw content, the total byte size, and the phrase `"[truncated — full output in state.sqlite]"`.

## 2. Task Implementation

- [ ] Create `packages/memory/src/tool-output-pruner/types.ts`. Export:
  - `LARGE_OUTPUT_THRESHOLD_BYTES = 51_200` (50 KB)
  - `ToolOutputEntry = { toolName: string; rawContent: string; byteSize: number; turnAge: number; capturedAt: number }`
  - `TruncatedToolOutput = { toolName: string; summary: string; rawStoredAt: string; originalByteSize: number }`
  - `ToolOutputPersistenceError` (extends `Error`) with `cause` field.
- [ ] Create `packages/memory/src/tool-output-pruner/tool-output-pruner.ts`. Implement `class ToolOutputPruner`:
  - `shouldTruncate(entry: ToolOutputEntry): boolean` — returns `entry.turnAge >= 2 && entry.byteSize > LARGE_OUTPUT_THRESHOLD_BYTES`.
  - `truncate(entry: ToolOutputEntry): TruncatedToolOutput`:
    1. Construct `summary` as: first 500 chars of `entry.rawContent`, then `\n\n[... ${entry.byteSize} bytes total — full output in state.sqlite]`.
    2. Return `TruncatedToolOutput` with `rawStoredAt = new Date().toISOString()`.
  - `async persistRaw(entry: ToolOutputEntry, db: StateRepository): Promise<void>`:
    1. Calls `await db.insertRawToolOutput(entry)`.
    2. On rejection, wraps in `ToolOutputPersistenceError` with original error as `cause`.
- [ ] Define interface `StateRepository` (in `packages/memory/src/tool-output-pruner/state-repository.ts`) with method `insertRawToolOutput(entry: ToolOutputEntry): Promise<void>`. This is the adapter contract for `state.sqlite`.
- [ ] Add barrel export in `packages/memory/src/tool-output-pruner/index.ts`.

## 3. Code Review

- [ ] Verify that `LARGE_OUTPUT_THRESHOLD_BYTES` is a named constant (not a magic number) used in both production code and tests.
- [ ] Confirm `truncate()` always preserves the first 500 characters of the raw content — verify this is part of the human-readable summary and not stripped.
- [ ] Verify `persistRaw` is always called BEFORE `truncate` in any orchestration flow (document this ordering constraint in the JSDoc of both methods).
- [ ] Confirm `StateRepository` is an interface/abstract type so it can be mocked in tests without requiring a live SQLite connection.
- [ ] Verify the `rawStoredAt` timestamp format is ISO 8601 (used for querying `state.sqlite` by time range).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="tool-output-pruner"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/memory/src/tool-output-pruner/tool-output-pruner.agent.md` describing: the 50 KB threshold, the 2-turn aging policy, the truncation format (first 500 chars + size annotation), the contract that raw content MUST be persisted to `state.sqlite` before truncation, and how to query the raw output later using `SELECT raw_content FROM tool_outputs WHERE tool_name = ? ORDER BY captured_at DESC LIMIT 1`.
- [ ] Update `packages/memory/README.md` to include the `tool-output-pruner` sub-module.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test -- --coverage --testPathPattern="tool-output-pruner"` and confirm branch coverage ≥ 90% for `tool-output-pruner.ts`.
- [ ] Run `pnpm tsc --noEmit -p packages/memory/tsconfig.json` and confirm exit code `0`.

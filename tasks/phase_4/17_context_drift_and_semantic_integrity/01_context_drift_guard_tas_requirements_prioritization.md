# Task: Implement Context Drift Guard — TAS & Requirements Prioritization in Pruning Window (Sub-Epic: 17_Context_Drift_and_Semantic_Integrity)

## Covered Requirements
- [3_MCP-RISK-303]

## 1. Initial Test Written

- [ ] Create test file at `packages/memory/src/__tests__/context-drift-guard.test.ts`.
- [ ] Write a unit test `ContextPruner preserves TAS content when token budget is exceeded`:
  - Construct a mock context window containing:
    - A TAS section (tagged `type: 'tas'`)
    - A Requirements section (tagged `type: 'requirements'`)
    - Several intermediate reasoning turns (tagged `type: 'reasoning'`)
    - Several tool-call/result pairs (tagged `type: 'tool_result'`)
  - Simulate a token count that exceeds the 800k-token threshold.
  - Call `ContextPruner.prune(contextWindow, tokenBudget)`.
  - Assert that ALL entries with `type: 'tas'` and `type: 'requirements'` are retained in the pruned output.
  - Assert that the total token count of the pruned output is at or below `tokenBudget`.
  - Assert that pruned entries are only of type `'reasoning'` or `'tool_result'`.
- [ ] Write a unit test `ContextPruner prunes oldest reasoning turns first`:
  - Fill the context with 20 reasoning turns and TAS + requirements entries.
  - Trigger pruning.
  - Assert that the oldest reasoning turns (by `timestamp`) are removed first.
- [ ] Write a unit test `ContextPruner never prunes TAS even at extreme token pressure`:
  - Set `tokenBudget` to just above the combined token count of TAS + requirements entries.
  - Assert that TAS and requirements are still intact after pruning, with all other entries removed.
- [ ] Write an integration test `ContextPruner integrates with TieredMemoryManager`:
  - Instantiate a `TieredMemoryManager` with a mock SQLite medium-term store.
  - Push enough turns to trigger pruning.
  - Assert that the short-term in-context buffer retains TAS/requirements entries.
  - Assert that pruned reasoning turns are written to the medium-term SQLite store via `MemoryRefresher`.

## 2. Task Implementation

- [ ] In `packages/memory/src/context-pruner.ts`, define the `ContextEntry` interface:
  ```typescript
  export interface ContextEntry {
    id: string;
    type: 'tas' | 'requirements' | 'reasoning' | 'tool_result' | 'spec' | 'summary';
    content: string;
    tokenCount: number;
    timestamp: number; // Unix ms
    metadata?: Record<string, unknown>;
  }
  ```
- [ ] Implement `ContextPruner` class with method:
  ```typescript
  prune(entries: ContextEntry[], tokenBudget: number): ContextEntry[]
  ```
  - Separate entries into two buckets:
    - **Pinned** (never pruned): `type === 'tas'` or `type === 'requirements'` or `type === 'spec'`
    - **Prunable**: all other types
  - Compute `pinnedTokens = sum(pinned.tokenCount)`.
  - If `pinnedTokens > tokenBudget`, log a critical warning but return all pinned entries (do not violate the invariant).
  - Sort prunable entries by `timestamp` ascending (oldest first).
  - Greedily include prunable entries from newest to oldest until `pinnedTokens + prunableTokens <= tokenBudget`.
  - Return `[...pinned, ...selectedPrunable]` sorted by `timestamp` ascending.
- [ ] Implement `tokenCount(text: string): number` utility using the project's existing tokenizer (`@devs/tokenizer` or equivalent) in `packages/memory/src/utils/token-counter.ts`.
- [ ] Export `ContextPruner` from `packages/memory/src/index.ts`.
- [ ] In `packages/memory/src/tiered-memory-manager.ts`, integrate the pruner:
  - After each `addEntry()` call, check if the total token count of the short-term buffer exceeds `PRUNE_THRESHOLD` (800,000 tokens, configurable via env `DEVS_PRUNE_THRESHOLD`).
  - If so, call `ContextPruner.prune()` and flush the removed entries to the medium-term SQLite store.

## 3. Code Review

- [ ] Verify the **pinned types invariant** is enforced as a constant set (not an inline condition), so future types can be added safely.
- [ ] Ensure `PRUNE_THRESHOLD` is not hardcoded inline — it must be read from configuration/env at construction time.
- [ ] Confirm no mutation of the input `entries` array (pruner must be a pure function returning a new array).
- [ ] Verify that `ContextPruner` has no runtime dependency on LanceDB or SQLite — it operates only on in-memory arrays (separation of concerns).
- [ ] Check that `ContextEntry.type` is a string-union, not an enum, for JSON serialization safety.
- [ ] Confirm `tokenCount` utility handles empty strings and multi-byte unicode without throwing.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm test --filter @devs/memory -- --testPathPattern=context-drift-guard` and confirm all tests pass.
- [ ] Run the full `@devs/memory` test suite: `pnpm test --filter @devs/memory` and confirm no regressions.
- [ ] Check test coverage: `pnpm test --filter @devs/memory -- --coverage` and confirm `context-pruner.ts` has ≥90% line coverage.

## 5. Update Documentation

- [ ] Update `packages/memory/README.md`:
  - Add a `## Context Drift Guard` section explaining the pinning invariant.
  - Document the `DEVS_PRUNE_THRESHOLD` environment variable.
  - List which `ContextEntry.type` values are always pinned.
- [ ] Add a TSDoc comment block to `ContextPruner` class and `prune()` method describing the pinning invariant and the token budget contract.
- [ ] Update agent memory file `.devs/memory/architectural_decisions.md` with an entry:
  ```
  Decision: TAS and Requirements entries in the context window are NEVER pruned, regardless of token pressure. This is enforced by ContextPruner. Requirement: [3_MCP-RISK-303].
  ```

## 6. Automated Verification

- [ ] Run `pnpm test --filter @devs/memory -- --testPathPattern=context-drift-guard --reporter=json > /tmp/context-drift-guard-results.json` and assert exit code is `0`.
- [ ] Verify the JSON output contains `"numFailedTests": 0` using: `node -e "const r=require('/tmp/context-drift-guard-results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `pnpm build --filter @devs/memory` and assert exit code is `0` to confirm TypeScript compilation succeeds.

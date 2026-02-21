# Task: Implement Short-Term In-Context Memory (Sub-Epic: 04_Short_and_Medium_Term_Memory)

## Covered Requirements
- [TAS-016], [3_MCP-TAS-016]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/short_term_memory.test.ts`, write unit tests that cover:
  - **append**: Calling `append(entry)` adds a `ContextEntry` to the internal buffer. Assert `getWindow()` returns the entry.
  - **getWindow with lastN**: `getWindow(3)` on a buffer of 10 entries returns only the last 3.
  - **getWindow default**: `getWindow()` with no argument returns all entries (up to capacity).
  - **tokenCount**: After appending entries with known `tokenEstimate` values, `tokenCount()` returns the correct sum.
  - **capacity eviction**: When `append` is called such that `tokenCount()` would exceed `maxTokens` (e.g., 128 000 tokens), the oldest entries are evicted until the buffer fits within the limit.
  - **clear**: After `clear()`, `getWindow()` returns `[]` and `tokenCount()` returns `0`.
  - **snapshot / restore**: `snapshot()` returns a serializable object; `restore(snapshot)` reconstructs the identical state (useful for context handoff).
  - **immutability**: `getWindow()` returns a copy; mutating the returned array does not affect internal state.
- [ ] All tests should be written before any implementation exists and must fail initially (red phase).

## 2. Task Implementation
- [ ] Create `packages/memory/src/short_term_memory.ts` implementing `IShortTermMemory`:
  ```ts
  export class ShortTermMemory implements IShortTermMemory {
    private buffer: ContextEntry[] = [];
    private totalTokens = 0;

    constructor(private readonly maxTokens: number = 128_000) {}

    append(entry: ContextEntry): void { /* ... */ }
    getWindow(lastN?: number): ContextEntry[] { /* ... */ }
    clear(): void { /* ... */ }
    tokenCount(): number { /* ... */ }
    snapshot(): ShortTermSnapshot { /* ... */ }
    restore(snapshot: ShortTermSnapshot): void { /* ... */ }
  }
  ```
- [ ] Define `ShortTermSnapshot` type in `types.ts` as `{ buffer: ContextEntry[]; totalTokens: number }`.
- [ ] The eviction strategy in `append` must be FIFO: remove entries from the front of `buffer` until `totalTokens + entry.tokenEstimate <= maxTokens`.
- [ ] `getWindow(lastN)`: if `lastN` is provided and less than buffer length, use `buffer.slice(-lastN)`; otherwise return a shallow copy of the full buffer.
- [ ] Export `ShortTermMemory` from `packages/memory/src/index.ts`.
- [ ] Add `ShortTermSnapshot` export to `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Verify that `ShortTermMemory` has no async methods—this is a fully synchronous, in-process data structure.
- [ ] Verify that `getWindow()` returns a new array (not a reference to internal buffer) to maintain encapsulation.
- [ ] Verify that `tokenCount()` stays O(1) by maintaining a running sum rather than recalculating on every call.
- [ ] Verify that `maxTokens` defaults to `128_000` (matching the short-term working set budget defined in TAS-016).
- [ ] Verify that no I/O (file, network, SQLite) is performed in this class.
- [ ] Confirm `ShortTermMemory` correctly implements `IShortTermMemory` (TypeScript will enforce this at compile time).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test short_term_memory` and confirm all tests pass (green phase).
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `packages/memory/src/short_term_memory.agent.md` documenting:
  - The FIFO eviction strategy and `maxTokens` limit.
  - When `snapshot()`/`restore()` should be called (e.g., before handing context to a new agent turn).
  - The relationship to TAS-016: this class IS the short-term (in-context) memory tier.
  - `3_MCP-TAS-016`: note that MCP tool wrappers for this class will be implemented in a subsequent task.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/short_term_test_results.json`.
- [ ] Execute: `node -e "const r = require('/tmp/short_term_test_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` — must exit with code `0`.
- [ ] Run `pnpm --filter @devs/memory tsc --noEmit` — must exit with code `0`.

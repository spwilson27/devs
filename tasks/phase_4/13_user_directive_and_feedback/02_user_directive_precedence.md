# Task: Enforce User Directive Precedence in Short-Term Memory (Sub-Epic: 13_User_Directive_and_Feedback)

## Covered Requirements
- [3_MCP-UNKNOWN-502]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/shortTermMemory.test.ts`, write unit tests for a `ShortTermMemoryManager` class focusing on directive precedence:
  - Test `buildContext(entries: MemoryEntry[]): ContextBlock[]`:
    - Given a mixed list of `MemoryEntry` items with types `["user_directive", "tool_result", "agent_thought", "spec"]`, assert the returned `ContextBlock[]` is ordered so all `user_directive` entries appear first regardless of insertion order.
    - Assert non-directive entries retain their relative original order after directive entries.
    - Assert that when no `user_directive` entries exist, the order of other entries is unchanged.
  - Test `addEntry(entry: MemoryEntry): void`:
    - Assert that adding a `user_directive` entry immediately flags it as `pinned: true`.
    - Assert that adding a non-directive entry does not set `pinned: true`.
  - Test `pruneToTokenBudget(budget: number): ContextBlock[]`:
    - Assert that `user_directive` entries are NEVER pruned regardless of token budget pressure.
    - Assert non-directive entries are pruned from oldest-first when the budget is exceeded.
    - Assert that if only directives remain and they exceed the budget, a `DirectiveBudgetExceededWarning` is emitted (not an error).

## 2. Task Implementation
- [ ] Create or update `packages/memory/src/shortTermMemory.ts` with `ShortTermMemoryManager`:
  - Define `MemoryEntry` type: `{ id: string; type: MemoryEntryType; content: string; timestamp: number; tokenCount: number; pinned?: boolean }`.
  - Define `MemoryEntryType` as union: `"user_directive" | "tool_result" | "agent_thought" | "spec" | "summary"`.
  - Implement `addEntry(entry: MemoryEntry)`:
    - If `entry.type === "user_directive"`, set `entry.pinned = true`.
    - Append to internal `entries: MemoryEntry[]`.
  - Implement `buildContext(): ContextBlock[]`:
    - Partition `entries` into `directives` (type `user_directive`) and `others`.
    - Return `[...directives, ...others]` mapped to `ContextBlock` shape.
  - Implement `pruneToTokenBudget(budget: number): ContextBlock[]`:
    - Separate pinned directives from non-pinned entries.
    - Compute `directiveTokens = sum(directives.map(e => e.tokenCount))`.
    - If `directiveTokens > budget`, emit `DirectiveBudgetExceededWarning` via the event bus and return directives only.
    - Otherwise, fill remaining budget with non-pinned entries newest-first.
    - Return ordered context.
  - Emit `DirectiveBudgetExceededWarning` event via `packages/events/src/eventBus.ts`.
- [ ] Add `DirectiveBudgetExceededWarning` to `packages/memory/src/events.ts`.
- [ ] Update `packages/memory/src/index.ts` to export `ShortTermMemoryManager`, `MemoryEntry`, `MemoryEntryType`.

## 3. Code Review
- [ ] Verify the precedence logic is implemented as a pure function (no side effects in `buildContext`/`pruneToTokenBudget`) to simplify testing and reasoning.
- [ ] Verify `user_directive` entries are immutably pinned at `addEntry` time and cannot be unpinned through any public API.
- [ ] Verify `pruneToTokenBudget` does NOT mutate the internal `entries` array; it returns a computed view only.
- [ ] Verify `DirectiveBudgetExceededWarning` is a non-fatal warning (not an exception) to prevent agent crashes.
- [ ] Verify no magic strings: `"user_directive"` is referenced only from the `MemoryEntryType` constant.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test` and confirm all precedence-related unit tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/memory test --coverage` and assert branch coverage for `shortTermMemory.ts` is ≥ 85%.
- [ ] Run `pnpm lint` and confirm no linting errors in the modified files.

## 5. Update Documentation
- [ ] Update `packages/memory/README.md` with a section "User Directive Precedence" describing the guaranteed ordering contract: user directives are always first in context and are never pruned.
- [ ] Update agent memory file `.devs/memory/decisions.md` with entry: `[3_MCP-UNKNOWN-502] User directives (type=user_directive) are pinned in ShortTermMemoryManager and always sorted to the front of the context window. They are immune to token-budget pruning; a DirectiveBudgetExceededWarning is emitted if they alone exceed the budget.`

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test 2>&1 | grep -E "PASS|FAIL"` and assert output contains only `PASS`.
- [ ] Run the scenario test `scripts/verify_directive_precedence.sh` which:
  1. Creates a `ShortTermMemoryManager` instance via a Node.js script.
  2. Adds entries of types `tool_result`, `user_directive`, `agent_thought` in that order.
  3. Calls `buildContext()` and asserts the first entry has `type === "user_directive"`.
  4. Calls `pruneToTokenBudget(1)` (extremely small budget) and asserts the directive entry is still present.
  5. Exits with code 0 on success, non-zero on failure.
- [ ] Assert CI pipeline (`pnpm ci`) exits with code 0.

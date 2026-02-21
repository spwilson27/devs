# Task: Implement Tool Result Truncation in Context Window (Sub-Epic: 10_Spec_Refresh_Protocol)

## Covered Requirements
- [3_MCP-TAS-051]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/toolResultRetention.test.ts`, write unit tests for a `ToolResultRetentionPolicy` class:
  - **Retention window**: After a tool result message is added at turn N, assert `isFullyRetained(msg, currentTurn)` returns `true` for `currentTurn <= N + 1` (retained for 2 turns: the turn it was produced and the next).
  - **Truncation trigger**: Assert `isFullyRetained(msg, N + 2)` returns `false` (truncation should apply from turn N+2 onward).
  - **`truncate()` output**: Given a 200-line tool result string, assert `truncate(toolResult, traceId)` returns a string shorter than 5 lines containing the literal `[TRUNCATED — full output in get_task_trace(traceId="{traceId}")]`.
  - **Full output preserved**: Assert that calling `truncate()` does NOT modify the original `toolResult` string (immutability).
  - **Integration with ContextWindow**: Construct a `ContextWindow` with 3 tool-result messages added at turns 1, 2, and 3. Simulate advancing to turn 4 and call `applyRetentionPolicy(contextWindow, currentTurn=4)`. Assert messages from turns 1 and 2 are truncated while turn 3's message is still full.

## 2. Task Implementation
- [ ] Create `packages/memory/src/toolResultRetentionPolicy.ts` exporting `ToolResultRetentionPolicy`:
  - `isFullyRetained(message: ContextMessage, currentTurn: number): boolean`:
    - Returns `true` if `message.type === 'tool_result'` AND `currentTurn - message.turn <= 1`.
    - Returns `true` for any non-`tool_result` message.
  - `truncate(fullOutput: string, traceId: string): string`:
    - Takes the first 3 lines of `fullOutput` and appends:
      `\n[TRUNCATED — full output in get_task_trace(traceId="{traceId}")]`
    - Returns the resulting string without mutating `fullOutput`.
  - `applyRetentionPolicy(contextWindow: IContextWindow, currentTurn: number): IContextWindow`:
    - Iterates all messages in `contextWindow.getMessages()`.
    - For each `tool_result` message where `!isFullyRetained(msg, currentTurn)`, replaces the message content with `truncate(msg.content, msg.traceId)`.
    - Returns a new `IContextWindow` (immutable — do not modify the input in place).
- [ ] Extend `ContextMessage` type in `packages/memory/src/types.ts` to include:
  ```ts
  export interface ContextMessage {
    id: string;
    type: 'user' | 'assistant' | 'tool_result' | 'spec_refresh';
    content: string;
    turn: number;
    traceId?: string; // required when type === 'tool_result'
  }
  ```
- [ ] Export `ToolResultRetentionPolicy` from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Confirm `applyRetentionPolicy()` returns a new context window object — it must not mutate the input `IContextWindow`.
- [ ] Verify `truncate()` is a pure function (no I/O, no side effects, deterministic output given the same inputs).
- [ ] Confirm `isFullyRetained()` applies only to `tool_result` messages; all other message types must always return `true` (never truncated by this policy).
- [ ] Verify `traceId` is included in every `tool_result` message at the creation site (enforced by TypeScript's type system — the `traceId` field should be required on `tool_result`-typed messages via a discriminated union).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=toolResultRetention` — all tests pass, zero skips.
- [ ] Run `pnpm --filter @devs/memory test -- --coverage` — `toolResultRetentionPolicy.ts` has ≥ 95% line coverage.

## 5. Update Documentation
- [ ] Add a `## Tool Result Retention Policy` section to `packages/memory/README.md` explaining the 2-turn retention window, the truncation format, and the `traceId` requirement.
- [ ] Update `docs/architecture/context-management.md` to describe the tool result lifecycle: full for 2 turns → truncated thereafter → full raw output available via `get_task_trace`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory build` — zero TypeScript errors.
- [ ] Run a quick smoke test: `node -e "const {ToolResultRetentionPolicy} = require('./packages/memory/dist'); const p = new ToolResultRetentionPolicy(); const out = p.truncate(Array.from({length:200}, (_,i)=>'line '+i).join('\n'), 'abc-123'); console.assert(out.includes('TRUNCATED'), 'missing truncation marker'); console.log('OK');"` — prints `OK`.

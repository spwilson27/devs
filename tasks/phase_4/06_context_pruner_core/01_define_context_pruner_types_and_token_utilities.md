# Task: Define ContextPruner Types, Interfaces, and Token Estimation Utilities (Sub-Epic: 06_Context_Pruner_Core)

## Covered Requirements
- [TAS-024], [2_TAS-REQ-028]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/context-pruner/__tests__/token-utils.test.ts`.
  - Write unit tests for `estimateTokenCount(text: string): number` — verify it returns a numeric estimate for empty strings, short strings, and long multi-paragraph strings.
  - Write unit tests for `estimateMessagesTokenCount(messages: ConversationTurn[]): number` — verify it correctly sums token estimates across an array of `ConversationTurn` objects (role + content fields).
  - Assert that `estimateTokenCount('')` returns `0`.
  - Assert that `estimateTokenCount('hello world')` returns a positive integer consistent with `Math.ceil(text.length / 4)` (character-based GPT-4 approximation).
  - Assert that `estimateMessagesTokenCount([])` returns `0`.
  - Assert that `estimateMessagesTokenCount` handles `tool_result` roles with multi-part content arrays without throwing.
- [ ] Create `packages/memory/src/context-pruner/__tests__/types.test.ts`.
  - Write compile-time type guard tests using `satisfies` to ensure `ConversationTurn`, `ContextWindow`, `PrunerConfig`, and `PrunerResult` types are structurally correct.
  - Verify that a `PrunerResult` with `pruned: false` has a `summary` field of `undefined`.
  - Verify that a `PrunerResult` with `pruned: true` has a non-empty `summary` string and `removedTurnCount >= 1`.

## 2. Task Implementation

- [ ] Create the package scaffold at `packages/memory/` if it does not already exist. Ensure `package.json` exports `@devs/memory` with an `exports` field pointing to `./src/index.ts` (for TypeScript project references) and `./dist/index.js`.
- [ ] Create `packages/memory/src/context-pruner/types.ts` with the following exported types:
  ```typescript
  export type TurnRole = 'user' | 'model' | 'tool_result' | 'tool_call';

  export interface ConversationTurn {
    id: string;           // UUID
    role: TurnRole;
    content: string | ContentPart[];
    timestamp: number;    // Unix epoch ms
    tokenEstimate?: number;
    pinned?: boolean;     // If true, this turn is never pruned
  }

  export interface ContentPart {
    type: 'text' | 'tool_result';
    text?: string;
    toolUseId?: string;
    content?: string;
  }

  export interface ContextWindow {
    turns: ConversationTurn[];
    totalTokenEstimate: number;
  }

  export interface PrunerConfig {
    softLimitTokens: number;  // default: 500_000  (8_RISKS-REQ-010 trigger)
    hardLimitTokens: number;  // default: 800_000  (TAS-024 trigger)
    pinnedPrefixTurns: number; // Number of initial turns always kept (system prompt, PRD injection)
    model: string;             // Flash model identifier, e.g. 'gemini-3-flash'
  }

  export interface PrunerResult {
    pruned: boolean;
    window: ContextWindow;
    summary?: string;          // The generated summary text (only when pruned: true)
    removedTurnCount?: number;
    tokensSaved?: number;
  }
  ```
- [ ] Create `packages/memory/src/context-pruner/token-utils.ts`:
  - Export `estimateTokenCount(text: string): number` using `Math.ceil(text.length / 4)` approximation. For empty string, return `0`.
  - Export `estimateMessagesTokenCount(turns: ConversationTurn[]): number` that iterates over turns, serializes `content` to a plain string (JSON.stringify for array content parts), and sums `estimateTokenCount` for each turn including role overhead (+4 tokens per turn).
  - Export `annotateWithTokenEstimates(turns: ConversationTurn[]): ConversationTurn[]` that returns a new array with `tokenEstimate` populated on each turn (non-mutating).
- [ ] Export all types and utilities from `packages/memory/src/context-pruner/index.ts`.
- [ ] Re-export from `packages/memory/src/index.ts`.

## 3. Code Review

- [ ] Verify that all types are exported and no `any` types are used.
- [ ] Verify that `estimateTokenCount` and `estimateMessagesTokenCount` are pure functions with no side effects.
- [ ] Verify `annotateWithTokenEstimates` does not mutate the input array (spread or map pattern).
- [ ] Confirm the `PrunerConfig` defaults (`softLimitTokens: 500_000`, `hardLimitTokens: 800_000`) align with [TAS-024] (800k) and [8_RISKS-REQ-010] (500k).
- [ ] Confirm no external dependencies are introduced beyond the existing `@devs` monorepo packages.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test` and confirm all tests in `token-utils.test.ts` and `types.test.ts` pass with zero failures.
- [ ] Run `pnpm tsc --noEmit` in `packages/memory/` and confirm no TypeScript errors.

## 5. Update Documentation

- [ ] Add a `## ContextPruner` section to `packages/memory/README.md` documenting the exported types and token utility functions.
- [ ] Update the phase 4 agent memory file (`.devs/memory/phase_4_decisions.md`) with the entry: _"ContextPruner uses character-length / 4 token estimation. Soft limit: 500k tokens (triggers Flash summarization). Hard limit: 800k tokens (enforced pruning)."_

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/memory-test-results.json` and assert exit code is `0`.
- [ ] Run `node -e "const r = require('/tmp/memory-test-results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` to confirm zero test failures programmatically.

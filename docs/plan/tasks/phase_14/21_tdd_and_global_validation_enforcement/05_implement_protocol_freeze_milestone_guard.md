# Task: Implement Protocol Freeze Milestone Guard (Sub-Epic: 21_TDD and Global Validation Enforcement)

## Covered Requirements
- [9_ROADMAP-REQ-043]

## 1. Initial Test Written
- [ ] In `src/orchestrator/__tests__/protocolFreezeGuard.test.ts`, write unit tests for a `ProtocolFreezeGuard` class:
  - Test: `freeze(milestone: string)` persists a freeze record to the state store with `{ milestone, frozenAt: ISO-8601 }`.
  - Test: `isFrozen()` returns `true` after `freeze()` has been called.
  - Test: `isFrozen()` returns `false` when no freeze record exists in the state store.
  - Test: `checkForBreakingChange(changeset)` throws `ProtocolFrozenError` when `isFrozen()` is `true` and the changeset modifies any file matching the breaking-change patterns (e.g., `src/orchestrator/agentLoop.ts`, `src/validation/*.ts`, `requirements.md`, `package.json` `devs` section).
  - Test: `checkForBreakingChange(changeset)` does NOT throw when `isFrozen()` is `true` but the changeset only modifies non-protected files (e.g., `src/ui/components/*.tsx`).
  - Test: `checkForBreakingChange(changeset)` does NOT throw when `isFrozen()` is `false`, regardless of the changeset.
  - Test: `thaw()` removes the freeze record and `isFrozen()` subsequently returns `false`.
  - All tests must initially FAIL (Red phase).

## 2. Task Implementation
- [ ] Create `src/orchestrator/protocolFreezeGuard.ts`:
  - Define `ProtocolFrozenError extends Error` with fields `{ milestone: string; attemptedChange: string }`.
  - Define `BREAKING_CHANGE_PATTERNS: readonly string[]` — a list of glob patterns for files considered "protocol-level": `['src/orchestrator/agentLoop.ts', 'src/orchestrator/tddEnforcer.ts', 'src/validation/**', 'requirements.md', 'package.json']`.
  - Implement `ProtocolFreezeGuard`:
    - Constructor accepts a `StateStore` (the existing project state persistence layer).
    - `async freeze(milestone: string): Promise<void>`: persist `{ milestone, frozenAt: new Date().toISOString() }` under key `protocol_freeze` in `StateStore`.
    - `async isFrozen(): Promise<boolean>`: return whether key `protocol_freeze` exists in `StateStore`.
    - `async checkForBreakingChange(changedFilePaths: string[]): Promise<void>`:
      1. If not frozen, return immediately.
      2. Use `micromatch` (or `minimatch`, whichever is already a project dependency) to test each path against `BREAKING_CHANGE_PATTERNS`.
      3. If any path matches, throw `ProtocolFrozenError` with `{ milestone, attemptedChange: matchedPath }`.
    - `async thaw(): Promise<void>`: delete the `protocol_freeze` key from `StateStore`.
  - Export `ProtocolFreezeGuard` as a named export.
- [ ] In the orchestration loop (`src/orchestrator/agentLoop.ts`), call `protocolFreezeGuard.checkForBreakingChange(changedFiles)` before committing any file changes to git during P6+ phases.

## 3. Code Review
- [ ] Confirm `BREAKING_CHANGE_PATTERNS` covers all orchestrator-critical files and is not modifiable at runtime.
- [ ] Confirm `ProtocolFrozenError` includes enough context (`milestone`, `attemptedChange`) for the user to understand what freeze is active and which file triggered it.
- [ ] Confirm `thaw()` is only callable by a privileged flow (e.g., guarded by a human-approval check in its callers, not exposed directly to agent code paths).
- [ ] Confirm TypeScript strict mode is satisfied.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="protocolFreezeGuard"` and confirm all tests pass.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.

## 5. Update Documentation
- [ ] Create `src/orchestrator/protocolFreezeGuard.agent.md` documenting:
  - Purpose: prevents breaking changes to protocol-level files once the Phase 1 "Protocol Freeze" milestone is reached.
  - When `freeze()` is called in the project lifecycle (end of P1).
  - `BREAKING_CHANGE_PATTERNS` list and rationale for each entry.
  - `ProtocolFrozenError` schema.
  - How to `thaw()` the freeze (authorized human-approval flow only).
- [ ] Add a `## Protocol Freeze` section to `docs/milestones.md` (create if missing) explaining the Protocol Freeze concept per [9_ROADMAP-REQ-043].
- [ ] Add `protocolFreezeGuard.agent.md` to the root `AGENTS.md` AOD index.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="protocolFreezeGuard" --coverage` and confirm all tests pass with ≥ 95% statement coverage on `protocolFreezeGuard.ts`.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.
- [ ] Confirm `src/orchestrator/protocolFreezeGuard.agent.md` exists: `test -f src/orchestrator/protocolFreezeGuard.agent.md && echo "AOD OK"`.
- [ ] Confirm `docs/milestones.md` contains "Protocol Freeze": `grep -q "Protocol Freeze" docs/milestones.md && echo "MILESTONE DOC OK"`.

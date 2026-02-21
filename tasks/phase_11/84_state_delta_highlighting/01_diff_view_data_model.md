# Task: Implement State Delta Data Model and Backend Diff Computation (Sub-Epic: 84_State_Delta_Highlighting)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-086]

## 1. Initial Test Written
- [ ] In `packages/ui-hooks/src/__tests__/useStateDelta.test.ts`, write unit tests for a `useStateDelta` hook that:
  - Accepts a `turnId: string` parameter and returns `{ files: DeltaFile[], isLoading: boolean, error: string | null }`.
  - `DeltaFile` type must have shape `{ path: string; status: 'added' | 'modified' | 'deleted'; oldContent: string | null; newContent: string | null; hunks: DiffHunk[] }`.
  - `DiffHunk` must have shape `{ oldStart: number; oldLines: number; newStart: number; newLines: number; lines: DiffLine[] }`.
  - `DiffLine` must have shape `{ type: 'context' | 'add' | 'remove'; content: string; oldLineNo: number | null; newLineNo: number | null }`.
  - Test: when `turnId` is null/undefined, returns empty `files: []` and `isLoading: false`.
  - Test: when `turnId` is valid, calls `window.vscodeApi.postMessage({ type: 'GET_TURN_DELTA', turnId })` and transitions `isLoading` to `true`.
  - Test: upon receiving a `STATE_DELTA_RESPONSE` message with matching `turnId`, populates `files` from the payload and sets `isLoading: false`.
  - Test: upon receiving a `STATE_DELTA_ERROR` message, sets `error` field and `isLoading: false`.
  - Test: unmounting the hook while loading cancels the pending request (no state update after unmount).
- [ ] In `packages/vscode/src/__tests__/StateDeltaProvider.test.ts`, write unit tests for the extension-side `StateDeltaProvider` class:
  - Test: `getDelta(turnId)` calls `git diff` between the commit recorded before and after the implementation turn stored in `state.sqlite`.
  - Test: returns correct `DeltaFile[]` array parsed from the git diff output.
  - Test: if git is unavailable or the turnId is unknown, responds with a well-formed error payload.
  - Test: handles binary files gracefully (marks `newContent: null`, `oldContent: null`, `status: 'modified'`, empty `hunks: []`).

## 2. Task Implementation
- [ ] Define TypeScript types `DeltaFile`, `DiffHunk`, `DiffLine` in `packages/shared-types/src/stateDelta.ts` and export from the package index.
- [ ] Implement `StateDeltaProvider` class in `packages/vscode/src/providers/StateDeltaProvider.ts`:
  - Inject a `DatabaseService` (reads `state.sqlite`) to resolve the before/after git commit SHAs for a given `turnId`.
  - Execute `git diff --unified=3 <beforeSha> <afterSha>` via Node `child_process.execFile` (never `exec` with shell injection risk).
  - Parse the unified diff output into `DeltaFile[]` using a pure parsing function `parseUnifiedDiff(raw: string): DeltaFile[]`.
  - Register a handler in the extension's `postMessage` router for `GET_TURN_DELTA` that calls `getDelta` and posts `STATE_DELTA_RESPONSE` or `STATE_DELTA_ERROR` back to the Webview.
- [ ] Implement `parseUnifiedDiff(raw: string): DeltaFile[]` in `packages/vscode/src/utils/parseUnifiedDiff.ts`:
  - Parse `--- a/...` / `+++ b/...` headers to determine file paths and status.
  - Parse `@@ -oldStart,oldLines +newStart,newLines @@` hunk headers.
  - Classify lines by leading `+`, `-`, or ` ` character into `DiffLine.type`.
  - Track `oldLineNo` and `newLineNo` per line.
- [ ] Implement `useStateDelta` hook in `packages/ui-hooks/src/useStateDelta.ts`:
  - Use `useEffect` to post `GET_TURN_DELTA` when `turnId` changes.
  - Subscribe to `window.addEventListener('message', handler)` for the matching response.
  - Store result in local `useState`.
  - Clean up event listener on unmount; use a `cancelled` flag to guard against stale updates.

## 3. Code Review
- [ ] Verify `parseUnifiedDiff` is a pure function with zero side-effects and is independently unit-testable without any DOM or VSCode API.
- [ ] Verify `StateDeltaProvider.getDelta` uses `execFile` (not `exec`) and that all arguments to git are passed as an array (no shell injection).
- [ ] Verify `useStateDelta` does not hold stale closures — the `turnId` used in the response handler matches the one that triggered the request.
- [ ] Verify types `DeltaFile`, `DiffHunk`, `DiffLine` are exported from `@devs/shared-types` and consumed via the shared package in both Webview and extension host (no local type duplication).
- [ ] Verify no hardcoded file paths or git binary paths — the git executable path must be configurable via workspace settings or auto-detected.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/shared-types test` — all type exports resolve without error.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=StateDeltaProvider` — all provider tests pass.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=parseUnifiedDiff` — all parser tests pass including binary file edge cases.
- [ ] Run `pnpm --filter @devs/ui-hooks test -- --testPathPattern=useStateDelta` — all hook tests pass including unmount cancellation test.
- [ ] Confirm zero TypeScript errors: `pnpm --filter @devs/vscode tsc --noEmit && pnpm --filter @devs/ui-hooks tsc --noEmit`.

## 5. Update Documentation
- [ ] Add a JSDoc comment block to `parseUnifiedDiff` describing the expected input format and return structure.
- [ ] Add a JSDoc comment to `useStateDelta` describing the `turnId` parameter, return shape, and lifecycle behavior.
- [ ] Update `packages/vscode/AGENTS.md` (or create if absent) with a section "State Delta Provider" describing how turn commit SHAs are resolved from `state.sqlite` and how diffs are computed.
- [ ] Update `packages/ui-hooks/AGENTS.md` with a section "useStateDelta" documenting the hook contract and message protocol.

## 6. Automated Verification
- [ ] Run `pnpm test --filter @devs/vscode --filter @devs/ui-hooks --filter @devs/shared-types` from the repo root and confirm all suites exit 0.
- [ ] Run `pnpm tsc --noEmit` from the repo root and confirm zero type errors.
- [ ] Verify the `parseUnifiedDiff` test suite achieves ≥ 95% line coverage by checking the Jest coverage report: `pnpm --filter @devs/vscode test --coverage -- --testPathPattern=parseUnifiedDiff`.

# Task: Integrate SpecSignOff Component into SPEC_VIEW and Wire Backend Accept/Reject Actions (Sub-Epic: 84_State_Delta_Highlighting)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-087]

## 1. Initial Test Written
- [ ] In `packages/webview/src/views/__tests__/SpecView.test.tsx`, write integration tests:
  - Test: when the project phase is `PHASE_2_SPEC_REVIEW` (from Zustand store), the `SpecView` renders the `SpecSignOff` component.
  - Test: when the project phase is NOT `PHASE_2_SPEC_REVIEW`, the `SpecSignOff` component is NOT rendered (the view is read-only).
  - Test: `SpecSignOff` receives `blocks` derived from the `specBlocks` slice of the Zustand store.
  - Test: when `onAccept(reqId)` is called, the Webview posts `{ type: 'SPEC_BLOCK_ACCEPT', reqId }` via `window.vscodeApi.postMessage`.
  - Test: when `onReject(reqId, reason)` is called, the Webview posts `{ type: 'SPEC_BLOCK_REJECT', reqId, reason }` via `window.vscodeApi.postMessage`.
  - Test: when `onSubmitReview()` is called, the Webview posts `{ type: 'SPEC_REVIEW_SUBMIT' }` and the `SpecView` transitions to a "Review Submitted" confirmation state.
  - Test: upon receiving a `SPEC_BLOCKS_UPDATED` message from the extension, the Zustand `specBlocks` store is updated and `SpecSignOff` re-renders with new statuses.
- [ ] In `packages/vscode/src/__tests__/SpecSignOffHandler.test.ts`, write extension-side handler tests:
  - Test: `SPEC_BLOCK_ACCEPT` message persists the acceptance in `state.sqlite` with `accepted_at` timestamp.
  - Test: `SPEC_BLOCK_REJECT` message persists the rejection and `rejectionReason` in `state.sqlite`.
  - Test: `SPEC_REVIEW_SUBMIT` message triggers the `PhaseGateService.advancePhase()` call, transitioning the project from `PHASE_2_SPEC_REVIEW` to `PHASE_3_ROADMAP`.
  - Test: after persisting an accept or reject, the handler posts `SPEC_BLOCKS_UPDATED` back to the Webview with the full updated `RequirementBlock[]` array.
  - Test: if `PhaseGateService.advancePhase()` fails (e.g., not all blocks accepted), the extension posts `SPEC_REVIEW_ERROR` with an error message and does NOT advance the phase.

## 2. Task Implementation
- [ ] Add Zustand store slice `specBlocks: RequirementBlock[]` and action `setSpecBlocks(blocks: RequirementBlock[])` in `packages/webview/src/store/specStore.ts` (create if absent).
- [ ] Add message handler cases in `packages/webview/src/messaging/messageHandler.ts`:
  - `SPEC_BLOCKS_UPDATED`: calls `setSpecBlocks(payload.blocks)`.
  - `SPEC_REVIEW_ERROR`: dispatches an error notification to the UI notification store.
- [ ] Update `packages/webview/src/views/SpecView.tsx`:
  - Read `projectPhase` from Zustand store via `useUIStore(state => state.projectPhase)`.
  - Read `specBlocks` from `useSpecStore(state => state.specBlocks)`.
  - When `projectPhase === 'PHASE_2_SPEC_REVIEW'`, render `<SpecSignOff>` with:
    - `blocks={specBlocks}`
    - `onAccept={(reqId) => vscodeApi.postMessage({ type: 'SPEC_BLOCK_ACCEPT', reqId })}`
    - `onReject={(reqId, reason) => vscodeApi.postMessage({ type: 'SPEC_BLOCK_REJECT', reqId, reason })}`
    - `onSubmitReview={() => vscodeApi.postMessage({ type: 'SPEC_REVIEW_SUBMIT' })}`
  - After `onSubmitReview`, render a local `reviewSubmitted` state that shows "Review submitted. Waiting for phase transition..." instead of the form.
- [ ] Implement `SpecSignOffHandler` in `packages/vscode/src/handlers/SpecSignOffHandler.ts`:
  - Handles `SPEC_BLOCK_ACCEPT`: calls `DatabaseService.updateSpecBlockStatus(reqId, 'accepted', null, Date.now())`.
  - Handles `SPEC_BLOCK_REJECT`: calls `DatabaseService.updateSpecBlockStatus(reqId, 'rejected', reason, Date.now())`.
  - After each update, queries all blocks and posts `SPEC_BLOCKS_UPDATED` with the full array to the Webview.
  - Handles `SPEC_REVIEW_SUBMIT`: validates all blocks are accepted or rejected (no pending), then calls `PhaseGateService.advancePhase('PHASE_2_SPEC_REVIEW')`. On failure, posts `SPEC_REVIEW_ERROR`.
- [ ] Register `SpecSignOffHandler` in the extension's message router in `packages/vscode/src/extension.ts`.
- [ ] Add `DatabaseService.updateSpecBlockStatus` method to `packages/vscode/src/services/DatabaseService.ts` that executes an `UPDATE spec_blocks SET status=?, rejection_reason=?, reviewed_at=? WHERE req_id=?` query.

## 3. Code Review
- [ ] Verify `SpecView` uses a selector `useSpecStore(state => state.specBlocks)` (not a full store subscription) to limit re-renders to only spec block changes.
- [ ] Verify `DatabaseService.updateSpecBlockStatus` uses parameterized queries (no string interpolation of user input) to prevent SQL injection.
- [ ] Verify the phase advance is only attempted when ALL blocks are non-pending — the guard must be server-side in `SpecSignOffHandler`, not just client-side in the UI.
- [ ] Verify the `SPEC_BLOCKS_UPDATED` message always contains the full `RequirementBlock[]` array (not a delta), so the Webview can replace its state atomically.
- [ ] Verify `SpecView` does not render `SpecSignOff` outside of `PHASE_2_SPEC_REVIEW` — the component is gated, consistent with "Incremental View Unlocking" (per `[6_UI_UX_ARCH-REQ-062]`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern=SpecView` — all integration tests pass.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=SpecSignOffHandler` — all handler tests pass.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=DatabaseService` — `updateSpecBlockStatus` tests pass.
- [ ] Run `pnpm --filter @devs/webview build && pnpm --filter @devs/vscode build` — both packages build cleanly.
- [ ] Run `pnpm tsc --noEmit` from repo root — zero TypeScript errors across all packages.

## 5. Update Documentation
- [ ] Update `packages/webview/AGENTS.md` section "SpecView" to document:
  - The phase-gating logic (`PHASE_2_SPEC_REVIEW` condition).
  - The message protocol (`SPEC_BLOCK_ACCEPT`, `SPEC_BLOCK_REJECT`, `SPEC_REVIEW_SUBMIT`, `SPEC_BLOCKS_UPDATED`, `SPEC_REVIEW_ERROR`).
- [ ] Update `packages/vscode/AGENTS.md` with a section "SpecSignOffHandler" describing:
  - The persistence schema (`spec_blocks` table columns).
  - The phase gate validation logic.
  - The `PhaseGateService.advancePhase` dependency.
- [ ] Update `packages/webview/AGENTS.md` section "Zustand Store" to document `specBlocks` slice and `setSpecBlocks` action.

## 6. Automated Verification
- [ ] Run `pnpm test` from repo root — full test suite passes with zero regressions.
- [ ] Run `pnpm --filter @devs/vscode test --coverage -- --testPathPattern=SpecSignOffHandler` and confirm ≥ 90% line coverage for `SpecSignOffHandler.ts` and `DatabaseService.updateSpecBlockStatus`.
- [ ] Manually verify (or write an E2E test) that navigating to `SPEC_VIEW` during `PHASE_2_SPEC_REVIEW` shows the sign-off UI, and that accepting all blocks and submitting transitions the project to `PHASE_3_ROADMAP` in `state.sqlite`.

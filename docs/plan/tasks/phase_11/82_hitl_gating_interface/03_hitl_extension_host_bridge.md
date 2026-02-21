# Task: VSCode Extension Host HITL Checkpoint Trigger & postMessage Bridge (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [1_PRD-REQ-INT-010], [4_USER_FEATURES-REQ-009]

## 1. Initial Test Written

- [ ] Create `packages/vscode/src/__tests__/hitlCheckpointTrigger.test.ts` using `jest` with `vscode` mocked via `@vscode/test-electron` or a manual `__mocks__/vscode.ts`.
- [ ] Write unit tests for `HitlCheckpointService`:
  - Test that `triggerGate(payload)` with `priority: 'BLOCKING'` sends a `{ type: 'HITL_GATE_OPEN', payload }` message to the active Webview panel via `panel.webview.postMessage`.
  - Test that `triggerGate(payload)` with `priority: 'ADVISORY'` also sends `HITL_GATE_OPEN` (advisory is handled on the webview side).
  - Test that `triggerGate` returns a `Promise<'APPROVED' | 'REJECTED'>` that resolves when a `HITL_GATE_RESOLVED` message is received from the Webview with the matching `gateId`.
  - Test that the Promise for a `BLOCKING` gate rejects (throws `HitlGateRejectedError`) when the resolution is `REJECTED`.
  - Test that `registerGateCheckpoint(phase, gateConfig)` correctly stores the gate config and is invoked by the orchestrator hooks.
  - Test that a `HITL_GATE_RESOLVED` message with an unknown `gateId` is silently ignored (no error thrown).
- [ ] Write an integration test simulating the full round-trip: extension sends `HITL_GATE_OPEN` → webview sends `HITL_GATE_RESOLVED` → promise resolves correctly.

## 2. Task Implementation

- [ ] Create `packages/vscode/src/services/HitlCheckpointService.ts`:
  - Class `HitlCheckpointService` with constructor `(panel: vscode.WebviewPanel)`.
  - Private `Map<string, { resolve: Function; reject: Function }>` for pending gate promises.
  - `triggerGate(payload: HitlGatePayload): Promise<'APPROVED' | 'REJECTED'>`:
    - Sends `{ type: 'HITL_GATE_OPEN', payload }` to the webview.
    - Returns a `Promise` stored in the pending gates map keyed by `payload.gateId`.
  - `handleWebviewMessage(message: unknown): void`:
    - Pattern-matches on `{ type: 'HITL_GATE_RESOLVED', gateId: string, resolution: 'APPROVED' | 'REJECTED', rejectionReason?: string }`.
    - Resolves or rejects the stored promise accordingly.
    - Throws `HitlGateRejectedError` (extend `Error`) if `resolution === 'REJECTED'` so the orchestrator can handle it.
  - `registerCheckpointHook(phase: number, condition: () => boolean, gatePayloadFactory: () => HitlGatePayload)`: stores hook configs to be invoked by the orchestrator at defined phase boundaries.
- [ ] Register `HitlCheckpointService` in `packages/vscode/src/extension.ts`:
  - Instantiate after Webview panel creation.
  - Wire `panel.webview.onDidReceiveMessage` to call `hitlService.handleWebviewMessage(message)`.
  - Export a singleton accessor `getHitlService()` for use by orchestrator modules.
- [ ] In `packages/vscode-webview/src/messageHandler.ts`, add outbound message sending on gate resolution:
  - When `approveGate` or `rejectGate` is called in the Zustand store, dispatch a `{ type: 'HITL_GATE_RESOLVED', gateId, resolution: 'APPROVED' | 'REJECTED', rejectionReason? }` message to the extension host via `acquireVsCodeApi().postMessage(...)`.
- [ ] Define `HitlGateRejectedError` in `packages/vscode/src/errors/HitlGateRejectedError.ts`:
  ```ts
  export class HitlGateRejectedError extends Error {
    constructor(public readonly gateId: string, public readonly reason: string) {
      super(`HITL gate "${gateId}" was rejected: ${reason}`);
      this.name = 'HitlGateRejectedError';
    }
  }
  ```

## 3. Code Review

- [ ] Confirm `panel.webview.postMessage` is the only communication channel — no direct imports from the webview package into the extension host (thin-UI contract per [6_UI_UX_ARCH-REQ-003]).
- [ ] Verify the pending gate `Map` is cleaned up (deleted) after resolution to prevent memory leaks.
- [ ] Confirm that orchestrator calls to `triggerGate` are wrapped in `try/catch` to handle `HitlGateRejectedError` gracefully and halt further agent actions.
- [ ] Check that the `HITL_GATE_OPEN` postMessage is batched correctly within the 50ms message batching buffer ([6_UI_UX_ARCH-REQ-036]) — HITL messages MUST bypass the batch buffer and be sent immediately (priority path).
- [ ] Verify that the `HitlCheckpointService` has no direct dependency on any UI rendering library.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="hitlCheckpointTrigger"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode tsc --noEmit` to verify no TypeScript compilation errors.

## 5. Update Documentation

- [ ] Add `HitlCheckpointService` to `packages/vscode/README.md` under **"Extension Services"**, documenting its API, the message protocol (`HITL_GATE_OPEN` / `HITL_GATE_RESOLVED`), and how to register checkpoint hooks.
- [ ] Update `docs/agent_memory/phase_11_decisions.md`: "HITL gate resolution is a request/response postMessage protocol. BLOCKING gates use a Promise that throws HitlGateRejectedError on rejection. HITL messages bypass the 50ms batching buffer."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/vscode test --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm threshold is met.
- [ ] Run `grep -r 'HITL_GATE_RESOLVED' packages/vscode-webview/src/messageHandler.ts` and assert the outbound message is present.
- [ ] Run `grep -r 'HitlGateRejectedError' packages/vscode/src/services/HitlCheckpointService.ts` and assert it is thrown on rejection.

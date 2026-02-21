# Task: HITL Gate State Machine & Zustand Store Slice (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [1_PRD-REQ-INT-010], [4_USER_FEATURES-REQ-009]

## 1. Initial Test Written

- [ ] Create `packages/ui-hooks/src/__tests__/useHitlGateStore.test.ts`.
- [ ] Write unit tests for the Zustand store slice:
  - Test that the initial state has `gates: {}` and `activeGateId: null`.
  - Test `openGate(gateId, gatePayload)` transitions a gate from `PENDING` → `AWAITING_APPROVAL` and sets `activeGateId`.
  - Test `approveGate(gateId)` transitions state to `APPROVED` and clears `activeGateId`.
  - Test `rejectGate(gateId, reason)` transitions state to `REJECTED`, stores the rejection reason, and clears `activeGateId`.
  - Test `dismissGate(gateId)` returns gate to `PENDING` without marking as approved/rejected.
  - Test that `openGate` is a no-op if a gate is already `APPROVED`.
- [ ] Write unit tests for the `HitlGatePayload` TypeScript type enforcement (compile-time via `tsc --noEmit`).
- [ ] Write an integration test confirming that a second `openGate` call while `activeGateId` is set queues the new gate (does not silently drop it).

## 2. Task Implementation

- [ ] Define the TypeScript types in `packages/ui-hooks/src/types/hitl.ts`:
  ```ts
  export type HitlGateStatus = 'PENDING' | 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED';

  export interface HitlGatePayload {
    gateId: string;            // Unique checkpoint identifier (e.g., "PHASE_2_PRD_REVIEW")
    title: string;             // Human-readable gate title shown in popup header
    description: string;       // Markdown-formatted description of what is being approved
    checkpointPhase: number;   // Project phase number that triggered this gate
    requirementIds: string[];  // Array of REQ-IDs that must be signed off
    priority: 'BLOCKING' | 'ADVISORY'; // BLOCKING halts agent; ADVISORY logs and continues
  }

  export interface HitlGateEntry {
    payload: HitlGatePayload;
    status: HitlGateStatus;
    rejectionReason?: string;
    openedAt: number;   // Unix timestamp
    resolvedAt?: number;
  }

  export interface HitlGateState {
    gates: Record<string, HitlGateEntry>;
    activeGateId: string | null;
    pendingQueue: string[];  // gateIds queued while activeGateId is set
  }
  ```
- [ ] Create the Zustand store slice in `packages/ui-hooks/src/stores/hitlGateStore.ts`:
  - Implement `openGate(payload: HitlGatePayload)`: if `activeGateId` is null, set it and transition gate to `AWAITING_APPROVAL`; otherwise push to `pendingQueue`.
  - Implement `approveGate(gateId: string)`: set status `APPROVED`, `resolvedAt = Date.now()`, clear `activeGateId`, dequeue next pending gate (if any) by calling `openGate` on the next queued payload.
  - Implement `rejectGate(gateId: string, reason: string)`: set status `REJECTED`, store `rejectionReason`, `resolvedAt`, clear `activeGateId`, dequeue next.
  - Implement `dismissGate(gateId: string)`: set status back to `PENDING`, clear `activeGateId`, dequeue next.
  - Export the store hook as `useHitlGateStore`.
- [ ] Re-export everything from `packages/ui-hooks/src/index.ts`.
- [ ] Wire the store to receive `HITL_GATE_OPEN` messages from the VSCode extension host: in `packages/vscode/src/webview/messageHandler.ts`, add a case for `{ type: 'HITL_GATE_OPEN', payload: HitlGatePayload }` that calls `useHitlGateStore.getState().openGate(payload)`.

## 3. Code Review

- [ ] Verify the store slice uses `immer` middleware (via Zustand's `immer` middleware wrapper) for immutable state updates — do not use direct mutation without immer.
- [ ] Confirm no `any` types appear in `hitl.ts` or `hitlGateStore.ts`.
- [ ] Ensure the `pendingQueue` dequeue logic does not cause infinite recursion if a gate is immediately approved inside `openGate`.
- [ ] Confirm the store is not directly imported into the VSCode extension host — communication MUST go through `postMessage` to maintain the thin-UI contract ([6_UI_UX_ARCH-REQ-003]).
- [ ] Check that `HitlGatePayload.priority` is respected: `ADVISORY` gates MUST NOT set `activeGateId` (log-only path).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/ui-hooks test -- --testPathPattern="useHitlGateStore"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/ui-hooks tsc --noEmit` to verify no TypeScript compilation errors.

## 5. Update Documentation

- [ ] Add a section to `packages/ui-hooks/README.md` titled **"HITL Gate Store"** documenting the state machine diagram (mermaid), exported types, and hook usage example.
- [ ] Update the Phase 11 agent memory file `docs/agent_memory/phase_11_decisions.md` with: "HITL gate state is managed in `@devs/ui-hooks` Zustand store. BLOCKING gates halt agent progress via `HITL_GATE_OPEN` postMessage. ADVISORY gates are log-only."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/ui-hooks test --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm the coverage threshold is met.
- [ ] Run `pnpm --filter @devs/ui-hooks tsc --noEmit` and assert exit code 0.
- [ ] Execute `grep -r "HITL_GATE_OPEN" packages/vscode/src/webview/messageHandler.ts` and assert the case is present.

# Task: HITL Gate Status Indicators & Hard-Redirect Routing (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [1_PRD-REQ-INT-010], [4_USER_FEATURES-REQ-009]

## 1. Initial Test Written
- [ ] In `packages/webview/src/components/hitl/__tests__/HitlGateStatusIndicator.test.tsx`, write tests for `<HitlGateStatusIndicator>`:
  - When `status="PENDING"`, renders a `data-testid="gate-status-pending"` element with text "Approval Required" and codicon `$(warning)`.
  - When `status="APPROVED"`, renders `data-testid="gate-status-approved"` with text "Approved" and codicon `$(check)`.
  - When `status="REJECTED"`, renders `data-testid="gate-status-rejected"` with text "Rejected" and codicon `$(x)`.
  - The `PENDING` indicator pulses with a CSS animation class `gate-status--pulsing` applied (assert className includes this class).
  - The indicator announces status changes via an `aria-live="polite"` region.
- [ ] In `packages/webview/src/routing/__tests__/ViewRouter.test.tsx`, write unit tests for the HITL gate hard-redirect logic in `ViewRouter`:
  - When the Zustand store has `pendingGateId` set (non-null), navigating to any route other than `HITL_GATE` triggers an immediate redirect to `HITL_GATE`.
  - When `pendingGateId` is null, all routes navigate freely.
  - The redirect fires synchronously on route-change attempt (not after render).
  - After gate resolution (pendingGateId becomes null), the router restores the previously intended route.
- [ ] In `packages/webview/src/store/__tests__/uiStore.hitl.test.ts`, write Zustand store tests:
  - Initial state: `pendingGateId: null`.
  - `setpendingGateId(gateId)` sets `pendingGateId` to the provided value.
  - `clearPendingGateId()` sets `pendingGateId` to null.
  - Subscribing to `pendingGateId` triggers listener on change from null → value.

## 2. Task Implementation
- [ ] Create `packages/webview/src/components/hitl/HitlGateStatusIndicator.tsx`:
  - Props: `status: 'PENDING' | 'APPROVED' | 'REJECTED'`.
  - Map status to codicon and label:
    - `PENDING` → `$(warning)` "Approval Required"
    - `APPROVED` → `$(check)` "Approved"
    - `REJECTED` → `$(x)` "Rejected"
  - Apply `gate-status--pulsing` CSS animation class when `status === 'PENDING'`:
    ```css
    @keyframes gate-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
    .gate-status--pulsing { animation: gate-pulse 2000ms ease-in-out infinite; }
    ```
    (Animation timing 2000ms per `7_UI_UX_DESIGN-REQ-UI-DES-051-2`.)
  - Render an `aria-live="polite"` `<span>` containing the status label for screen reader annunciation.
  - Use VSCode color tokens: `PENDING` → `var(--vscode-statusBarItem-warningForeground)`, `APPROVED` → `var(--vscode-terminal-ansiGreen)`, `REJECTED` → `var(--vscode-statusBarItem-errorForeground)`.
- [ ] Extend the Zustand UI store (`packages/webview/src/store/uiStore.ts`) with:
  - `pendingGateId: string | null` (initial: `null`).
  - `setPendingGateId(gateId: string | null): void` action.
  - `_intendedRoute: string | null` (internal, for route restoration).
- [ ] Update `packages/webview/src/routing/ViewRouter.tsx` to implement hard-redirect gate logic:
  - In the router's route-change handler, check `useUiStore(state => state.pendingGateId)`.
  - If non-null and the target route is not `'HITL_GATE'`, store the intended route in `_intendedRoute` and immediately navigate to `'HITL_GATE'`.
  - Export a `useGateRedirect()` hook that encapsulates this logic for reuse.
  - After `pendingGateId` becomes null, read `_intendedRoute` and navigate to it (then clear `_intendedRoute`).
- [ ] Wire the webview's `onmessage` handler (in `packages/webview/src/main.tsx`) to call `setPendingGateId(gateId)` when a `{ command: 'hitlGateRequested', gateId }` message arrives from the extension host.
- [ ] Wire `setPendingGateId(null)` when `{ command: 'gateResolved' }` message arrives.

## 3. Code Review
- [ ] Verify the hard-redirect check occurs on every route-change attempt — not only on initial mount.
- [ ] Verify `_intendedRoute` is never exposed as a public store action (prefixed with `_` and omitted from exported types).
- [ ] Verify the `gate-pulse` animation uses `opacity` (not `transform` or `box-shadow`) per the attention pulse visual spec (`7_UI_UX_DESIGN-REQ-UI-DES-051-1`), and animation duration is exactly 2000ms.
- [ ] Verify the `aria-live="polite"` region updates only on `status` changes (not on every render) using `usePrevious` or a ref comparison.
- [ ] Verify the webview message handler uses a `switch (command)` dispatch (not if/else chains) for maintainability.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern="HitlGateStatusIndicator|ViewRouter|uiStore.hitl"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview build` and assert no TypeScript errors.

## 5. Update Documentation
- [ ] Add a `## HITL Gate Routing & Status` section to `packages/webview/src/routing/README.md`:
  - Document the hard-redirect guard logic and `pendingGateId` state.
  - Document the route restoration behaviour after gate resolution.
- [ ] Update `docs/agent-memory/architecture-decisions.md`:
  ```
  ## [ADR-HITL-007] HITL Gate Hard-Redirect Routing
  - Any route change while pendingGateId is set is intercepted and redirected to HITL_GATE.
  - The intended route is stored in _intendedRoute (private Zustand field) for restoration.
  - Gate status indicators use 2000ms opacity-based pulse animation (gate-pulse keyframes).
  - aria-live="polite" annunciates status changes without disrupting user focus.
  ```

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview test -- --ci --testPathPattern="HitlGateStatusIndicator|ViewRouter|uiStore.hitl"` and assert exit code `0`.
- [ ] Run `grep -n "pendingGateId" packages/webview/src/store/uiStore.ts` to confirm the field and actions are present.
- [ ] Run `grep -n "HITL_GATE" packages/webview/src/routing/ViewRouter.tsx` to confirm the redirect route is referenced.
- [ ] Run `pnpm --filter @devs/webview build` and assert exit code `0`.

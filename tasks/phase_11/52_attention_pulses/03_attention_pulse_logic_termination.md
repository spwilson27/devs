# Task: Implement Attention Pulse Logic (Termination) (Sub-Epic: 52_Attention_Pulses)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-053-3]

## 1. Initial Test Written
- [ ] Create unit tests for the pulse logic hook and store at packages/ui/src/hooks/__tests__/useAttentionPulse.test.ts and packages/ui/src/state/__tests__/attentionPulseSlice.test.ts using Jest.
  - [ ] Test: use fake timers (jest.useFakeTimers()) to assert that startPulse() sets isPulsing=true and automatically reverts to false after durationMs (default 2000ms).
  - [ ] Test: calling stopPulse() before duration cancels the pending timeout and sets isPulsing=false immediately.
  - [ ] Test: retriggering startPulse() while a pulse is active resets the timeout (i.e., the pulse extends rather than stacking timeouts).
  - [ ] Test: cleanup on unmount / store disposal clears any timers to avoid memory leaks.
  - [ ] Integration test: startPulseFor(id) via the Zustand slice results in the specific component receiving the pulse class and that it is removed after the duration.

Write these tests first so they fail.

## 2. Task Implementation
- [ ] Implement a small, well-tested hook `useAttentionPulse` at packages/ui/src/hooks/useAttentionPulse.ts with this API:
  - function useAttentionPulse(options?: { defaultDurationMs?: number }) => { isPulsing: boolean; startPulse: (durationMs?: number) => void; stopPulse: () => void }.
  - Implementation details:
    - Internally store a ref to the timer id (NodeJS.Timeout | null).
    - startPulse(durationMs = defaultDurationMs) sets isPulsing=true, clears any existing timer, and starts a new setTimeout that sets isPulsing=false after durationMs.
    - stopPulse() clears timer and sets isPulsing=false.
    - useEffect cleanup must clear the timer on unmount.
    - Expose reset behavior when startPulse called repeatedly.

- [ ] Implement a global store slice (Zustand) `attentionPulseSlice` at packages/ui/src/state/attentionPulseSlice.ts with API:
  - startPulseFor(id: string, durationMs?: number)
  - stopPulseFor(id: string)
  - isPulsing(id: string) => boolean
  - Maintain internal Map<string, timeoutId> to track per-id timers and ensure cleanup.
  - Ensure store is serializable-friendly (do not persist timers across reloads; only persist isPulsing flags if required but timers are ephemeral).

- [ ] Wire the store into AttentionPulse and PhaseStepper components:
  - Components should subscribe to isPulsing(id) to add/remove pulsing class.
  - Avoid tight coupling: components should accept pulse controller props or read from store via hook.

- [ ] Defensive behavior:
  - If durationMs <= 0 or extremely large, clamp to safe bounds (100ms - 60000ms) and warn in dev only.
  - Use AbortController or explicit stopPulseFor to force termination when user navigates away.

## 3. Code Review
- [ ] Ensure timers are always cleared on unmount and on stop; verify no unhandled promise/timer leaks.
- [ ] Verify that multiple pulses for different IDs do not interfere (use Map keyed by ID).
- [ ] Verify that the API is simple, documented, and side-effect free (no DOM manipulation inside the store/hook).
- [ ] Confirm tests cover edge cases (rapid toggling, reentrancy, unmount during active timer).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for hook and store: `pnpm -w test --filter @devs/ui -- useAttentionPulse attentionPulseSlice` (or equivalent per repo test commands).
- [ ] Ensure coverage for timer-related code and cleanup logic.

## 5. Update Documentation
- [ ] Document the hook and store in docs/ui/hooks.md and docs/ui/state.md with code examples:
  - Example showing startPulseFor('step-42') then component reading isPulsing('step-42') to apply class.
  - Note the default duration and how to override it.
  - Mention bounds and reduced-motion considerations.

## 6. Automated Verification
- [ ] Add an automated script `scripts/verify-pulse-termination.js` that exercises the store API: starts a pulse for a test id, asserts via store subscription that isPulsing becomes true then false after the expected time; this script should run in CI as a quick smoke test (use jest with fake timers or run node with real timers and timeouts short-circuited in test mode).
- [ ] Add integration test that triggers startPulseFor from UI and uses Playwright to ensure the pulsing class is removed after the configured duration (visual or DOM assertion).

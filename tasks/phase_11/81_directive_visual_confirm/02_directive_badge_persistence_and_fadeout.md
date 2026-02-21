# Task: Implement Directive Badge Persistence and Fade-Out Timer (Sub-Epic: 81_Directive_Visual_Confirm)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-054-2]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/hooks/useDirectiveBadge/useDirectiveBadge.test.ts`, write tests using Vitest with `vi.useFakeTimers()`:
  - **Initial state test**: Assert that `useDirectiveBadge()` returns `{ visible: false }` by default.
  - **Trigger test**: Call the returned `triggerBadge()` function and immediately assert `visible === true`.
  - **Persistence test**: After calling `triggerBadge()`, advance fake timers by 2999ms and assert `visible === true` (still visible).
  - **Fade-start test**: Advance fake timers to 3000ms and assert the hook returns `{ visible: true, fadingOut: true }` (fading started).
  - **Completion test**: Advance fake timers to 3500ms (3000ms + 500ms fade) and assert `visible === false` (badge unmounted).
  - **Re-trigger test**: Call `triggerBadge()` twice in succession (e.g., 100ms apart) and verify the timer resets — the badge remains visible for 3000ms from the second call.
  - **Cleanup test**: Unmount the hook consumer and assert no state-update warnings (timer properly cleared on unmount).
- [ ] All tests must fail before implementation begins.

## 2. Task Implementation
- [ ] Create the directory `packages/webview-ui/src/hooks/useDirectiveBadge/`.
- [ ] Create `useDirectiveBadge.ts`:
  ```ts
  import { useState, useRef, useCallback, useEffect } from 'react';

  const VISIBLE_DURATION_MS = 3000;
  const FADE_DURATION_MS = 500;

  export function useDirectiveBadge() {
    const [visible, setVisible] = useState(false);
    const [fadingOut, setFadingOut] = useState(false);
    const visibleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = useCallback(() => {
      if (visibleTimerRef.current) clearTimeout(visibleTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    }, []);

    const triggerBadge = useCallback(() => {
      clearTimers();
      setVisible(true);
      setFadingOut(false);
      visibleTimerRef.current = setTimeout(() => {
        setFadingOut(true);
        fadeTimerRef.current = setTimeout(() => {
          setVisible(false);
          setFadingOut(false);
        }, FADE_DURATION_MS);
      }, VISIBLE_DURATION_MS);
    }, [clearTimers]);

    useEffect(() => clearTimers, [clearTimers]);

    return { visible, fadingOut, triggerBadge };
  }
  ```
- [ ] Update `DirectiveConfirmationBadge.tsx` (from task 01) to accept an additional optional prop `fadingOut?: boolean`. When `fadingOut` is `true`, apply a CSS class `directive-badge--exit`:
  ```css
  .directive-badge--exit {
    animation: directive-badge-fade-out 500ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  @keyframes directive-badge-fade-out {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
  ```
- [ ] In the `ConsoleView` (or `DirectiveWhisperer` parent component), call `triggerBadge()` upon successful directive submission event. Pass `visible` and `fadingOut` from the hook to `<DirectiveConfirmationBadge />`.
- [ ] Export `useDirectiveBadge` from `packages/webview-ui/src/hooks/index.ts`.

## 3. Code Review
- [ ] Verify `VISIBLE_DURATION_MS = 3000` and `FADE_DURATION_MS = 500` are named constants, not magic numbers.
- [ ] Verify the re-trigger path clears existing timers before restarting (no duplicate timers).
- [ ] Verify `useEffect` cleanup returns the `clearTimers` function to prevent memory leaks on unmount.
- [ ] Verify the fade-out animation duration exactly matches `FADE_DURATION_MS` (500ms).
- [ ] Verify the fade-out CSS uses `opacity: 0` as the terminal state (matching REQ-UI-DES-054-2 specification).
- [ ] Confirm the badge component correctly composes `directive-badge--enter` and `directive-badge--exit` classes and does not apply them simultaneously.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="useDirectiveBadge"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="DirectiveConfirmationBadge"` to confirm badge component tests still pass with the updated `fadingOut` prop.
- [ ] Run the full webview-ui test suite: `pnpm --filter @devs/webview-ui test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/webview-ui/src/hooks/useDirectiveBadge/useDirectiveBadge.agent.md` with:
  - Hook purpose: manages the three-phase lifecycle (visible → fadingOut → hidden) of the `DirectiveConfirmationBadge`.
  - Timing constants: `VISIBLE_DURATION_MS = 3000`, `FADE_DURATION_MS = 500`.
  - Return value API: `{ visible: boolean, fadingOut: boolean, triggerBadge: () => void }`.
  - Re-trigger behavior: calling `triggerBadge()` while badge is active resets the 3000ms timer.
  - Covered requirements: `7_UI_UX_DESIGN-REQ-UI-DES-054-2`.
- [ ] Update `packages/webview-ui/src/hooks/index.ts` export list.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --reporter=json --outputFile=test-results/directive-badge-persistence.json` and assert zero failed tests for `useDirectiveBadge`.
- [ ] Run `pnpm --filter @devs/webview-ui build` to confirm TypeScript compilation succeeds.

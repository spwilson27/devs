# Task: Implement Scroll-Lock Behavior for Streaming Logs (Sub-Epic: 60_Log_UI_Presentation)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-RISK-006]

## 1. Initial Test Written
- [ ] Write unit and integration tests BEFORE implementation at src/components/LogWindow/__tests__/scrollLock.test.ts and src/components/LogWindow/__tests__/scrollLock.integration.test.tsx that assert correct scroll-lock semantics:
  - Unit test "isNearBottom detects bottom threshold": validate helper isNearBottom(scrollTop, scrollHeight, clientHeight, threshold=50) returns true when within threshold and false when scrolled up.
  - Integration test "user scrolls up disables auto-scroll": render LogWindow with a stream generator that appends lines while the user programmatically sets scrollTop away from the bottom; assert that after appending new lines the visible scrollTop does not change (i.e., auto-scroll is disabled).
  - Integration test "when at bottom new logs auto-scroll": ensure when initial scroll position is at bottom, appending new logs advances scrollTop to the newest content.
  - Test "manual scroll-to-bottom re-enables auto-scroll": simulate user clicking a data-testid="log-scroll-to-bottom" button and assert subsequent appends auto-scroll.

## 2. Task Implementation
- [ ] Implement scroll-lock logic at src/components/LogWindow/scrollLock.ts and integrate into LogWindow.tsx:
  - Export function isNearBottom(scrollTop:number, scrollHeight:number, clientHeight:number, threshold=50): boolean.
  - In LogWindow component, maintain state: const [autoScroll, setAutoScroll] = useState(true). Attach a debounced scroll handler (100ms) that sets autoScroll = isNearBottom(...).
  - When new logs arrive, if autoScroll is true, call containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'auto' }) inside requestAnimationFrame; if false, preserve scrollTop and show a small unobtrusive "N new lines" toast with a data-testid="log-new-lines-toast" and a "Scroll to bottom" button (data-testid="log-scroll-to-bottom").
  - Expose a user-togglable lock UI control (data-testid="log-scroll-lock-toggle") that forces lock/unlock state and persists preference in UI state.
  - Ensure event listeners are properly cleaned up on unmount and that scroll handler is passive where possible to avoid layout jank.

## 3. Code Review
- [ ] Verify:
  - Scroll logic uses requestAnimationFrame for scroll calls and is debounced to avoid thrashing.
  - No forced synchronous layout reads are performed repeatedly; avoid reading scrollHeight frequently without caching.
  - Accessibility: the "new lines" toast is announced via aria-live="polite"; the scroll-to-bottom control is reachable by keyboard.
  - Tests cover race conditions where many logs arrive while user is interacting.

## 4. Run Automated Tests to Verify
- [ ] Run the scrollLock unit and integration tests: npm run test -- --testPathPattern=scrollLock --runInBand. For emulated streaming scenarios use jest fake timers or a headless browser test with Playwright that appends logs and validates scroll behavior.

## 5. Update Documentation
- [ ] Document the scroll-lock behavior in src/components/LogWindow/README.md, explain the default threshold (50px), describe the UI controls and persisted preference key `ui.logScrollLock`, and map this to requirement 7_UI_UX_DESIGN-REQ-UI-RISK-006 in tasks/phase_11/60_log_ui_presentation/.

## 6. Automated Verification
- [ ] Provide a reproducible verification script (example: scripts/verify-scroll-lock.sh) that mounts the webview component in a headless browser, simulates appending 1000 lines, records scrollTop before/after when user scrolls up and at bottom, and exits non-zero on assertion failures; wire this into CI as a smoke check for streaming regressions.
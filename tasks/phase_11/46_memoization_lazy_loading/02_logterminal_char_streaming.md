# Task: Implement LogTerminal optimized for character-level streaming (Sub-Epic: 46_Memoization_Lazy_Loading)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-068-1], [7_UI_UX_DESIGN-REQ-UI-DES-068]

## 1. Initial Test Written
- [ ] Create unit and integration tests under packages/webview/src/components/__tests__/LogTerminal.test.tsx that prove character-level incoming data only causes LogTerminal to update and does NOT cause sibling components (e.g., ThoughtStreamer, Header) to re-render.
  - Use Jest + React Testing Library with a small mock Zustand store.
  - Implement a mock stream emitter that pushes characters into the store one-by-one and use jest.fn spies or render counters to assert render counts:
    - Mount App containing both <LogTerminal/> and a sibling <Dummy/> that reads an unrelated selector.
    - Stream 50 chars; assert LogTerminal render count increases but Dummy render count remains unchanged.
  - Add a test verifying that flushing a completed chunk triggers ThoughtStreamer to append a new entry (but ThoughtStreamer must not re-render per-character).

## 2. Task Implementation
- [ ] Implement LogTerminal component in packages/webview/src/components/LogTerminal/LogTerminal.tsx with the following behavior:
  - Export default React.memo(LogTerminal) to prevent unnecessary re-renders from parent props changes.
  - Subscribe to the store using useMemoizedSelector(s => s.streamBuffers[activeId]) so the component only reads its stream buffer.
  - Internally buffer incoming characters in a useRef string buffer and batch visible updates using requestAnimationFrame or setTimeout with a 16ms frame budget to avoid one-render-per-character.
    - Pseudocode:
      - const bufferRef = useRef('');
      - useEffect(() => { subscribeToStream((char) => { bufferRef.current += char; scheduleFlush(); }); }, []);
      - function scheduleFlush() { if (scheduled) return; scheduled = requestAnimationFrame(() => { setDisplayText(prev => prev + bufferRef.current); bufferRef.current = '' }); }
  - Provide an API prop to control flush frequency for tests.
  - Implement efficient auto-scroll behavior that does not reflow unrelated DOM.
- [ ] Ensure the component avoids creating new object identities each render (no inline object props passed to child components); use useCallback/useMemo where appropriate.

## 3. Code Review
- [ ] Confirm LogTerminal is React.memo'd and uses minimal props.
- [ ] Confirm buffering uses requestAnimationFrame or setTimeout and that flush frequency is configurable.
- [ ] Confirm no synchronous heavy DOM operations (e.g., measuring layout) during per-char updates.
- [ ] Verify accessibility: aria-live should be used only for finalized lines (not for every char).

## 4. Run Automated Tests to Verify
- [ ] Run the unit tests for LogTerminal: pnpm -w test --filter packages/webview or npm --workspace packages/webview test and ensure LogTerminal tests pass.
- [ ] Run integration test that mounts App and asserts render counts.

## 5. Update Documentation
- [ ] Add component docs at packages/webview/src/components/LogTerminal/README.md describing the buffering strategy, flush frequency, and recommended consumer patterns.
- [ ] Add a developer note in CONTRIBUTING.md describing how to test streaming behavior locally using the mock emitter.

## 6. Automated Verification
- [ ] Add the LogTerminal render-count test to CI; the test must fail if a sibling component renders during a char-stream stress test.
- [ ] Add a small dev-mode instrumentation flag (window.__DEVS_RENDER_COUNTS__) that can be used by E2E tests to assert per-component render counts.
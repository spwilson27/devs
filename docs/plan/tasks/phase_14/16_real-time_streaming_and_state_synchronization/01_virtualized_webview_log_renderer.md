# Task: Implement Virtualized Log Stream Renderer in VSCode Webview (Sub-Epic: 16_Real-Time Streaming and State Synchronization)

## Covered Requirements
- [9_ROADMAP-REQ-036]

## 1. Initial Test Written
- [ ] Create `src/webview/__tests__/logStreamRenderer.test.ts`.
- [ ] Write a unit test using `@testing-library/dom` (or a JSDOM environment) that simulates 500 rapid log-append messages dispatched within 100ms and asserts that the renderer does not enqueue more than one pending animation frame at a time (i.e., the `rafScheduled` flag is `true` at most once between frames).
- [ ] Write a performance benchmark test (using `performance.now()`) that replays a fixture of 1,000 log lines injected at ≥60 messages/second and asserts that the measured throughput causes zero dropped frames (frame budget ≤ 16.67ms per frame as measured by a mock `requestAnimationFrame` scheduler).
- [ ] Write an integration test that mounts the Webview HTML panel, sends 300 log events via `postMessage`, and asserts that only the visible viewport rows (configurable, e.g. 50) are present in the DOM, confirming virtualization.
- [ ] Write a regression test asserting that secret placeholder tokens (`[REDACTED]`) are never replaced with raw values during render.

## 2. Task Implementation
- [ ] In `src/webview/logStreamRenderer.ts`, implement a `LogStreamRenderer` class that:
  - Maintains an in-memory circular buffer (`LogRingBuffer`) capped at 10,000 entries to prevent unbounded memory growth.
  - Exposes an `append(entry: LogEntry)` method that pushes to the ring buffer and schedules a render via `requestAnimationFrame` only if one is not already pending (`rafScheduled` guard flag).
  - Implements a `render()` method called inside the RAF callback that performs a **windowed virtual render**: calculates the visible row range based on `scrollTop` and `itemHeight`, and only creates/updates DOM nodes for rows within `[visibleStart - overscan, visibleEnd + overscan]` (overscan = 5 rows). Rows outside this range are detached from the DOM.
  - Maintains a `totalHeight` spacer element to preserve scrollbar fidelity for the full log length.
- [ ] In `src/webview/index.ts`, wire up the Webview `message` event listener to call `renderer.append()` for every `type: 'log'` message from the extension host.
- [ ] In `src/extension/logStreamer.ts`, implement a `LogStreamer` class that:
  - Subscribes to the Gemini 3 Flash streaming response via the existing `GeminiClient.streamChat()` method.
  - Batches incoming stream chunks using a `setInterval` flush at 16ms intervals (≈60Hz) instead of forwarding each chunk immediately, to prevent VSCode `postMessage` backpressure.
  - Posts the batched chunk array as a single `{ type: 'log', entries: LogEntry[] }` message to the Webview panel.
- [ ] Define `LogEntry` interface in `src/types/logEntry.ts`: `{ id: string; timestamp: number; level: 'info' | 'warn' | 'error' | 'debug'; message: string; source: string }`.
- [ ] Ensure all raw text content is HTML-escaped via a `escapeHtml(s: string): string` utility before insertion into DOM `textContent` (use `textContent`, not `innerHTML`).

## 3. Code Review
- [ ] Verify that the RAF guard flag (`rafScheduled`) is reset to `false` at the end of every `render()` call, including in error paths (wrap in try/finally).
- [ ] Confirm `LogRingBuffer` correctly overwrites oldest entries when capacity is reached and that the `totalHeight` spacer updates correctly.
- [ ] Verify no `innerHTML` assignments exist in `logStreamRenderer.ts`; all DOM mutations must use `textContent`, `createElement`, and `appendChild`/`removeChild`.
- [ ] Confirm the 16ms batch flush interval in `LogStreamer` is cleared on `dispose()` to prevent leaks.
- [ ] Verify the `[REDACTED]` token is preserved intact through the ring buffer → render pipeline (no string transformations that could unescape it).
- [ ] Check TypeScript strict-mode compliance: no `any` types, all array accesses guarded, no non-null assertion operators without justification.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=logStreamRenderer` and confirm all unit and integration tests pass with zero failures.
- [ ] Run the performance benchmark test and confirm the measured frames-per-second assertion passes (≥ 60 FPS equivalent throughput).
- [ ] Run `npm run lint` and confirm zero ESLint errors in the modified files.
- [ ] Run `npm run build` (TypeScript compilation) and confirm zero type errors.

## 5. Update Documentation
- [ ] Add a section to `docs/architecture/webview-streaming.md` describing the `LogStreamRenderer` virtualization approach, the ring buffer cap, the RAF batching pattern, and the 16ms flush interval design decision.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with the entry: "REQ-036: Webview log rendering uses RAF-gated virtual DOM windowing + 16ms extension-host batch flushing to sustain 60FPS."
- [ ] Add a `# [9_ROADMAP-REQ-036]` comment above the `LogStreamer` class definition in `src/extension/logStreamer.ts`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=logStreamRenderer --coverage` and assert that line coverage for `src/webview/logStreamRenderer.ts` is ≥ 90% as reported in the coverage summary.
- [ ] Execute `node scripts/validate-all.js` (the project's pre-existing validation script) and confirm it exits with code 0.
- [ ] Confirm that the CI pipeline (`.github/workflows/ci.yml`) test job passes when this branch is pushed, verifying no regressions in existing tests.

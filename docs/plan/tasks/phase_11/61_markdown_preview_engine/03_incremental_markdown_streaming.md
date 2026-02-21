# Task: Implement Incremental Markdown Streaming Pipeline (Sub-Epic: 61_Markdown_Preview_Engine)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-082]

## 1. Initial Test Written
- [ ] Create an integration test at `packages/ui/test/streaming/streaming.integration.test.ts` that simulates the SAOP ThoughtStream emitting multiple markdown fragments (3-10 chunks). The test should assert that each chunk becomes visible in the rendered `ThoughtStreamer` output within a short time window (e.g., <100ms per chunk under test conditions) and that no full DOM re-render occurs between chunks (use spies on render functions).

## 2. Task Implementation
- [ ] Implement an incremental consumption layer that subscribes to the SAOP stream (or emulated postMessage in webview) and translates ThoughtStream events into `appendChunk` calls on the `ThoughtStreamer`. Implement a small batching/throttling buffer (e.g., 50ms) to group micro-chunks and avoid per-character updates; provide cancellation token support so aborted streams do not leak memory. Ensure the pipeline delivers partial content to `ThoughtStreamer` as soon as a chunk boundary is available.

## 3. Code Review
- [ ] Ensure the pipeline uses clear separation of concerns (stream consumer, chunk parser, UI adapter), validates and normalizes chunk boundaries, and adds telemetry hooks for chunk latency. Verify cancellation and backpressure behavior is correct and memory usage is bounded.

## 4. Run Automated Tests to Verify
- [ ] Run `yarn test packages/ui -- streaming.integration.test.ts` and ensure the simulated SAOP stream test asserts timely chunk delivery and no full-tree re-renders.

## 5. Update Documentation
- [ ] Document the streaming contract in `packages/ui/docs/streaming.md`: message envelope format, expected chunk boundaries, throttling defaults, and how to instrument latency telemetry.

## 6. Automated Verification
- [ ] Add an automated integration check that replays a recorded SAOP session and validates that rendered HTML at each recorded timestamp matches the golden snapshots stored under `packages/ui/test/fixtures/streaming/`.

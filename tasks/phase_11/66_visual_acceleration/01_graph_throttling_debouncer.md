# Task: Implement Graph Throttling Debouncer (Sub-Epic: 66_Visual_Acceleration)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-095]

## 1. Initial Test Written
- [ ] Add a unit test that proves the debouncer batches rapid graph update events and emits them at most once per 32ms default interval. Create test file: webview/src/utils/graphThrottler.spec.ts. Use the repo test framework (Jest or Vitest)—configure fake timers (jest.useFakeTimers or vi.useFakeTimers). Test steps:
  - Import { createGraphThrottler } from 'webview/src/utils/graphThrottler'.
  - Create a mock callback: const cb = jest.fn() (or vi.fn()).
  - Instantiate throttler = createGraphThrottler({ onFlush: cb, intervalMs: 32 }).
  - Rapidly call throttler.enqueue({ id: i }) 100 times within the same tick.
  - Advance timers by 31ms and assert cb not called; advance to 32ms and assert cb called exactly once with a batched array of 100 updates (or aggregated payload).
  - Test flush behavior: call throttler.flush() and assert cb called immediately with pending items.

## 2. Task Implementation
- [ ] Implement webview/src/utils/graphThrottler.ts exporting createGraphThrottler(options) with the following behavior and API:
  - API: createGraphThrottler({ intervalMs = 32, onFlush: (items) => void, useRaf = true }) returns { enqueue(item), flush(), dispose() }.
  - Implementation must batch incoming items in an internal array and schedule a single flush per interval using requestAnimationFrame when useRaf && window.requestAnimationFrame is available, otherwise use setTimeout.
  - Default interval must be 32ms (configurable), and flush must transfer a shallow copy of the batch to onFlush and then clear internal buffer.
  - Ensure memory-safety: implement dispose() to clear timers and drop references.
  - Add TypeScript types and export for tests and other modules to import.

## 3. Code Review
- [ ] Verify the implementation uses a configurable default interval of 32ms, prefers requestAnimationFrame when available, correctly batches and flushes items, and that dispose() cleans timers and listeners. Confirm no synchronous heavy work occurs in enqueue() and that batch payloads are immutable copies when delivered to onFlush.

## 4. Run Automated Tests to Verify
- [ ] Run the repository test runner (npm test / pnpm test). Then run the single test file (example: npx jest webview/src/utils/graphThrottler.spec.ts or npx vitest run webview/src/utils/graphThrottler.spec.ts). Ensure the test passes reliably under fake timers and CI-like environment (use --runInBand if flaky).

## 5. Update Documentation
- [ ] Add a short doc at docs/ui/graph-throttler.md describing the API, default interval, and recommended usage from DAGCanvas and worker message handlers; add a note linking this code to requirement 6_UI_UX_ARCH-REQ-095.

## 6. Automated Verification
- [ ] Add a one-line npm script in package.json (scripts: { "verify:graph-throttler": "node scripts/verify-graph-throttler.js" }) that runs a small Node script which imports the implementation, simulates 1000 enqueues, waits 100ms, and exits with code 0 if callbacks observed match expected batch counts; as a minimum, automated verification is running the unit test file and asserting exit code 0.
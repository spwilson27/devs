# Task: Accessibility: Buffering/Debounce for Announcements (Sub-Epic: 58_Thought_Connectivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-099]

## 1. Initial Test Written
- [ ] Add unit tests for the debouncing/buffering utility that controls announcements.
  - File: `src/ui/utils/__tests__/liveAnnouncer.test.ts`
  - Test cases:
    1. Rapidly call `announce('A')` 10 times in <200ms; assert the underlying DOM live-region is updated at most once per configured interval (default 300ms).
    2. Verify that high-priority announcements (if supported) bypass the buffer when flagged.
  - Use `jest.useFakeTimers()` to simulate elapsed time.
  - Run: `pnpm test -- src/ui/utils/__tests__/liveAnnouncer.test.ts`.

## 2. Task Implementation
- [ ] Implement a `liveAnnouncer` utility and integrate with `ThoughtStreamer`.
  - File: `src/ui/utils/liveAnnouncer.ts`
  - API: `announce(text: string, opts?: { priority?: 'low'|'normal'|'high' }): void`
  - Behavior:
    1. Batch announcements into a short buffer and flush no more frequently than `ANNOUNCE_INTERVAL_MS` (default: 300ms).
    2. Provide a `high` priority path that flushes immediately.
    3. Export configuration for tests: `setAnnounceInterval(ms)` and `resetAnnouncer()`.
  - Integrate in `ThoughtStreamer`: call `announce(summary, { priority: 'normal' })` when a new top-level thought arrives.

## 3. Code Review
- [ ] Verify:
  - Timers are cleared on unmount and no memory leaks.
  - Configuration is injectable for tests and CI.
  - Behavior respects `prefers-reduced-motion` and developer-configured rate limits.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: `pnpm test -- src/ui/utils/__tests__/liveAnnouncer.test.ts`.

## 5. Update Documentation
- [ ] Document `src/ui/utils/liveAnnouncer.ts` API in `docs/ui/accessibility.md` and show examples to tune `ANNOUNCE_INTERVAL_MS`.

## 6. Automated Verification
- [ ] Add a CI smoke test that simulates a high-throughput thought stream and asserts the live-region updates no more than N times per second (configurable), failing the PR if exceeded.
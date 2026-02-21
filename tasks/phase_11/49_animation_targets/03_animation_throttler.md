# Task: Implement Animation Throttler (risk mitigation) (Sub-Epic: 49_Animation_Targets)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-RISK-004]

## 1. Initial Test Written
- [ ] Write unit tests for a Throttler module at packages/webview/src/lib/animation/throttler.test.ts. The first tests must:
  - instantiate the throttler with a configurable frameBudgetMs (default 16.66),
  - push a high number of synthetic update tasks (e.g., 200 small tasks) into the throttler in a tight loop,
  - mock performance.now to simulate realistic frame timing and control advancement,
  - verify that the throttler processes only as many tasks per frame as allowed by the budget and carries remaining tasks to subsequent frames,
  - verify that low-priority tasks can be dropped when the queue exceeds a configured maxQueueDepth (configurable behavior documented).

## 2. Task Implementation
- [ ] Implement packages/webview/src/lib/animation/throttler.ts with the following behavior and API:
  - export createThrottler(config?: { frameBudgetMs?: number, maxQueueDepth?: number, dropLowPriority?: boolean }) => { enqueue(task: ()=>void, priority?: number): void, start(): void, stop(): void };
  - internally use the FrameOrchestrator (orchestrator.schedule) to drive per-frame execution; on each frame process queued tasks until (performance.now() - frameStart) >= frameBudgetMs, then pause and continue remaining tasks on the next frame,
  - implement a simple priority scheme: higher numeric priority runs earlier; when maxQueueDepth is exceeded and dropLowPriority is true, discard lowest-priority tasks first and increment a dropped counter for metrics,
  - expose hooks to observe queueDepth, processedCount, and droppedCount for monitoring (necessary for automated verification),
  - ensure minimal per-frame allocations (reuse arrays/objects) and safe error handling so one failed task does not starve other tasks.

## 3. Code Review
- [ ] Ensure the throttler integrates with the orchestrator (no independent RAF), uses time-budgeting rather than a fixed count-per-frame, respects maxQueueDepth config, has correct TypeScript types, and includes unit tests for corner cases (empty queue, extremely long-running tasks, task that enqueues new tasks while flushing).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: npm test (or the repository's test command). Include a stress test that enqueues 1000 tasks and asserts that (over simulated frames) the throttler kept queueDepth bounded and that droppedCount increments when configured to drop.

## 5. Update Documentation
- [ ] Document throttler configuration and runtime behavior in docs/ui/animation.md including recommended defaults (frameBudgetMs: 16.66, maxQueueDepth: 1000, dropLowPriority: true) and guidance for tuning.

## 6. Automated Verification
- [ ] Add an automated stress e2e that simulates high-frequency state updates routed to the throttler and verifies that FPS measured by the FrameMeter remains above a safe threshold (configurable; recommended assert >= 45 under extreme synthetic load) while dropped counters and queue metrics are reported. Fail the CI job on regression of droppedRate or sustained low FPS according to configured thresholds.
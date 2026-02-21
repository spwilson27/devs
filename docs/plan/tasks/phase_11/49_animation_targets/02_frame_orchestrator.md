# Task: Implement single-frame Animation Orchestrator (Sub-Epic: 49_Animation_Targets)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-059-1]

## 1. Initial Test Written
- [ ] Write unit tests for a FrameOrchestrator module at packages/webview/src/lib/animation/orchestrator.test.ts using the project's unit test framework (Jest/Vitest). The first tests should:
  - mock global.requestAnimationFrame and global.cancelAnimationFrame,
  - verify that scheduling multiple callbacks before the next RAF results in a single RAF callback (i.e., only one RAF loop is installed) and that all scheduled callbacks are executed exactly once during the next frame,
  - verify start/stop and idempotence of scheduling API.

Example unit test pseudocode:

```ts
// orchestrator.test.ts
import { createOrchestrator } from './orchestrator';

test('schedules multiple tasks with single RAF invocation', () => {
  const rafCalls: Function[] = [];
  // install test double for rAF
  (global as any).requestAnimationFrame = (cb: any) => { rafCalls.push(cb); return rafCalls.length; };
  (global as any).cancelAnimationFrame = () => {};

  const orchestrator = createOrchestrator();
  const spyA = jest.fn();
  const spyB = jest.fn();
  orchestrator.schedule(spyA);
  orchestrator.schedule(spyB);

  // drive the installed rAF
  const frameCb = rafCalls.shift() as Function;
  frameCb(performance.now());

  expect(spyA).toHaveBeenCalledTimes(1);
  expect(spyB).toHaveBeenCalledTimes(1);
});
```

## 2. Task Implementation
- [ ] Implement packages/webview/src/lib/animation/orchestrator.ts with a minimal, deterministic API: createOrchestrator(): { schedule(fn: ()=>void, priority?: number): void, start(): void, stop(): void }. Implementation details:
  - maintain a Set or priority queue of pending callbacks (use a small integer priority scheme),
  - ensure only a single requestAnimationFrame is active while the queue is non-empty,
  - on RAF tick, flush the pending callbacks into a local array and execute them, catching errors to avoid dropping the RAF loop,
  - measure frame start time via performance.now and incorporate a per-frame budget check (16.66ms target). If executing callbacks would exceed the budget, yield remaining callbacks to the next frame (tie into the throttler task described elsewhere),
  - export TypeScript types and small README comment block.

## 3. Code Review
- [ ] Confirm the orchestrator enforces a single RAF handle, uses Set/array reuse to prevent allocations, includes safety around exceptions (errors in a callback do not prevent next frame), and exposes a clear API for scheduling and cancelling.
- [ ] Confirm unit tests mock rAF properly and test edge cases (multiple schedule calls, schedule during flush, schedule after stop).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: npm test or the repository's test command; ensure orchestrator unit tests pass and that coverage includes the orchestrator module.

## 5. Update Documentation
- [ ] Update docs/ui/animation.md with the orchestrator API, usage examples (scheduling UI updates), and notes about frame budget (16.66ms target for 60FPS).

## 6. Automated Verification
- [ ] Add a unit-level contract test that instantiates the orchestrator with a mocked high-throughput workload and verifies that the orchestrator never installs more than one RAF handle per webview root and that frames processed obey the 16.66ms budget (use timestamps in the test to validate budgeting behavior).
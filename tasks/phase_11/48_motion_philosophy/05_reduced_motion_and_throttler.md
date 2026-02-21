# Task: Implement Reduced-Motion Support and Animation Throttler (Sub-Epic: 48_Motion_Philosophy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-006-1], [7_UI_UX_DESIGN-REQ-UI-DES-050]

## 1. Initial Test Written
- [ ] Add unit tests for a new hook and throttler:
  - packages/ui-hooks/src/__tests__/useReducedMotion.test.ts: mock window.matchMedia('(prefers-reduced-motion: reduce)') and assert hook returns true/false correctly.
  - packages/ui-hooks/src/__tests__/animationThrottler.test.ts: assert that AnimationThrottler limits callbacks to ~60fps under normal conditions, and reduces to 15fps when battery saver flag is simulated.

Test details:
1. Use Jest timers or fake RAF to simulate frames and measure callback invocation counts in a 1000ms window.
2. Confirm behavior toggles when a "battery saver" signal is provided via a small injectable adapter (function parameter or context).

## 2. Task Implementation
- [ ] Implement hook packages/ui-hooks/src/useReducedMotion.ts:
  - Expose function useReducedMotion(): boolean which uses matchMedia and a fallback to a provided context override.
- [ ] Implement AnimationThrottler service packages/ui-hooks/src/animationThrottler.ts:
  - API: start(callback), stop()
  - Under normal conditions target ~60fps; when battery saver is enabled target ~15fps.
  - Should expose setBatterySaver(enabled: boolean) for tests and runtime adaption.
  - Should be usable by heavy visual components (DAGCanvas) to schedule updates without exceeding target frame rate.

Implementation steps:
1. Create useReducedMotion.ts using window.matchMedia and a cleanup listener.
2. Create animationThrottler.ts that uses requestAnimationFrame or setTimeout fallback and accepts dynamic FPS target.
3. Export both from packages/ui-hooks/index.ts.

## 3. Code Review
- [ ] Verify the hook uses proper cleanup (remove matchMedia listener), does not throw in SSR (guard window), and throttler is deterministic and testable.
- [ ] Verify no direct coupling to UI rendering code (throttler must be framework-agnostic).

## 4. Run Automated Tests to Verify
- [ ] Run: pnpm --filter @devs/ui-hooks test and confirm both tests pass.

## 5. Update Documentation
- [ ] Add documentation in packages/ui-hooks/README.md with examples of using useReducedMotion and the AnimationThrottler in heavy visual components (DAGCanvas), linking to requirement IDs.

## 6. Automated Verification
- [ ] Add a small verification script that runs the throttler in a headless Node environment and asserts callback count fits expected FPS bounds. CI should run this script.
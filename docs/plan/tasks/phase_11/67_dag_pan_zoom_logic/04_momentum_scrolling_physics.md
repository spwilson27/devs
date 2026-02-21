# Task: Implement Momentum (Inertia) Scrolling Physics for Pan Interactions (Sub-Epic: 67_DAG_Pan_Zoom_Logic)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-056-1], [6_UI_UX_ARCH-REQ-023]

## 1. Initial Test Written
- [ ] Add unit tests at `tests/unit/dag/panzoom/momentum.spec.ts` covering the physics model in isolation:
  - Given an initial velocity vector (vx, vy) and a friction coefficient `f` run the simulated ticks and assert the resulting position follows the expected analytical decay within tolerance.
  - Assert momentum stops when velocity magnitude falls below a configurable threshold.
  - Assert that momentum honors bounding constraints (if `fitBounds` prevents overscroll) and triggers clamped bounce behavior if applicable.

## 2. Task Implementation
- [ ] Implement `src/ui/dag/panzoom/momentum.ts`:
  - Export a deterministic physics stepper `stepMomentum(state, dt, config) -> {position, velocity, finished:boolean}` using an exponential decay model or critically-damped spring model (explicitly document formula chosen).
  - Integrate the stepper into `PanZoomController`: when pointer release occurs with velocity above threshold, start a requestAnimationFrame-driven loop that applies `stepMomentum` until `finished`.
  - Expose config to callers: `momentum: {enabled:boolean,friction:number,threshold:number,maxDurationMs:number}`.
  - Ensure the implementation is testable by injecting a mocked requestAnimationFrame or using a timeStep parameter for deterministic ticks.

## 3. Code Review
- [ ] Verify physics implementation is deterministic and parameterized for tuning by UX designers.
- [ ] Ensure numerical stability and no runaway values; include unit tests for edge cases (very high velocity, zero friction).
- [ ] Confirm momentum loop is cancellable (`stopMomentum()`), and that controller disposes of RAF handlers on unmount.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test -- tests/unit/dag/panzoom/momentum.spec.ts` and verify all physics tests pass.

## 5. Update Documentation
- [ ] Document the chosen physics model in `docs/ui/dag/panzoom.md` with formulas, tunable parameters, and recommended default values (e.g., friction:0.92, threshold:0.02, maxDurationMs:2000).

## 6. Automated Verification
- [ ] Add a deterministic smoke test `scripts/verify_momentum.js` that runs the stepper for common velocity seeds and asserts the final position/velocity values match recorded golden outputs; run in CI.
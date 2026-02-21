# Task: Implement Pan/Zoom Coordinate Math and Unit Tests (Sub-Epic: 67_DAG_Pan_Zoom_Logic)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-023]

## 1. Initial Test Written
- [ ] Create unit tests at `tests/unit/dag/panzoom/math.spec.ts`:
  - Test `worldToScreen({x,y}, transform)` and `screenToWorld({x,y}, transform)` are inverses within floating point tolerance (1e-3).
  - Test `composeTransform(a,b)` and `invertTransform(t)` produce correct results for chained zoom/pan operations.
  - Test scale clamping: applying zoom beyond `minScale`/`maxScale` clamps to allowed range.
  - Tests should be pure and not require DOM; place them in the unit test suite.

## 2. Task Implementation
- [ ] Implement `src/ui/dag/panzoom/math.ts`:
  - Export pure functions: `worldToScreen`, `screenToWorld`, `composeTransform`, `invertTransform`, `clampScale`.
  - Use stable numeric algorithms and include JSDoc/TSDoc for expected input/output ranges.
  - Add `transform` type: `{x:number,y:number,scale:number}` and include helper `identityTransform()`.

## 3. Code Review
- [ ] Validate numerical stability for repeated compositions; require tests that compose 1000 small transforms and verify no NaNs or infinities.
- [ ] Ensure functions are deterministic and free of side effects; prefer functional style.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test -- tests/unit/dag/panzoom/math.spec.ts` and ensure all assertions pass.

## 5. Update Documentation
- [ ] Add a section to `docs/ui/dag/panzoom.md` describing the coordinate system conventions (origin, units, pivot behavior) and examples showing usage of `worldToScreen` and `screenToWorld`.

## 6. Automated Verification
- [ ] Add a node script `scripts/simulate_transforms.js` that composes 10k random transforms and ensures no runtime errors and acceptable numeric ranges; run this as a CI job targeted at Pan/Zoom math.
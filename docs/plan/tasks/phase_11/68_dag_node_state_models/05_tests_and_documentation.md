# Task: Add comprehensive tests and documentation for DAG Node State Models (Sub-Epic: 68_DAG_Node_State_Models)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-092], [6_UI_UX_ARCH-REQ-022], [7_UI_UX_DESIGN-REQ-UI-DES-046-1], [7_UI_UX_DESIGN-REQ-UI-DES-046-2]

## 1. Initial Test Written
- [ ] Create a meta-test `tests/ui/dag/sub-epic.spec.ts` that will fail until the other tests exist. This test asserts presence of the following artifacts after other tasks run:
  - `src/ui/dag/model.ts` exports `parseTaskDag` and `TaskDagModel` type.
  - `src/ui/dag/DagNode.tsx` exists and exports `NODE_DIMENSIONS`.
  - `src/ui/dag/DAGCanvas.tsx` exists and accepts a `model` prop.
  - The fixtures in `tests/fixtures/dag/` exist (`minimal.json`, `full.json`).

## 2. Task Implementation
- [ ] Implement test harness and CI wiring:
  - Add or extend `package.json` scripts: `test:ui:dags` to run `jest -- tests/ui/dag`.
  - Ensure `jest` configuration includes TSX support and `@testing-library/jest-dom` is available.
  - Add a lightweight headless smoke runner script `scripts/dag_smoke.js` that executes the integration tests and exits non-zero on failures.

## 3. Code Review
- [ ] Verify:
  - Meta-test is focused and will only fail when required artifacts are missing.
  - Test suite is stable (no flaky timeouts) and CI script is documented in CONTRIBUTING or docs.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:ui:dags` and confirm all tests under `tests/ui/dag` pass. Fix flaky tests if any.

## 5. Update Documentation
- [ ] Update `docs/ui/README.md` (or create) to include a `DAG Node State Models` section that references:
  - `docs/ui/dag_model.md`, `docs/ui/dag_node.md`, `docs/ui/dag_node_states.md`, and `docs/ui/dag_integration.md`.
  - Show example commands (test scripts) and CI steps to run verification.

## 6. Automated Verification
- [ ] Add CI job step `verify-dag-sub-epic` that runs `npm run test:ui:dags` and `node scripts/dag_smoke.js`; ensure the job is required for merging PRs under this sub-epic.
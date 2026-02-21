# Task: Implement standardized UI Task DAG JSON model (Sub-Epic: 68_DAG_Node_State_Models)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-092]

## 1. Initial Test Written
- [ ] Create a unit test file at `tests/ui/dag/model.spec.ts` (Jest). Write the test first so it fails until implementation exists.
  - Provide three explicit JSON fixtures in `tests/fixtures/dag/`:
    - `minimal.json`: { "nodes": [{ "id": "n1", "type": "task", "label": "A", "state": "PENDING" }], "edges": [] }
    - `full.json`: multiple nodes with `state` values `PENDING|RUNNING|SUCCESS|FAILED|PAUSED` and edges with optional `weight`.
    - `invalid.json`: contains an extra top-level property `__invalid__`.
  - Tests to implement:
    1. `parseTaskDag(minimal.json)` returns a typed model with one node and zero edges.
    2. `parseTaskDag(full.json)` returns a model with nodes matching fixture ids and allowed state enum values.
    3. `parseTaskDag(invalid.json)` throws a validation error that includes the invalid property path.
    4. Round-trip: serializing the parsed model back to JSON matches the original (ignoring ordering).
  - Use explicit assertions (expect().toEqual / toThrow) and keep fixtures inline or loaded from fixtures directory.

## 2. Task Implementation
- [ ] Implement `src/ui/dag/model.ts` with the following:
  - Export TypeScript types: `TaskNode { id: string; type: string; label?: string; state: 'PENDING'|'RUNNING'|'SUCCESS'|'FAILED'|'PAUSED'; metadata?: Record<string, unknown> }`, `TaskEdge { from: string; to: string; label?: string; weight?: number }`, `TaskDagModel { nodes: TaskNode[]; edges: TaskEdge[] }`.
  - Implement a validation function `parseTaskDag(input: unknown): TaskDagModel` using a schema validator (prefer `zod` if available, else `ajv`). The function must:
    - Validate shape and types and coerce/normalize simple values only when safe.
    - Return the typed `TaskDagModel` on success or throw an `Error` with a human-readable message containing the validation path on failure.
  - Add small helper `isValidState(s: string): s is TaskNode['state']` to centralize allowed states.
  - Add exported sample fixture `src/ui/dag/sample.json` used by docs/tests.

## 3. Code Review
- [ ] Verify the implementation:
  - Types are exported and used in tests; no `any` leakage.
  - Validation produces clear error messages (path + reason).
  - Pure functions with no DOM or UI imports.
  - Implementation uses a single source of truth for allowed states (enum/type guard).
  - Tests cover positive/negative cases and serialization round-trip.

## 4. Run Automated Tests to Verify
- [ ] Run the test suite via `npm test` or `yarn test` and confirm:
  - Tests fail before implementation (test-first).
  - Tests pass after implementation.

## 5. Update Documentation
- [ ] Add `docs/ui/dag_model.md` documenting the JSON model:
  - Full schema listing, example payloads (minimal and full), and mapping to requirement `6_UI_UX_ARCH-REQ-092`.
  - Point to `src/ui/dag/model.ts` as the canonical source.

## 6. Automated Verification
- [ ] Add a small verification script `scripts/verify_dag_model.js` that imports `parseTaskDag`, loads `tests/fixtures/dag/*.json`, and exits non-zero on any validation error; wire this script into CI as a `verify-dag-model` job/step.
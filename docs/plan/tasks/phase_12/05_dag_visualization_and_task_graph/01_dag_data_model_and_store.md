# Task: DAG Data Model, TypeScript Types, and Zustand Store Slice (Sub-Epic: 05_DAG Visualization and Task Graph)

## Covered Requirements
- [1_PRD-REQ-UI-006]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/stores/__tests__/dagStore.test.ts`, write unit tests for a new Zustand store slice (`useDagStore`) covering:
  - Initial state shape: `{ nodes: [], edges: [], epics: [], selectedNodeId: null, criticalPath: [], filterQuery: '' }`.
  - `setNodes(nodes: UITaskNode[])` action replaces the nodes array immutably.
  - `setEdges(edges: UITaskEdge[])` action replaces the edges array immutably.
  - `setEpics(epics: UIEpic[])` action replaces the epics array immutably.
  - `selectNode(id: string | null)` action sets `selectedNodeId`.
  - `setCriticalPath(ids: string[])` action sets `criticalPath` as an array of node IDs.
  - `setFilterQuery(query: string)` action sets `filterQuery`.
  - `getFilteredNodes()` selector returns only nodes whose `id`, `title`, or `requirementIds` contain the `filterQuery` substring (case-insensitive); returns all nodes when `filterQuery` is empty.
- [ ] In `packages/webview-ui/src/models/__tests__/dagModel.test.ts`, write unit tests for the `UITaskDAGModel` type guard `isValidDagModel(payload: unknown): payload is UITaskDAGModel` verifying:
  - Returns `true` for a correctly shaped object.
  - Returns `false` for missing `nodes`, `edges`, or `epics` fields.
  - Returns `false` when `nodes` is not an array.

## 2. Task Implementation

- [ ] Create `packages/webview-ui/src/models/dagModel.ts` defining and exporting the following TypeScript interfaces:
  ```typescript
  export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'blocked' | 'failed';

  export interface UITaskNode {
    id: string;          // matches task ID from SQLite
    title: string;
    status: TaskStatus;
    epicId: string;
    requirementIds: string[];
    dependsOn: string[]; // IDs of prerequisite nodes
  }

  export interface UITaskEdge {
    id: string;          // e.g. `${sourceId}->${targetId}`
    source: string;
    target: string;
  }

  export interface UIEpic {
    id: string;
    name: string;
    taskIds: string[];
  }

  export interface UITaskDAGModel {
    nodes: UITaskNode[];
    edges: UITaskEdge[];
    epics: UIEpic[];
  }

  export function isValidDagModel(payload: unknown): payload is UITaskDAGModel;
  ```
- [ ] Implement `isValidDagModel` as a runtime type-guard checking for the presence of `nodes`, `edges`, and `epics` arrays.
- [ ] Create `packages/webview-ui/src/stores/dagStore.ts` as a Zustand slice (using `create` with immer middleware) exporting `useDagStore` with:
  - State fields: `nodes`, `edges`, `epics`, `selectedNodeId`, `criticalPath`, `filterQuery`.
  - Actions: `setNodes`, `setEdges`, `setEpics`, `selectNode`, `setCriticalPath`, `setFilterQuery`.
  - Selector: `getFilteredNodes` (derived via a `useShallow`-wrapped selector).
- [ ] Register the store in the existing Zustand store composition in `packages/webview-ui/src/stores/index.ts`.

## 3. Code Review

- [ ] Verify all exported types use `interface` (not `type` aliases) where object-shape clarity matters, per the project's TypeScript conventions.
- [ ] Confirm Zustand store uses immer middleware for immutable state updates, consistent with other store slices in the codebase.
- [ ] Ensure `isValidDagModel` does NOT use `as` casts internally; runtime checks only.
- [ ] Confirm the `filterQuery` selector is memoized to prevent unnecessary re-renders on every keystroke in components that only consume `getFilteredNodes`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="dagStore|dagModel"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/webview-ui tsc --noEmit` and confirm no TypeScript compilation errors are introduced.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/stores/dagStore.agent.md` documenting: purpose of the store, each state field, each action, and the `getFilteredNodes` selector contract.
- [ ] Create `packages/webview-ui/src/models/dagModel.agent.md` documenting: each interface field, the `TaskStatus` enum values and their meaning, and the `isValidDagModel` type guard contract.
- [ ] Update `packages/webview-ui/src/stores/index.agent.md` (or equivalent) to reference the new `useDagStore` slice.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test --coverage --testPathPattern="dagStore|dagModel"` and confirm code coverage ≥ 90% for `dagStore.ts` and `dagModel.ts`.
- [ ] Run `grep -r "UITaskDAGModel\|UITaskNode\|UITaskEdge\|UIEpic" packages/webview-ui/src/models/dagModel.ts` to confirm all four interfaces are exported.
- [ ] Confirm `pnpm --filter @devs/webview-ui build` exits with code 0.

# Task: Implement Dashboard Zustand Store (Sub-Epic: 44_Dashboard_Sidebar_Hub)

## Covered Requirements
- [1_PRD-REQ-INT-007], [4_USER_FEATURES-REQ-006]

## 1. Initial Test Written
- [ ] Create unit tests at packages/webview/src/store/__tests__/dashboardStore.test.ts that import the store factory and assert:
  - initial state shape: { activeEpic: null, progress: 0, taskTree: [], agents: [] }
  - actions exist: setActiveEpic, updateProgress, setTaskTree, setAgents and that calling them mutates the state as expected.
  - subscribe behavior: a subscriber receives updates after setActiveEpic is called.

## 2. Task Implementation
- [ ] Implement a typed store at packages/webview/src/store/dashboardStore.ts using zustand (or a thin alternative) with the following API and types:
  - interface DashboardState { activeEpic: Epic | null; progress: number; taskTree: TaskNode[]; agents: Agent[]; setActiveEpic(e: Epic): void; updateProgress(p: number): void; setTaskTree(nodes: TaskNode[]): void; setAgents(a: Agent[]): void }
  - Export createDashboardStore(initial?: Partial<DashboardState>) for testing and default export for runtime use.
- [ ] Ensure the store is platform-agnostic (no direct vscode API usage) and can be hydrated from an initial state payload passed from the extension host.

## 3. Code Review
- [ ] Verify types are exported and used by components; ensure no circular dependencies between store and UI components.
- [ ] Verify store methods are small and synchronous and that heavy computations are offloaded to selectors or derived memoized functions.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- packages/webview/src/store/__tests__/dashboardStore.test.ts` and ensure all assertions pass.

## 5. Update Documentation
- [ ] Update docs/state.md describing the DashboardState schema, events/messages that hydrate it, and recommended usage patterns for selectors and subscriptions.

## 6. Automated Verification
- [ ] Add a CI check that imports createDashboardStore and verifies default state keys exist and run the unit tests; fail CI if tests fail.

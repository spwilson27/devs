# Task: Real-time DAG State Updates via MCP Event Subscription (Sub-Epic: 05_DAG Visualization and Task Graph)

## Covered Requirements
- [1_PRD-REQ-UI-006]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/hooks/__tests__/useDagSubscription.test.ts`, write unit tests for the `useDagSubscription` hook:
  - On mount, subscribes to the MCP event topic `devs/dag/snapshot` and calls `useDagStore.setNodes`, `setEdges`, `setEpics` with the received payload.
  - On receiving a `devs/dag/nodeStatusUpdate` event with `{ taskId: string, status: TaskStatus }`, calls `useDagStore.setNodes` with an updated nodes array (only the changed node's status mutated).
  - On unmount, unsubscribes from both MCP topics (verifying the unsubscribe mock was called).
  - If the initial snapshot request fails, sets `dagSubscriptionError` state to the received error.
- [ ] In `packages/webview-ui/src/components/dag/__tests__/DAGView.integration.test.tsx`, write an integration test:
  - When `useDagSubscription` emits a `nodeStatusUpdate` for node ID `"task-5"` with `status: "done"`, the `DAGTaskNode` with `data-testid="dag-node-task-5"` updates its status badge within one render cycle.
  - When the MCP connection is lost (simulated by emitting a `devs/connection/disconnected` event), an error overlay with `data-testid="dag-disconnected-overlay"` is shown.

## 2. Task Implementation

- [ ] Create `packages/webview-ui/src/hooks/useDagSubscription.ts` — a custom hook:
  - On mount: sends a `devs/dag/subscribe` MCP request to receive the initial full DAG snapshot.
  - Parses the snapshot response with `isValidDagModel` (from `dagModel.ts`) and dispatches `setNodes`, `setEdges`, `setEpics`.
  - Registers a listener on the MCP event bus for:
    - `devs/dag/snapshot` — full DAG re-hydration (replaces all nodes/edges/epics).
    - `devs/dag/nodeStatusUpdate` — partial update; uses an immer-style updater to mutate only the matching node's `status` field in the store.
  - On unmount: sends `devs/dag/unsubscribe` and removes event listeners.
  - Exposes `{ isConnected: boolean; error: Error | null }` as return values.
- [ ] Create `packages/webview-ui/src/components/dag/DAGDisconnectedOverlay.tsx`:
  - A full-canvas overlay `<div data-testid="dag-disconnected-overlay">` displayed when `!isConnected`.
  - Shows icon (`$(debug-disconnect)` codicon), text `"DAG stream disconnected. Reconnecting…"`, and an animated spinner.
  - Styled: `position: absolute; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center;`.
- [ ] Create `packages/webview-ui/src/components/dag/DAGView.tsx` — the top-level DAG view page component that composes:
  ```tsx
  export function DAGView() {
    const { isConnected, error } = useDagSubscription();
    return (
      <div data-testid="dag-view" style={{ position: 'relative', width: '100%', height: '100%' }}>
        <DAGFilterBar />
        <CriticalPathToggle />
        <DAGCanvas />
        <TaskDetailCard />
        {!isConnected && <DAGDisconnectedOverlay />}
      </div>
    );
  }
  ```
- [ ] Register `DAGView` as the `ROADMAP` tab panel in the webview routing (replacing or mounting in the appropriate tab container).
- [ ] Ensure `nodeStatusUpdate` partial updates use the Zustand immer middleware `produce` pattern to update only the changed node, avoiding full array replacement:
  ```typescript
  setNodeStatus: (taskId: string, status: TaskStatus) =>
    set(produce(state => {
      const node = state.nodes.find(n => n.id === taskId);
      if (node) node.status = status;
    }))
  ```
  - Add `setNodeStatus` action to `dagStore.ts` and its test (reference task 01).

## 3. Code Review

- [ ] Verify `useDagSubscription` does NOT call `setNodes` with a full array clone on each `nodeStatusUpdate` — only the `setNodeStatus` (immer partial update) action should be called for single-node changes.
- [ ] Confirm `isValidDagModel` is used to validate the snapshot payload before dispatching to the store, preventing corrupt data from causing downstream rendering errors.
- [ ] Verify unsubscribe logic runs in the `useEffect` cleanup function, not in a conditional branch, to guarantee it executes even when the component unmounts unexpectedly.
- [ ] Confirm `DAGDisconnectedOverlay` uses `backdrop-filter: blur` and does NOT block pointer events to other UI chrome outside the DAG canvas area.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="useDagSubscription|DAGView.integration"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui tsc --noEmit` with zero errors.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/hooks/useDagSubscription.agent.md` documenting: MCP topics subscribed (`devs/dag/subscribe`, `devs/dag/snapshot`, `devs/dag/nodeStatusUpdate`, `devs/dag/unsubscribe`), payload shapes for each, partial vs. full update strategies, and reconnection behavior.
- [ ] Create `packages/webview-ui/src/components/dag/DAGView.agent.md` documenting: the composition pattern (all DAG sub-components), the `isConnected` prop flow, and instructions for adding new DAG toolbar controls.
- [ ] Update `packages/webview-ui/src/stores/dagStore.agent.md` to document the new `setNodeStatus` action.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test --coverage --testPathPattern="useDagSubscription|DAGView"` and confirm ≥ 85% branch coverage on `useDagSubscription.ts` and `DAGView.tsx`.
- [ ] Load the Extension Development Host. Start a devs project run. Observe the DAG canvas: task nodes should change their status badge in real time as tasks complete (pending → in_progress → done). Stop the orchestrator MCP server process and verify the disconnected overlay appears within 3 seconds.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm exit code 0.
- [ ] Run `pnpm test --filter @devs/core -- --testPathPattern="dag"` to confirm the core-side `devs/dag/nodeStatusUpdate` MCP event is emitted with the correct payload shape when a task status changes.

# Task: Task Detail Card — Slide-out Panel with Implementation History, Test Logs, and Git Diffs (Sub-Epic: 05_DAG Visualization and Task Graph)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-093-4]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/dag/__tests__/TaskDetailCard.test.tsx`, write React Testing Library tests:
  - When `useDagStore.selectedNodeId` is `null`, the component renders nothing (returns `null`) or is hidden (`data-testid="task-detail-card"` is not in the DOM).
  - When `selectedNodeId` is set to a valid task ID, the panel renders with `data-testid="task-detail-card"` and slides in from the right (CSS class `task-detail-card--open`).
  - The panel header shows the task's `title` and `status` badge.
  - A close button (`data-testid="task-detail-close"`) calls `useDagStore.selectNode(null)` when clicked.
  - The panel renders an "Implementation History" section (`data-testid="task-detail-history"`) with one entry per `AgentTurn` in the task's history.
  - The panel renders a "Test Logs" section (`data-testid="task-detail-test-logs"`) showing the last test run output.
  - The panel renders a "Git Diff" section (`data-testid="task-detail-git-diff"`) with syntax-highlighted diff content.
  - Pressing `Escape` while the panel is open calls `useDagStore.selectNode(null)`.
- [ ] In `packages/webview-ui/src/hooks/__tests__/useTaskDetail.test.ts`:
  - `useTaskDetail(taskId)` sends a `devs/getTaskDetail` MCP request with the given `taskId`.
  - Returns `{ isLoading: true, data: null }` while awaiting the response.
  - Returns `{ isLoading: false, data: TaskDetailPayload }` on success.
  - Returns `{ isLoading: false, error: Error }` on MCP error.
  - Calling the hook with `null` as `taskId` does NOT send a request and returns `{ isLoading: false, data: null }`.

## 2. Task Implementation

- [ ] Define `TaskDetailPayload` interface in `packages/webview-ui/src/models/dagModel.ts`:
  ```typescript
  export interface AgentTurn {
    turnIndex: number;
    timestamp: string; // ISO 8601
    thought: string;
    action: string;
    observation: string;
    outcome: 'success' | 'failure' | 'skipped';
  }

  export interface TaskDetailPayload {
    taskId: string;
    title: string;
    status: TaskStatus;
    requirementIds: string[];
    agentHistory: AgentTurn[];
    lastTestLog: string;   // raw stdout/stderr from last test run
    gitDiff: string;       // unified diff string
  }
  ```
- [ ] Create `packages/webview-ui/src/hooks/useTaskDetail.ts` — a custom hook:
  - Accepts `taskId: string | null`.
  - Returns `{ isLoading: boolean; data: TaskDetailPayload | null; error: Error | null }`.
  - Uses `useEffect` to call the MCP client (`useMcpClient().call('devs/getTaskDetail', { taskId })`) when `taskId` changes.
  - Caches results by `taskId` in a `useRef` map to avoid redundant requests for already-loaded tasks within the same webview session.
  - Aborts in-flight requests using `AbortController` when `taskId` changes before the previous request completes.
- [ ] Create `packages/webview-ui/src/components/dag/TaskDetailCard.tsx`:
  - Reads `selectedNodeId` from `useDagStore`.
  - Calls `useTaskDetail(selectedNodeId)`.
  - Renders a slide-out `<aside>` panel:
    - Position: fixed right edge of the DAG view, `width: 380px`, full height.
    - CSS transition: `transform: translateX(100%)` (closed) → `transform: translateX(0)` (open), `transition: transform 250ms ease-out`.
    - `data-testid="task-detail-card"`, `aria-label="Task Detail"`, `role="complementary"`.
  - **Header**: task `title` (h2), status badge (colored dot + status text), close `<button data-testid="task-detail-close" aria-label="Close task detail">`.
  - **Implementation History section** (`data-testid="task-detail-history"`):
    - Renders each `AgentTurn` as a timeline item showing `turnIndex`, `timestamp` (relative, e.g., "2 min ago"), `outcome` badge, and collapsed `thought`/`action`/`observation` (expandable via `<details>`).
  - **Test Logs section** (`data-testid="task-detail-test-logs"`):
    - Renders `lastTestLog` in a `<pre>` block using the user's editor font (`var(--vscode-editor-font-family)`).
    - ANSI color codes in the log are parsed and rendered using `ansi-to-html` (add as a `pnpm add ansi-to-html` dependency in `packages/webview-ui`).
    - Maximum height `200px`, scrollable (`overflow-y: auto`).
  - **Git Diff section** (`data-testid="task-detail-git-diff"`):
    - Renders `gitDiff` using a lightweight diff renderer: added lines (`+`) with `var(--vscode-diffEditor-insertedLineBackground)`, removed lines (`-`) with `var(--vscode-diffEditor-removedLineBackground)`.
    - Implement a minimal `<DiffBlock gitDiff={string}>` sub-component in `packages/webview-ui/src/components/dag/DiffBlock.tsx` that parses unified diff lines and renders them in a `<table>` with `data-testid="diff-block"`.
  - Loading state: renders a skeleton shimmer (`<div class="skeleton">`) in each section while `isLoading` is true.
  - Error state: renders an error message with a "Retry" button that re-triggers `useTaskDetail`.
  - `Escape` key handler: attached via `useEffect` on `window` (removed on unmount), calls `useDagStore.getState().selectNode(null)`.

## 3. Code Review

- [ ] Verify the `<aside>` uses a CSS transition for slide-in/out (not `display: none` toggling) to ensure the animation is smooth and accessible.
- [ ] Confirm `useTaskDetail` uses `AbortController` to cancel stale in-flight requests; verify no React state updates occur after unmount.
- [ ] Verify ANSI parsing uses `ansi-to-html` and the output is sanitized before being set via `dangerouslySetInnerHTML` (use the library's `escape_xml: true` option).
- [ ] Confirm `DiffBlock.tsx` does NOT use `dangerouslySetInnerHTML` for the diff content — each line must be rendered as plain text within table cells.
- [ ] Verify the `Escape` key `window` listener is removed on panel close or unmount to prevent ghost listeners.
- [ ] Confirm `role="complementary"` and `aria-label` are present for accessibility compliance.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="TaskDetailCard|useTaskDetail|DiffBlock"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui tsc --noEmit` with zero type errors.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/components/dag/TaskDetailCard.agent.md` documenting: MCP call used (`devs/getTaskDetail`), caching strategy, ANSI rendering approach, diff rendering approach, and the Escape key listener lifecycle.
- [ ] Create `packages/webview-ui/src/hooks/useTaskDetail.agent.md` documenting: the `TaskDetailPayload` shape, request lifecycle (loading/success/error states), abort strategy, and per-session result cache.
- [ ] Create `packages/webview-ui/src/components/dag/DiffBlock.agent.md` documenting: unified diff parsing assumptions, line type classification (`+`, `-`, `@@`, context), and the table rendering structure.
- [ ] Update `packages/webview-ui/src/models/dagModel.agent.md` to include `AgentTurn` and `TaskDetailPayload` interface documentation.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test --coverage --testPathPattern="TaskDetailCard|useTaskDetail|DiffBlock"` and confirm ≥ 85% coverage on each file.
- [ ] Load the Extension Development Host. Click a task node in the DAG canvas. Verify the slide-out panel animates open from the right, showing the task title, status, agent history entries, test log output, and a colored git diff. Press `Escape` and verify the panel slides closed.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm exit code 0.
- [ ] Run `grep -r "dangerouslySetInnerHTML" packages/webview-ui/src/components/dag/DiffBlock.tsx` and confirm no matches (diff content must be rendered safely).

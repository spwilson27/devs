# Task: Build AgentConsole React Component with Thought/Action/Observation Triad (Sub-Epic: 02_Trace Streaming and Agent Console Core)

## Covered Requirements
- [1_PRD-REQ-INT-009], [9_ROADMAP-TAS-703]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/__tests__/AgentConsole.test.tsx`, write component tests using `@testing-library/react`:
  - Test that `<AgentConsole />` renders three labelled panes: one with accessible name "Thought Stream", one "Action Log", one "Observation Feed".
  - Test that when the Zustand store contains one `ThoughtEnvelope` with `payload.content = "Planning approach"`, the "Thought Stream" pane renders the text "Planning approach".
  - Test that when the store contains one `ActionEnvelope` with `payload.tool = "write_file"` and `payload.status = "invoking"`, the "Action Log" pane renders "write_file" and an "invoking" status indicator.
  - Test that when the store contains one `ActionEnvelope` with `payload.status = "success"`, the status indicator has the CSS class or aria-label corresponding to success (e.g., `aria-label="success"`).
  - Test that when the store contains one `ActionEnvelope` with `payload.status = "error"`, the status indicator reflects the error state.
  - Test that when the store contains one `ObservationEnvelope` with `payload.content = "File written successfully"`, the "Observation Feed" pane renders that text.
  - Test that when the store is empty, all three panes render an empty-state placeholder text (e.g., "Waiting for agent...").
  - Test that the component auto-scrolls to the bottom of each pane when new items are appended (verify `scrollTop === scrollHeight - clientHeight` via `jest-dom` or by spying on `scrollIntoView`).
  - Test that the "Thought Stream" pane renders items in ascending `sequenceNumber` order.

## 2. Task Implementation

- [ ] Create `packages/webview-ui/src/components/AgentConsole/AgentConsole.tsx`.
- [ ] Create `packages/webview-ui/src/components/AgentConsole/AgentConsole.module.css` (or use Tailwind classes).
- [ ] Import `useSaopStreamStore` from `../../store`.
- [ ] Implement the `AgentConsole` functional component:
  - Use three `useRef<HTMLDivElement>(null)` refs (`thoughtsRef`, `actionsRef`, `observationsRef`) for the scroll containers.
  - Use `useEffect` watching `thoughts`, `actions`, `observations` from the store to call `ref.current.scrollTop = ref.current.scrollHeight` when the respective array changes.
  - Render a three-column layout (or tabbed layout on narrow viewports) using CSS grid or flexbox.
  - **Thought Stream pane** (`aria-label="Thought Stream"`):
    - If `thoughts.length === 0`: render `<p className="empty-state">Waiting for agent...</p>`.
    - Else: render a `<ul>` where each `ThoughtEnvelope` in `thoughts` is a `<li key={envelope.sequenceNumber}>` containing `<span className="thought-content">{envelope.payload.content}</span>`.
  - **Action Log pane** (`aria-label="Action Log"`):
    - If `actions.length === 0`: render empty-state paragraph.
    - Else: render a `<ul>` where each `ActionEnvelope` is a `<li key={envelope.sequenceNumber}>` containing:
      - `<span className="tool-name">{envelope.payload.tool}</span>`
      - `<span className={`status status--${envelope.payload.status}`} aria-label={envelope.payload.status} />` (a color-coded dot: yellow for "invoking", green for "success", red for "error").
  - **Observation Feed pane** (`aria-label="Observation Feed"`):
    - If `observations.length === 0`: render empty-state paragraph.
    - Else: render a `<ul>` where each `ObservationEnvelope` is a `<li key={envelope.sequenceNumber}>` containing `<span className="observation-content">{envelope.payload.content}</span>` and `<span className="observation-source">{envelope.payload.source}</span>`.
- [ ] Export `AgentConsole` from `packages/webview-ui/src/components/index.ts`.
- [ ] Mount `<AgentConsole />` in the Agent Console route/view within the Webview app (e.g., in `packages/webview-ui/src/views/AgentConsoleView.tsx`).

## 3. Code Review

- [ ] Verify auto-scroll uses `scrollTop = scrollHeight` (not `scrollIntoView`) to avoid scrolling the outer page.
- [ ] Confirm all three panes have distinct `aria-label` attributes for screen reader accessibility.
- [ ] Verify `key` props on list items use `envelope.sequenceNumber` (unique and stable) rather than array index.
- [ ] Confirm the status dot uses both a CSS class (for visual styling) AND an `aria-label` (for accessibility), not just a color.
- [ ] Verify the component does not call any async functions or side-effects directly in the render body.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test --workspace=packages/webview-ui -- --testPathPattern=AgentConsole` and confirm all tests pass.
- [ ] Run `npm run typecheck --workspace=packages/webview-ui` and confirm zero TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/components/AgentConsole/AgentConsole.agent.md` documenting:
  - The component's layout (three-pane triad: Thought, Action, Observation).
  - The empty-state behavior for each pane.
  - The auto-scroll behavior and the `useRef`/`useEffect` pattern used.
  - The status dot color scheme (yellow/green/red) and its aria-label accessibility pattern.
  - How to mount the component in the Webview app routing.

## 6. Automated Verification

- [ ] Run `npm test --workspace=packages/webview-ui -- --testPathPattern=AgentConsole --coverage` and confirm `AgentConsole.tsx` has ≥ 85% line coverage.
- [ ] Run `npm run build --workspace=packages/webview-ui` and confirm the Webview bundle builds without errors and `AgentConsole` is included in the output.
- [ ] Open the VSCode Extension in the Extension Development Host (`F5`), trigger `devs.startSession`, and visually confirm all three panes render and populate as the agent runs.

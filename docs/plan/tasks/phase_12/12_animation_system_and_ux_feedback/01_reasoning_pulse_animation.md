# Task: Implement The Reasoning Pulse Animation (Sub-Epic: 12_Animation System and UX Feedback)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-051], [7_UI_UX_DESIGN-REQ-UI-DES-051-1], [7_UI_UX_DESIGN-REQ-UI-DES-051-2], [7_UI_UX_DESIGN-REQ-UI-DES-051-3]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/AgentConsole/__tests__/ReasoningPulse.test.tsx`, write a unit test using Vitest + React Testing Library:
  - Test: `ReasoningPulse` renders without crashing when `isActive` prop is `false`.
  - Test: When `isActive` is `true`, the container element has the CSS class `reasoning-pulse--active` applied.
  - Test: When `isActive` is `false`, the class `reasoning-pulse--active` is NOT present.
  - Test: When the component transitions from `isActive=true` to `isActive=false`, the class is removed immediately (not delayed).
- [ ] In `packages/webview-ui/src/hooks/__tests__/useReasoningPulse.test.ts`, write a unit test for the custom hook:
  - Mock the `EventBus` module at `@devs/core/EventBus`.
  - Test: Hook returns `{ isActive: false }` initially.
  - Test: When an `AGENT_THOUGHT_STREAM` event is dispatched via the mock EventBus, hook returns `{ isActive: true }`.
  - Test: When a `TOOL_LIFECYCLE:INVOKED` event is dispatched AFTER an `AGENT_THOUGHT_STREAM` event, hook returns `{ isActive: false }`.
  - Test: Hook properly unsubscribes from EventBus on unmount (verify the unsubscribe mock is called).
- [ ] In `packages/webview-ui/src/components/DAGCanvas/__tests__/DAGNodePulse.test.tsx`:
  - Test: The `active_task_node` in the DAG canvas applies the `reasoning-pulse--active` class when `isAgentThinking` prop is `true`.
  - Test: The opacity style on the node wrapper cycles between 0.6 and 1.0 (verify the CSS animation name is applied from the stylesheet).

## 2. Task Implementation
- [ ] **CSS Keyframes** – In `packages/webview-ui/src/styles/animations.css`, add:
  ```css
  @keyframes reasoning-pulse {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1.0; }
  }

  .reasoning-pulse--active {
    animation: reasoning-pulse 2000ms ease-in-out infinite;
  }
  ```
- [ ] **Custom Hook** – Create `packages/webview-ui/src/hooks/useReasoningPulse.ts`:
  - Subscribe to the `EventBus` (imported from `@devs/core`) for event type `AGENT_THOUGHT_STREAM`; on receipt set `isActive = true`.
  - Subscribe to `TOOL_LIFECYCLE:INVOKED`; on receipt set `isActive = false`.
  - Return `{ isActive: boolean }`.
  - Unsubscribe from both events in the `useEffect` cleanup function.
- [ ] **ReasoningPulse Component** – Create `packages/webview-ui/src/components/AgentConsole/ReasoningPulse.tsx`:
  - Accept props: `{ isActive: boolean; children: React.ReactNode }`.
  - Render a `<div>` wrapper with class `reasoning-pulse` and conditionally append `reasoning-pulse--active` when `isActive` is `true`.
  - Import `./animations.css` (or the shared `styles/animations.css`).
- [ ] **Wire into ThoughtStreamer** – In `packages/webview-ui/src/components/AgentConsole/ThoughtStreamer.tsx`:
  - Call `useReasoningPulse()` to get `isActive`.
  - Wrap the component's header `<div>` with `<ReasoningPulse isActive={isActive}>`.
- [ ] **Wire into DAGCanvas** – In `packages/webview-ui/src/components/DAGCanvas/DAGNode.tsx`:
  - Accept an `isAgentThinking: boolean` prop.
  - Apply the `reasoning-pulse--active` CSS class to the node wrapper `<div>` when `isAgentThinking` is `true`.
  - The parent `DAGCanvas` component must pass `isAgentThinking` derived from `useReasoningPulse()` to the node marked as `active_task_node`.

## 3. Code Review
- [ ] Verify the CSS animation uses `ease-in-out` (sinusoidal equivalent) and **not** `linear` – the spec requires a sinusoidal feel.
- [ ] Confirm the animation duration is exactly `2000ms` and `iteration-count` is `infinite`.
- [ ] Confirm `opacity` range is `0.6` to `1.0` (not 0 to 1, which would be too jarring).
- [ ] Verify the hook subscribes AND unsubscribes symmetrically inside a single `useEffect` – no memory leaks.
- [ ] Confirm the `TOOL_LIFECYCLE:INVOKED` handler sets `isActive` to `false` immediately (synchronously within the event callback), not via a `setTimeout`.
- [ ] Ensure no hardcoded timeout values are used for toggling active state – state is purely event-driven.
- [ ] Verify the component does not trigger unnecessary re-renders; the `isActive` boolean is the only state variable.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run ReasoningPulse` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run useReasoningPulse` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run DAGNodePulse` and confirm all tests pass.
- [ ] Run the full test suite `pnpm --filter @devs/webview-ui test -- --run` and confirm no regressions.

## 5. Update Documentation
- [ ] Add a section `### Reasoning Pulse` to `packages/webview-ui/docs/animations.md` (create the file if it does not exist), documenting:
  - The two EventBus events that control the pulse (`AGENT_THOUGHT_STREAM`, `TOOL_LIFECYCLE:INVOKED`).
  - The CSS class name (`reasoning-pulse--active`) and where it is applied (ThoughtStreamer header, DAG active node).
  - The animation parameters: 2000ms, ease-in-out, infinite, opacity 0.6→1.0.
- [ ] Update `CHANGELOG.md` in the webview-ui package with an entry under `[Unreleased]`: `feat: add Reasoning Pulse animation for active agent thinking state`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run --reporter=json > /tmp/reasoning_pulse_results.json` and verify exit code is `0`.
- [ ] Assert that `/tmp/reasoning_pulse_results.json` contains `"numFailedTests": 0` using `node -e "const r=require('/tmp/reasoning_pulse_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm it exits with code `0` (no TypeScript errors introduced).

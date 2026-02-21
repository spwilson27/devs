# Task: Implement Tool Execution Micro-Animations – Invocation Shimmer & Progress Sweep (Sub-Epic: 12_Animation System and UX Feedback)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-052], [7_UI_UX_DESIGN-REQ-UI-DES-052-1], [7_UI_UX_DESIGN-REQ-UI-DES-052-2]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/AgentConsole/__tests__/ActionCard.shimmer.test.tsx`, write Vitest + React Testing Library tests:
  - Test: `ActionCard` rendered with `status="invoked"` applies the CSS class `action-card--shimmer` to the card root element.
  - Test: `ActionCard` rendered with `status="idle"` does NOT have the `action-card--shimmer` class.
  - Test: `ActionCard` rendered with `status="running"` has the `action-card--progress-sweep` class applied (for the indeterminate bar).
  - Test: `ActionCard` rendered with `status="idle"` does NOT have the `action-card--progress-sweep` class.
  - Test: Snapshot test for the `ActionCard` in `status="invoked"` state to guard against unintended structural regressions.
- [ ] In `packages/webview-ui/src/components/AgentConsole/__tests__/ProgressSweepBar.test.tsx`:
  - Test: `ProgressSweepBar` renders a `<div>` with `role="progressbar"` and `aria-label="Tool executing"`.
  - Test: `ProgressSweepBar` has a height of `2px` applied via inline style or a verifiable CSS class.
  - Test: `ProgressSweepBar` applies the CSS class `progress-sweep--active` causing the sweep animation.
- [ ] In `packages/webview-ui/src/hooks/__tests__/useToolLifecycle.test.ts`:
  - Mock `EventBus` from `@devs/core`.
  - Test: Hook initializes with `{ toolStatus: 'idle', toolName: null }`.
  - Test: On `TOOL_LIFECYCLE:INVOKED` event with payload `{ toolName: 'bash' }`, hook returns `{ toolStatus: 'invoked', toolName: 'bash' }`.
  - Test: On `TOOL_LIFECYCLE:RUNNING` event, hook returns `{ toolStatus: 'running' }`.
  - Test: Hook cleans up subscriptions on unmount.

## 2. Task Implementation
- [ ] **CSS Keyframes** – In `packages/webview-ui/src/styles/animations.css`, add:
  ```css
  /* Invocation Shimmer */
  @keyframes shimmer-sweep {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .action-card--shimmer {
    background: linear-gradient(
      90deg,
      var(--devs-surface) 0%,
      var(--devs-primary-faint, rgba(99,102,241,0.25)) 50%,
      var(--devs-surface) 100%
    );
    background-size: 200% 100%;
    animation: shimmer-sweep 800ms ease-out forwards;
  }

  /* Active Progress Sweep (indeterminate bar) */
  @keyframes progress-sweep {
    0%   { left: -40%; width: 40%; }
    60%  { left: 100%; width: 40%; }
    100% { left: 100%; width: 40%; }
  }

  .action-card--progress-sweep {
    position: relative;
    overflow: hidden;
  }

  .action-card--progress-sweep::before {
    content: '';
    position: absolute;
    top: 0;
    height: 2px;
    background: var(--devs-primary);
    animation: progress-sweep 1500ms ease-in-out infinite;
  }
  ```
- [ ] **`useToolLifecycle` Hook** – Create `packages/webview-ui/src/hooks/useToolLifecycle.ts`:
  - Subscribe to `TOOL_LIFECYCLE:INVOKED` → set `toolStatus = 'invoked'`, store `toolName` from the payload.
  - Subscribe to `TOOL_LIFECYCLE:RUNNING` → set `toolStatus = 'running'`.
  - Subscribe to `TOOL_LIFECYCLE:COMPLETED` and `TOOL_LIFECYCLE:FAILED` → set `toolStatus = 'idle'`.
  - Return `{ toolStatus: 'idle' | 'invoked' | 'running', toolName: string | null }`.
  - Unsubscribe all handlers on cleanup.
- [ ] **`ProgressSweepBar` Component** – Create `packages/webview-ui/src/components/AgentConsole/ProgressSweepBar.tsx`:
  - Render `<div role="progressbar" aria-label="Tool executing" className="progress-sweep-bar" style={{ height: '2px', position: 'absolute', top: 0, left: 0, right: 0 }} />`.
  - Apply `progress-sweep--active` class when rendered (always active while visible).
- [ ] **`ActionCard` Component Updates** – In `packages/webview-ui/src/components/AgentConsole/ActionCard.tsx`:
  - Accept `status: 'idle' | 'invoked' | 'running' | 'completed' | 'failed'` prop.
  - Conditionally apply `action-card--shimmer` class when `status === 'invoked'`.
  - Conditionally apply `action-card--progress-sweep` class when `status === 'running'`.
  - Render `<ProgressSweepBar />` as a child when `status === 'running'`.
- [ ] **Wire into AgentConsole** – In the parent `AgentConsole` component, call `useToolLifecycle()` and pass the `toolStatus` and `toolName` to the relevant `ActionCard` instance identified by `toolName`.

## 3. Code Review
- [ ] Confirm the shimmer animation is `forwards` (one-time, not infinite) – the spec says "one-time horizontal shimmer effect."
- [ ] Confirm the progress bar height is exactly `2px` as specified.
- [ ] Confirm the progress sweep cycle duration is exactly `1500ms`.
- [ ] Verify the `::before` pseudo-element for the progress bar is `position: absolute` so it does not cause layout shifts.
- [ ] Verify the `action-card--progress-sweep` wrapper has `overflow: hidden` to clip the sweeping bar.
- [ ] Confirm `role="progressbar"` and `aria-label` are present on `ProgressSweepBar` for accessibility.
- [ ] Ensure the `useToolLifecycle` hook handles multiple concurrent tool invocations correctly (keyed by `toolName`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run ActionCard.shimmer` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run ProgressSweepBar` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run useToolLifecycle` and confirm all tests pass.
- [ ] Run the full suite `pnpm --filter @devs/webview-ui test -- --run` and confirm no regressions.

## 5. Update Documentation
- [ ] Add a section `### Tool Execution Micro-Animations` to `packages/webview-ui/docs/animations.md` documenting:
  - `action-card--shimmer`: one-time shimmer on tool invocation, triggered by `TOOL_LIFECYCLE:INVOKED`.
  - `action-card--progress-sweep` + `ProgressSweepBar`: 2px indeterminate bar during `TOOL_LIFECYCLE:RUNNING`, 1500ms cycle.
  - List all four lifecycle events and their CSS state mappings.
- [ ] Update `CHANGELOG.md` with: `feat: add Invocation Shimmer and Progress Sweep micro-animations for tool execution`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --run --reporter=json > /tmp/tool_shimmer_results.json` and verify exit code `0`.
- [ ] Assert `"numFailedTests": 0` via `node -e "const r=require('/tmp/tool_shimmer_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm TypeScript compilation succeeds (exit code `0`).

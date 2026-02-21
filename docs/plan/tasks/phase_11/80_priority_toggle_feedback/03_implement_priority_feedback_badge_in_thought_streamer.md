# Task: Implement Priority Feedback Badge in ThoughtStreamer for Agent Directive Acknowledgement (Sub-Epic: 80_Priority_Toggle_Feedback)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-091]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/ThoughtStreamer/__tests__/ThoughtStreamer.priorityBadge.test.tsx`, write unit tests using React Testing Library:
  - **Rendering by thought status:**
    - Test: a thought with `type: "DIRECTIVE"` and `status: "PENDING"` renders a badge with text `"Pending..."` and the CSS class `thought-badge--pending`.
    - Test: a thought with `type: "DIRECTIVE"`, `priority: true`, and `status: "ACKNOWLEDGED"` renders a badge with text `"⚡ Immediate Pivot – Acknowledged"` and the CSS class `thought-badge--acknowledged`.
    - Test: a thought with `type: "DIRECTIVE"`, `priority: false`, and `status: "ACKNOWLEDGED"` renders a badge with text `"Acknowledged"` (no lightning icon) and the CSS class `thought-badge--acknowledged`.
    - Test: a thought with `type: "DIRECTIVE"` and `status: "FAILED"` renders a badge with text `"Failed"` and the CSS class `thought-badge--failed`.
    - Test: a thought with `type: "AGENT_THOUGHT"` (non-directive) does NOT render any priority badge.
  - **Accessibility:**
    - Test: the badge element has `role="status"` and `aria-live="polite"` so screen readers announce the status change.
    - Test: the badge `aria-label` reflects the full human-readable status string (e.g., `"Directive status: Immediate Pivot – Acknowledged"`).
  - **Visual state transitions:**
    - Test: when the Zustand store updates a thought's status from `"PENDING"` to `"ACKNOWLEDGED"`, the ThoughtStreamer re-renders and the badge class changes from `thought-badge--pending` to `thought-badge--acknowledged`.
    - Test: when status updates to `"FAILED"`, the badge class changes to `thought-badge--failed`.
  - **Snapshot tests:**
    - Test: snapshot of a rendered `DIRECTIVE` thought row with `priority: true` and `status: "ACKNOWLEDGED"`.
    - Test: snapshot of a rendered `DIRECTIVE` thought row with `priority: true` and `status: "PENDING"`.

## 2. Task Implementation
- [ ] Locate `packages/vscode/src/webview/components/ThoughtStreamer/ThoughtStreamer.tsx`.
- [ ] Import the `OptimisticThought` and `ThoughtStatus` types from `packages/vscode/src/webview/types/thought.ts` (defined in Task 02).
- [ ] Create a new sub-component `ThoughtPriorityBadge` in `packages/vscode/src/webview/components/ThoughtStreamer/ThoughtPriorityBadge.tsx`:
  ```tsx
  interface ThoughtPriorityBadgeProps {
    status: ThoughtStatus;
    priority: boolean;
  }

  const BADGE_LABELS: Record<ThoughtStatus, (priority: boolean) => string> = {
    PENDING: () => "Pending...",
    ACKNOWLEDGED: (p) => p ? "⚡ Immediate Pivot – Acknowledged" : "Acknowledged",
    FAILED: () => "Failed",
  };

  export const ThoughtPriorityBadge: React.FC<ThoughtPriorityBadgeProps> = ({ status, priority }) => {
    const label = BADGE_LABELS[status](priority);
    return (
      <span
        role="status"
        aria-live="polite"
        aria-label={`Directive status: ${label}`}
        className={`thought-badge thought-badge--${status.toLowerCase()}`}
      >
        {label}
      </span>
    );
  };
  ```
- [ ] In `ThoughtStreamer.tsx`, within the thought row render function, conditionally render `<ThoughtPriorityBadge>` only when `thought.type === "DIRECTIVE"`.
- [ ] In `packages/vscode/src/webview/components/ThoughtStreamer/ThoughtStreamer.module.css` (or Tailwind config), define:
  - `.thought-badge` — base styles: `font-size: 11px; font-family: var(--vscode-editor-font-family); padding: 2px 6px; border-radius: 4px; font-weight: 500;`
  - `.thought-badge--pending` — `background: var(--vscode-badge-background); color: var(--vscode-badge-foreground);`
  - `.thought-badge--acknowledged` — `background: var(--vscode-testing-iconPassed); color: var(--vscode-editor-background);` with an optional subtle glow using `box-shadow: 0 0 4px var(--vscode-testing-iconPassed);`.
  - `.thought-badge--failed` — `background: var(--vscode-testing-iconFailed); color: var(--vscode-editor-background);`
- [ ] Ensure `ThoughtStreamer` subscribes to the Zustand store's `thoughts` array using a selector (e.g., `useUiStore(state => state.thoughts)`) so it re-renders reactively when statuses are updated.
- [ ] Apply `React.memo` to `ThoughtPriorityBadge` and to the thought row component to prevent unnecessary re-renders of unaffected rows (per `[7_UI_UX_DESIGN-REQ-UI-DES-068]` memoization requirement).

## 3. Code Review
- [ ] Verify no hardcoded hex colors or pixel values for badge colors — all must use `var(--vscode-*)` tokens.
- [ ] Verify `ThoughtPriorityBadge` is only rendered for `thought.type === "DIRECTIVE"` rows, never for agent-generated thoughts.
- [ ] Verify `React.memo` is applied correctly and the memoization dependency is the `thought` object identity (ensure store updates produce new object references for changed thoughts).
- [ ] Verify the `aria-live="polite"` is on the badge itself (not a wrapper), so the announcement fires on status change.
- [ ] Verify the badge renders within the virtual scrolling list without breaking the `ThoughtStreamer`'s row height calculations (fixed or dynamic row height must account for the badge).
- [ ] Verify the `⚡` character is included in the `i18n` skeleton key if `i18next` is active (add a translation key `thought.badge.immediatePivotAcknowledged`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="ThoughtStreamer.priorityBadge"` from the repository root.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="ThoughtStreamer"` to ensure no existing ThoughtStreamer tests regressed.
- [ ] Confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm TypeScript compilation exits with code 0.

## 5. Update Documentation
- [ ] Create `packages/vscode/src/webview/components/ThoughtStreamer/ThoughtPriorityBadge.agent.md`:
  - Document the badge's purpose: visual confirmation that an agent has acknowledged a user directive in the thought stream.
  - Document the three statuses (`PENDING`, `ACKNOWLEDGED`, `FAILED`) and their visual representations.
  - Document the `priority` flag behavior (lightning bolt prefix for `Immediate Pivot` directives).
  - Document the accessibility contract (`role="status"`, `aria-live="polite"`, `aria-label` pattern).
  - Document the CSS token bindings.
- [ ] Update `packages/vscode/src/webview/components/ThoughtStreamer/ThoughtStreamer.agent.md`:
  - Add a section noting that `DIRECTIVE`-type thoughts receive a `ThoughtPriorityBadge` and are reactively updated via Zustand selector.
  - Note the memoization strategy for the badge and row components.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="ThoughtStreamer" --json --outputFile=/tmp/test_results_03.json`.
- [ ] Assert `numFailedTests: 0` in `/tmp/test_results_03.json`.
- [ ] Run `pnpm --filter @devs/vscode build` and assert exit code 0.
- [ ] Optionally, run a Storybook story (if configured) for `ThoughtPriorityBadge` in all three statuses to visually verify badge rendering: `pnpm --filter @devs/vscode storybook:test`.

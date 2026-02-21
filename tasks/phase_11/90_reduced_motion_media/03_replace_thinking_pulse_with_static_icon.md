# Task: Replace Thinking Pulse Animation with Static Active Icon Under Reduced Motion (Sub-Epic: 90_Reduced_Motion_Media)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-085-2]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/ThinkingPulse/__tests__/ThinkingPulse.reducedMotion.test.tsx`, write the following tests using `@testing-library/react`:
  - **Setup:** Mock `window.matchMedia` for `(prefers-reduced-motion: reduce)` before each test (same pattern as Task 01's tests).
  - Test 1 — **Pulse rendered (motion allowed):** With `prefersReducedMotion = false` and `isThinking = true`, render `<ThinkingPulse>`. Assert that the pulsing element is present in the DOM — e.g., query by `data-testid="thinking-pulse-animation"` — and that the element has the `pulse-active` CSS class that drives the keyframe animation.
  - Test 2 — **Static icon rendered (reduced motion, thinking active):** With `prefersReducedMotion = true` and `isThinking = true`, render `<ThinkingPulse>`. Assert that the pulsing element (`data-testid="thinking-pulse-animation"`) is **absent** from the DOM, and that a static icon element (`data-testid="thinking-active-icon"`) **is** present with `aria-label="Active"` (or equivalent accessible label).
  - Test 3 — **Neither rendered (reduced motion, not thinking):** With `prefersReducedMotion = true` and `isThinking = false`, render `<ThinkingPulse>`. Assert that both `data-testid="thinking-pulse-animation"` and `data-testid="thinking-active-icon"` are absent from the DOM.
  - Test 4 — **Accessibility label on static icon:** With `prefersReducedMotion = true` and `isThinking = true`, assert that the static icon has a non-empty `aria-label` attribute (e.g., `"Agent is active"`) so screen readers receive a meaningful announcement.
  - Test 5 — **Snapshot:** Capture snapshots for both `prefersReducedMotion = false` and `prefersReducedMotion = true` (with `isThinking = true` in both) to lock the rendered markup.

## 2. Task Implementation

- [ ] Locate or create the `ThinkingPulse` component at `packages/webview-ui/src/components/ThinkingPulse/ThinkingPulse.tsx`.
  - If the pulse logic is currently inlined in another component (e.g., `AgentStatusBar`), extract it into its own `ThinkingPulse` component first.
- [ ] The component must accept `isThinking: boolean` as a required prop.
- [ ] Import `useReducedMotion` from `../../hooks` and call it: `const reducedMotion = useReducedMotion();`
- [ ] Implement the conditional render:
  ```tsx
  if (!isThinking) return null;

  if (reducedMotion) {
    return (
      <span
        data-testid="thinking-active-icon"
        className={styles.activeIcon}
        aria-label="Agent is active"
        role="img"
      >
        {/* VSCode Codicon — matches [7_UI_UX_DESIGN-REQ-UI-DES-005-2] */}
        <i className="codicon codicon-circle-filled" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      data-testid="thinking-pulse-animation"
      className={styles.pulseActive}
      aria-hidden="true"  // Animation is decorative; ARIA-live handles state
    />
  );
  ```
- [ ] Add the following CSS to `packages/webview-ui/src/components/ThinkingPulse/ThinkingPulse.module.css`:
  ```css
  .pulseActive {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--vscode-charts-blue);
    animation: pulse var(--devs-motion-duration, 2000ms) ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  .activeIcon {
    display: inline-flex;
    align-items: center;
    color: var(--vscode-charts-blue);
    font-size: 8px;
  }
  ```
  - Note: `--devs-motion-duration` resolving to `0ms` in reduced-motion mode via the global `motion.css` ensures the CSS animation also stops as a secondary safeguard, but the JSX conditional branch is the primary control.
- [ ] Replace all inline uses of the old pulse markup (search for `pulse-active`, `thinking-pulse`, `opacity` keyframe animation related to agent state) across the codebase with `<ThinkingPulse isThinking={...} />` imports from this new component.
- [ ] Ensure the parent `AgentStatusBar` (or equivalent container) passes the `isThinking` boolean from the Zustand store's agent state slice.

## 3. Code Review

- [ ] Verify the static icon uses a VSCode Codicon (`codicon-circle-filled` or similar) per requirement `[7_UI_UX_DESIGN-REQ-UI-DES-005-2]`, not a custom SVG or emoji.
- [ ] Verify the static icon carries a meaningful `aria-label` (`"Agent is active"`) since the pulsing animation that previously provided visual feedback is removed; the label must be surfaced to assistive technologies.
- [ ] Verify `aria-hidden="true"` is set on the pulse animation span (decorative) but **not** on the static icon span.
- [ ] Confirm the `animation` CSS property in `.pulseActive` references `--devs-motion-duration` so it inherits the global 0ms override from `motion.css` as a belt-and-suspenders safeguard.
- [ ] Ensure the component is a pure, side-effect-free render based only on `isThinking` and the `useReducedMotion()` result — no local timers or `setInterval` calls inside the component.

## 4. Run Automated Tests to Verify

- [ ] Run the ThinkingPulse reduced-motion tests: `pnpm --filter @devs/webview-ui test -- --testPathPattern="ThinkingPulse.reducedMotion"`
- [ ] Run the full ThinkingPulse test suite: `pnpm --filter @devs/webview-ui test -- --testPathPattern="ThinkingPulse"`
- [ ] Run the full Webview UI test suite: `pnpm --filter @devs/webview-ui test`
- [ ] All tests must pass with zero failures. Confirm the two snapshots (motion / no-motion) are committed.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/components/ThinkingPulse/AGENT.md` documenting: (a) the component API (`isThinking` prop), (b) the two render branches (animated pulse vs. static Codicon), (c) why `aria-hidden` is used on the animation and `aria-label` on the static icon.
- [ ] Update `docs/ui-patterns.md` under "Agent State Indicators" to list `ThinkingPulse` as the canonical component for conveying agent-active status, noting its reduced-motion fallback.
- [ ] If a Storybook story file exists for agent indicators, add a `ThinkingPulse` story with two variants: `Animated` (default) and `ReducedMotion` (using the `prefers-reduced-motion` addon decorator).
- [ ] Update `packages/webview-ui/AGENT.md` to note that the `ThinkingPulse` component is the **only** authorised location for pulse animation logic; direct use of `@keyframes pulse` in any other component is prohibited.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test --coverage --coveragePathPattern="ThinkingPulse"` and assert line coverage ≥ 90%.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm zero TypeScript compilation errors.
- [ ] Execute `scripts/a11y-motion-audit.sh` (created in Task 02) against the Storybook static build; confirm no WCAG 2.1 SC 2.3.3 violations are reported for the `ThinkingPulse` component.
- [ ] Run `grep -r "codicon-circle-filled\|activeIcon" packages/webview-ui/src/components/ThinkingPulse/` and confirm the Codicon class is present in the component source, proving the static icon was implemented as specified.

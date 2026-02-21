# Task: Implement "Immediate Pivot" Priority Toggle in DirectiveWhisperer (Sub-Epic: 80_Priority_Toggle_Feedback)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-032]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/DirectiveWhisperer/__tests__/DirectiveWhisperer.test.tsx`, write unit tests using React Testing Library:
  - Test: renders a checkbox (or toggle) labeled "Immediate Pivot" within the DirectiveWhisperer component.
  - Test: the "Immediate Pivot" checkbox is unchecked by default.
  - Test: clicking the "Immediate Pivot" checkbox toggles its checked state (`aria-checked` / `checked` attribute).
  - Test: the DirectiveWhisperer component exposes an `isPriority` boolean in its internal state that reflects the checkbox state.
  - Test: when `isPriority` is `true`, the submit button (or container) receives a visually distinct CSS class (e.g., `priority-active`) or data attribute (e.g., `data-priority="true"`).
  - Test: the toggle is keyboard accessible — pressing Space or Enter while focused toggles the checkbox.
  - Test: the toggle renders with the correct `aria-label="Immediate Pivot"` attribute for screen reader accessibility.
  - Test: the component snapshot matches the expected baseline with the toggle in both checked and unchecked states.

## 2. Task Implementation
- [ ] Locate `packages/vscode/src/webview/components/DirectiveWhisperer/DirectiveWhisperer.tsx`.
- [ ] Add an `isPriority` boolean to the component's local state (via `useState(false)`).
- [ ] Render a `<label>` + `<input type="checkbox">` (or a VSCode Codicon-styled toggle using `vscode-checkbox` from `@vscode/webview-ui-toolkit/react`) labeled **"Immediate Pivot"** inside the DirectiveWhisperer form, positioned to the left of the submit button.
  - The checkbox must use the `--vscode-checkbox-*` CSS tokens so it inherits the active VSCode theme.
  - Apply `aria-label="Immediate Pivot"` and `aria-describedby` pointing to a short helper text element (e.g., "Interrupts the agent on the next turn").
- [ ] When the checkbox is toggled, call `setIsPriority(prev => !prev)`.
- [ ] When `isPriority` is `true`, add the CSS class `directive-whisperer--priority` to the root container element and set `data-priority="true"` on the submit button.
- [ ] In `DirectiveWhisperer.module.css` (or the Tailwind classes used by the component), add:
  - `.directive-whisperer--priority` — applies `border-color: var(--vscode-statusBarItem-warningBackground)` and a subtle left accent bar (3px solid) using `--vscode-statusBarItem-warningBackground` to signal urgency.
- [ ] Export `isPriority` value via an `onPriorityChange` callback prop (`(isPriority: boolean) => void`) so parent components can read this state.
- [ ] Ensure the checkbox resets to `false` after the directive is submitted.

## 3. Code Review
- [ ] Verify no hardcoded colors exist; all colors must use `var(--vscode-*)` design tokens.
- [ ] Verify the checkbox is part of the form's natural tab order (no `tabIndex=-1` or `tabIndex=0` override unless intentional).
- [ ] Verify `aria-label` and `aria-describedby` are present on the toggle element.
- [ ] Verify the component is purely presentational with respect to the toggle: it emits state via `onPriorityChange` callback and does NOT trigger any MCP calls itself (that is the responsibility of Task 02).
- [ ] Verify the Tailwind/CSS classes follow the project's BEM-like naming convention or utility class strategy as defined in `packages/vscode/src/webview/README.md` (or equivalent).
- [ ] Verify the checkbox resets after form submission.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="DirectiveWhisperer"` from the repository root.
- [ ] Confirm all newly written tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage` and confirm the `DirectiveWhisperer` component coverage does not drop below the pre-existing coverage threshold.

## 5. Update Documentation
- [ ] Update `packages/vscode/src/webview/components/DirectiveWhisperer/DirectiveWhisperer.agent.md` (create if absent) to document:
  - The `isPriority` local state and its purpose.
  - The `onPriorityChange` prop interface.
  - The visual styling contract (CSS tokens used, class names applied).
  - A note that this flag is passed to the `inject_directive` MCP call payload (covered in Task 02).
- [ ] Update the component's JSDoc/TypeScript prop types to include `onPriorityChange?: (isPriority: boolean) => void`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="DirectiveWhisperer" --json --outputFile=/tmp/test_results_01.json` and confirm the JSON output shows `numFailedTests: 0`.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm the build exits with code 0 (no TypeScript errors).

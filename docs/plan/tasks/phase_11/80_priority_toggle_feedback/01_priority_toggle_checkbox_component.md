# Task: Implement "Immediate Pivot" Priority Toggle Checkbox in DirectiveWhisperer (Sub-Epic: 80_Priority_Toggle_Feedback)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-032]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/DirectiveWhisperer/__tests__/PriorityToggle.test.tsx`, write the following unit tests using Vitest + React Testing Library:
  - **Render test**: Assert the `<PriorityToggle>` component renders a `<input type="checkbox">` element with `aria-label="Immediate Pivot"` and an associated `<label>` containing the text "Immediate Pivot".
  - **Default state test**: Assert the checkbox is **unchecked** by default when no `isPriority` prop is passed.
  - **Controlled state test**: When `isPriority={true}` is passed, assert the checkbox is **checked**.
  - **onChange callback test**: Simulate a user click on the checkbox and assert the `onToggle` callback prop is called exactly once with the new boolean value (`true` when toggling from unchecked, `false` when toggling from checked).
  - **Disabled state test**: When `disabled={true}` is passed, assert the checkbox is not interactive (has `disabled` attribute) and `onToggle` is **not** called on click.
  - **Keyboard accessibility test**: Assert the checkbox can be toggled via the `Space` key.
  - **Visual indicator test**: When `isPriority={true}`, assert a CSS class such as `priority-toggle--active` (or a `data-priority="true"` attribute) is present on the root element, enabling distinct styling for the active state.

## 2. Task Implementation
- [ ] Create the file `packages/vscode/src/webview/components/DirectiveWhisperer/PriorityToggle.tsx`:
  - Accept props: `isPriority: boolean`, `onToggle: (next: boolean) => void`, `disabled?: boolean`.
  - Render a `<label>` wrapping an `<input type="checkbox">` with:
    - `id="directive-priority-toggle"`
    - `aria-label="Immediate Pivot"`
    - `checked={isPriority}`
    - `onChange={(e) => onToggle(e.target.checked)}`
    - `disabled={disabled ?? false}`
  - Apply the CSS class `priority-toggle--active` on the root `<label>` when `isPriority` is `true`.
  - Use VSCode design tokens for styling: border color via `var(--vscode-inputOption-activeBorder)` when active; use `var(--vscode-foreground)` for label text.
  - Include a Codicon icon prefix (e.g., `codicon codicon-warning`) adjacent to the label text to visually signal the interrupt nature of the toggle.
- [ ] Export `PriorityToggle` from `packages/vscode/src/webview/components/DirectiveWhisperer/index.ts`.
- [ ] Integrate `PriorityToggle` into the parent `DirectiveWhisperer` component (`packages/vscode/src/webview/components/DirectiveWhisperer/DirectiveWhisperer.tsx`):
  - Add local state: `const [isPriority, setIsPriority] = useState(false)`.
  - Render `<PriorityToggle isPriority={isPriority} onToggle={setIsPriority} disabled={isSubmitting} />` inside the form, positioned below the text input and above the submit button.
  - Pass `isPriority` as part of the directive payload when submitting (see Task 02 for the submission logic).
- [ ] Add CSS/Tailwind utility classes for the `priority-toggle--active` state in `packages/vscode/src/webview/styles/components/DirectiveWhisperer.css` (or the Tailwind config), using `--vscode-inputOption-activeBackground` for the active background and ensuring minimum 24px interactive target size per `[7_UI_UX_DESIGN-REQ-UI-DES-048-1]`.

## 3. Code Review
- [ ] Verify no hardcoded color values exist in `PriorityToggle.tsx`; all colors must use `var(--vscode-*)` tokens.
- [ ] Verify the checkbox is a fully controlled component (its state is driven by props, not internal `useState`).
- [ ] Verify the interactive target area is at least 24×24px via computed styles or snapshot test.
- [ ] Verify the Codicon icon is rendered using the `codicon` CSS class, not an `<img>` tag.
- [ ] Verify the component is exported correctly from the barrel `index.ts`.
- [ ] Verify no inline styles are used; all presentation is through CSS classes or VSCode tokens.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="PriorityToggle"` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="PriorityToggle"` and confirm branch and line coverage ≥ 90% for `PriorityToggle.tsx`.

## 5. Update Documentation
- [ ] In `packages/vscode/src/webview/components/DirectiveWhisperer/README.md` (create if absent), add a section describing the `PriorityToggle` sub-component: its props, behavior, and the "Immediate Pivot" semantics.
- [ ] Update the agent memory file at `specs/agent_memory/phase_11_decisions.md` (create if absent) with: "PriorityToggle is a controlled checkbox component integrated into DirectiveWhisperer. When `isPriority=true`, the directive payload's `priority` field is set to `'immediate'`."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="PriorityToggle" --reporter=json > /tmp/priority_toggle_test_results.json` and assert the JSON contains `"numFailedTests": 0`.
- [ ] Run `grep -r "var(--vscode-" packages/vscode/src/webview/components/DirectiveWhisperer/PriorityToggle.tsx` to verify at least one VSCode token reference exists in the component styles.
- [ ] Run `grep -r "hardcoded\|#[0-9a-fA-F]\{3,6\}\|rgb(" packages/vscode/src/webview/components/DirectiveWhisperer/PriorityToggle.tsx` and assert the command returns **no matches** (no hardcoded colors).

# Task: Implement Tool Invocation (Action) Typography (Sub-Epic: 26_Agent_Reasoning_Fonts)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-034-3], [6_UI_UX_ARCH-REQ-083]

## 1. Initial Test Written
- [ ] Create or update the `packages/vscode/webview/tests/ActionCard.test.tsx` file (or relevant log-view component test):
    - Verifies that tool names in an `ACTION` block (e.g., `READ_FILE`, `WRITE_FILE`) are rendered with the `font-tool-action` class.
    - Verifies that the rendered element in JSDOM has `font-family: monospace` and `font-weight: bold`.
    - Verifies that observations (e.g., tool outputs) are rendered in terminal-themed blocks using the same monospace font.

## 2. Task Implementation
- [ ] In the `ActionCard` or log-rendering component, identify the sections that render agent actions (tool calls).
- [ ] Apply the `font-tool-action` and `font-mono-bold` (or equivalent Tailwind `font-bold font-mono`) classes to the rendered tool name.
- [ ] For observations (tool results), apply terminal-themed styling including the monospace font and appropriate background (e.g., `bg-vscode-terminal-background`).
- [ ] Ensure that tool names are rendered in **Uppercase Monospace Bold** (e.g., `READ_FILE`) to signify deterministic, system-level execution, as per REQ-DES-034-3.

## 3. Code Review
- [ ] Verify that tool names are visually distinct and feel "system-level" compared to thoughts and directives.
- [ ] Ensure the monospace font used for tool actions and observations is consistent with the VSCode editor font when possible.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` in the `@devs/vscode` package to verify the tool invocation typography.

## 5. Update Documentation
- [ ] Update the `AOD` in `packages/vscode/webview/src/components/ActionCard.agent.md` to explain the typography logic and REQ-ID mapping for actions.

## 6. Automated Verification
- [ ] Run a React Testing Library script that renders an action and asserts that the tool name has the `bold` class and `monospace` font family.

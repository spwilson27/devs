# Task: Implement Human Directive Typography (Sub-Epic: 26_Agent_Reasoning_Fonts)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-034-2]

## 1. Initial Test Written
- [ ] Create or update the `packages/vscode/webview/tests/DirectiveWhisperer.test.tsx` file (or relevant log-view component test):
    - Verifies that any user-provided directive or command is rendered with the `font-human-directive` class.
    - Verifies that the rendered element has `font-weight: bold` and `font-family: system-ui`.
    - Verifies that the text color matches the `--devs-primary` accent (e.g., using `text-devs-primary`).
    - Verify that the styling signals human authority and is visually distinct from agent "thoughts".

## 2. Task Implementation
- [ ] In the `DirectiveWhisperer` or chat log component, identify the sections that render human input/directives.
- [ ] Apply the `font-human-directive` and `font-bold` classes to the rendered directive text.
- [ ] Apply the primary accent color using the Tailwind `text-devs-primary` (mapped to `--devs-primary`).
- [ ] Ensure that directives are displayed in the "System UI" font to maintain a "host-level" feel, as per REQ-DES-034-2.

## 3. Code Review
- [ ] Verify that human directives are the most visually "authoritative" elements (bold and colored).
- [ ] Ensure the font weight (`bold`) and color contrast are sufficient for readability across different VSCode themes.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` in the `@devs/vscode` package and ensure the human directive typography tests pass.

## 5. Update Documentation
- [ ] Update the `AOD` in `packages/vscode/webview/src/components/DirectiveWhisperer.agent.md` to reflect the typography and REQ-ID mapping for directives.

## 6. Automated Verification
- [ ] Run a React Testing Library script that renders a directive and asserts that it has the `bold` class and `system-ui` font family.

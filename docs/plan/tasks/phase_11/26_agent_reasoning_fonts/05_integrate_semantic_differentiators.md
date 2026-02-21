# Task: Integrate Semantic Differentiators (Sub-Epic: 26_Agent_Reasoning_Fonts)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-034], [6_UI_UX_ARCH-REQ-083]

## 1. Initial Test Written
- [ ] Create an integration test `packages/vscode/webview/tests/ConsoleView.integration.test.tsx`:
    - Renders a mock list containing a Thought, an Action, and a User Directive.
    - Asserts that each item has its specific font intent class (`font-agent-thought`, `font-tool-action`, `font-human-directive`).
    - Verifies that the overall log view exhibits visual hierarchy and agency differentiation as per REQ-ARCH-083.
    - Check that the transition from a thought (italic serif) to a tool invocation (mono bold) is clear.

## 2. Task Implementation
- [ ] In the `ConsoleView` or main log component, ensure that the data model (e.g., `SAOP_Envelope`) is correctly mapped to the appropriate rendering sub-components.
- [ ] Ensure that the global log stream applies the correct typography rules based on the agent role and message type.
- [ ] Add vertical spacers or subtle dividers between different types of intent markers (Thoughts, Actions, Observations, Directives) to enhance the visual separation.
- [ ] Ensure the "internal monologue" (Thoughts) and "system execution" (Actions) are visually distinguished from "human authority" (Directives).

## 3. Code Review
- [ ] Verify the overall "Glass-Box" look and feel where reasoning is journalistic (serif) and actions are technical (mono).
- [ ] Ensure no conflicting styles or accidental inheritance of font families between components.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` in the `@devs/vscode` package to verify the integration of semantic differentiators.

## 5. Update Documentation
- [ ] Update `docs/specs/6_ui_ux_architecture.md` (if it exists) to reflect the final implementation of semantic font differentiators.

## 6. Automated Verification
- [ ] Run a Playwright or similar E2E test that renders a sample reasoning trace and snapshots the typography for visual regression testing (optional, but recommended).

# Task: Level 3 - Environmental Fact (System Facts) UI Component (Sub-Epic: 27_Agent_Hierarchy_Authority)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-002-3]

## 1. Initial Test Written
- [ ] Create a Storybook story or a Playwright component test in `packages/vscode/webview-ui/src/components/SystemFactFrame.test.tsx` to verify the rendering of the `SystemFactFrame` component.
- [ ] Ensure the component applies the monospaced font family (`mono`).
- [ ] Verify that the component's z-index is the base priority (lowest).
- [ ] Verify that the component's font weight is light (`400`).

## 2. Task Implementation
- [ ] Implement the `SystemFactFrame` component in `packages/vscode/webview-ui/src/components/SystemFactFrame.tsx` using React.
- [ ] The component should accept `children`, an `factType` (e.g., LOG, TEST_RESULT, FILE_SNAPSHOT), and an optional `source` label.
- [ ] Apply the following styles:
    - `font-family: var(--vscode-editor-font-family)` (fallback to `monospace`)
    - `font-size: var(--vscode-editor-font-size)`
    - `line-height: 1.4` (from `7_UI_UX_DESIGN-REQ-UI-DES-035-2`)
    - `background-color: var(--vscode-editor-background)`
    - `border: 1px solid var(--vscode-editor-lineHighlightBorder)`
    - `z-index: var(--devs-z-index-system)`
    - `padding: 4px`
- [ ] Implement formatting for ANSI escape codes if the fact is a terminal log.
- [ ] Ensure the component represents "External Reality" (files, logs, tests) and is visually distinct from agent reasoning (Serif/Italic).

## 3. Code Review
- [ ] Verify that the monospaced font is correctly used for environmental facts.
- [ ] Ensure the component is "Raw" and "Technical" in appearance, facilitating data scanning.
- [ ] Confirm the component correctly reflects the base level of the Source of Truth (SoT) hierarchy.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test` or `npm run test-ct` in the `@devs/vscode` package to verify the component's rendering and styles.

## 5. Update Documentation
- [ ] Update the component library documentation to include `SystemFactFrame` and its usage for external system data like logs and file contents.

## 6. Automated Verification
- [ ] Run a style audit script to ensure `SystemFactFrame` uses the correct `z-index`, `font-family`, and `line-height` variables.

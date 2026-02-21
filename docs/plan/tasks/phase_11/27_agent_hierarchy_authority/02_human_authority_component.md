# Task: Level 1 - Human Authority (Directives) UI Component (Sub-Epic: 27_Agent_Hierarchy_Authority)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-002-1]

## 1. Initial Test Written
- [ ] Create a Storybook story or a Playwright component test in `packages/vscode/webview-ui/src/components/HumanDirectiveFrame.test.tsx` to verify the rendering of the `HumanDirectiveFrame` component.
- [ ] Ensure the component applies a high-contrast border and a bold font weight (`700`).
- [ ] Verify that the component's z-index is higher than Level 2 and Level 3 components.
- [ ] Verify that the component uses `var(--vscode-focusBorder)` for its border.

## 2. Task Implementation
- [ ] Implement the `HumanDirectiveFrame` component in `packages/vscode/webview-ui/src/components/HumanDirectiveFrame.tsx` using React.
- [ ] The component should accept `children` and an optional `priority` prop.
- [ ] Apply the following styles:
    - `border-left: 2px solid var(--vscode-focusBorder)`
    - `font-weight: 700`
    - `z-index: var(--devs-z-index-human)`
    - `padding: 8px`
    - `margin-bottom: 4px`
- [ ] Ensure the component is "Ghost" integrated, meaning it feels native to VSCode by using existing theme tokens for background and text.
- [ ] If `priority` is set to "Immediate Pivot", add a visual marker or distinct badge as specified in related requirements (e.g., `7_UI_UX_DESIGN-REQ-UI-DES-100-4`).

## 3. Code Review
- [ ] Verify that the `HumanDirectiveFrame` correctly prioritizes user input in the visual hierarchy.
- [ ] Ensure the high-contrast border is accessible and stands out from the rest of the agent flow.
- [ ] Check for proper use of VSCode theme tokens.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test` or `npm run test-ct` in the `@devs/vscode` package to verify the component's rendering and styles.

## 5. Update Documentation
- [ ] Update the component library documentation to include `HumanDirectiveFrame` and its usage for user-initiated actions and directives.

## 6. Automated Verification
- [ ] Run a style audit script to ensure `HumanDirectiveFrame` uses the correct `z-index` and `font-weight` variables.

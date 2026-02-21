# Task: Level 2 - Agent Autonomy (Reasoning) UI Component (Sub-Epic: 27_Agent_Hierarchy_Authority)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-002-2]

## 1. Initial Test Written
- [ ] Create a Storybook story or a Playwright component test in `packages/vscode/webview-ui/src/components/AgentThoughtFrame.test.tsx` to verify the rendering of the `AgentThoughtFrame` component.
- [ ] Ensure the component applies the distinct narrative font (Serif) and the alpha-blended background (`--devs-bg-thought`).
- [ ] Verify that the component's z-index is middle priority (higher than System, lower than Human).
- [ ] Verify that the component's font-style is `italic`.

## 2. Task Implementation
- [ ] Implement the `AgentThoughtFrame` component in `packages/vscode/webview-ui/src/components/AgentThoughtFrame.tsx` using React.
- [ ] The component should accept `children`, an `agentRole` (e.g., ARCHITECT, DEVELOPER, REVIEWER), and an optional `agentName`.
- [ ] Apply the following styles:
    - `font-family: var(--devs-font-serif)` (fallback to `serif`)
    - `font-style: italic`
    - `background-color: var(--devs-bg-thought)` (alpha-blended, e.g., `rgba(128, 128, 128, 0.05)`)
    - `z-index: var(--devs-z-index-agent)`
    - `line-height: 1.6` (from `7_UI_UX_DESIGN-REQ-UI-DES-035-1`)
    - `padding: 12px`
- [ ] Implement color accents based on the `agentRole` (e.g., ARCHITECT: Green, DEVELOPER: Blue, REVIEWER: Orange).
- [ ] Ensure the serif font treatment makes the reasoning narrative feel distinct from the technical logs.

## 3. Code Review
- [ ] Verify that the narrative font (Serif) is correctly used for agent reasoning as per the "Glass-Box" philosophy.
- [ ] Ensure the alpha-blended background is theme-aware and doesn't clash with dark/light themes.
- [ ] Check that the z-index hierarchy is correctly maintained.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test` or `npm run test-ct` in the `@devs/vscode` package to verify the component's rendering and styles.

## 5. Update Documentation
- [ ] Update the component library documentation to include `AgentThoughtFrame` and its usage for AI agent thoughts and strategies.

## 6. Automated Verification
- [ ] Run a style audit script to ensure `AgentThoughtFrame` uses the correct `z-index`, `font-family`, and `line-height` variables.

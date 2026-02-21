# Task: Implement Architect Agent Visual Theme (Green) (Sub-Epic: 28_Agent_Role_Colors)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-027-3]

## 1. Initial Test Written
- [ ] Create a component test `packages/vscode/src/webview/components/__tests__/ThoughtHeader.test.tsx` (or similar) for the `ThoughtHeader` or similar agent messaging header component.
- [ ] Use RTL to render the component with a `role="ARCHITECT"` property.
- [ ] Assert that the element (or its child) has the green foreground style by checking for the `--vscode-symbolIcon-classForeground` CSS variable.
- [ ] Ensure the test fails initially before applying the style.

## 2. Task Implementation
- [ ] Open the `ThoughtHeader` (or relevant message-rendering) component in `packages/vscode/src/webview/components/`.
- [ ] Import the `getAgentRoleTheme` utility from Task 1.
- [ ] Implement the styling logic for the `ARCHITECT` role by applying `color: var(--vscode-symbolIcon-classForeground)` when the message originates from an Architect agent.
- [ ] Add the Architect-specific icon (e.g., `codicon-symbol-class` or `codicon-tools`) to the header based on the role mapping.
- [ ] Ensure the header text also uses a secondary accent tint as required by `7_UI_UX_DESIGN-REQ-UI-DES-027` (Agentic differentiators).

## 3. Code Review
- [ ] Verify that the green color is applied using the VSCode theme token and not a hardcoded hex value.
- [ ] Ensure the icon chosen matches the "class/blueprint" semantic of an architect agent.
- [ ] Check for proper text contrast with the applied color using standard WCAG tools if available.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm test -- packages/vscode/src/webview/components/__tests__/ThoughtHeader.test.tsx`.
- [ ] Confirm the Architect-specific styling is correctly applied and verified.

## 5. Update Documentation
- [ ] Document the Architect role's visual identifiers in the project's design system documentation or `specs/7_ui_ux_design.md` if applicable.
- [ ] Update any agent-specific documentation files (AOD) in `.agent/` to reflect their new visual identity.

## 6. Automated Verification
- [ ] Run a snapshot test on the `ThoughtHeader` to capture and verify the rendered structure with the new styles.
- [ ] Confirm that the component handles role updates dynamically if the prop changes.

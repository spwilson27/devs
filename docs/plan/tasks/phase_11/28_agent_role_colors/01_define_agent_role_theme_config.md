# Task: Define Agent Role Theme Configuration (Sub-Epic: 28_Agent_Role_Colors)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-027]

## 1. Initial Test Written
- [ ] Create a unit test file `packages/vscode/src/webview/theme/__tests__/agent-theme.test.ts`.
- [ ] Write a test that imports a `getAgentRoleTheme` utility and verifies it returns the correct VSCode CSS variables for 'DEVELOPER', 'REVIEWER', and 'ARCHITECT' roles.
- [ ] Ensure the test fails initially because the utility and theme mapping do not exist.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/theme/agent-theme.ts`.
- [ ] Define an enum or type for `AgentRole` (e.g., `DEVELOPER`, `REVIEWER`, `ARCHITECT`).
- [ ] Implement a mapping object that associates each role with its primary VSCode theme token:
    - DEVELOPER: `--vscode-symbolIcon-functionForeground`
    - REVIEWER: `--vscode-symbolIcon-variableForeground`
    - ARCHITECT: `--vscode-symbolIcon-classForeground`
- [ ] Implement the `getAgentRoleTheme` utility function to safely retrieve these tokens based on the role.
- [ ] Export constants for default role icons (e.g., using VSCode Codicons) to support requirement `7_UI_UX_DESIGN-REQ-UI-DES-027` (Agentic differentiators).

## 3. Code Review
- [ ] Verify that the theme tokens use standard VSCode CSS variable names (`--vscode-*`) to ensure theme-awareness.
- [ ] Ensure the utility handles unknown roles gracefully with a default fallback color (e.g., `--vscode-foreground`).
- [ ] Check that the implementation is platform-agnostic for the webview.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm test -- packages/vscode/src/webview/theme/__tests__/agent-theme.test.ts`.
- [ ] Confirm all tests pass with the new implementation.

## 5. Update Documentation
- [ ] Update the UI architecture notes in `.agent/memory/phase_11.md` (or relevant AOD file) to document the new agent role visual identity system.
- [ ] Mention the specific VSCode tokens used for each role to ensure future consistency.

## 6. Automated Verification
- [ ] Run `npm run lint` on the modified files to ensure code quality standards are met.
- [ ] Validate that the `getAgentRoleTheme` function is correctly exported and accessible by other components.

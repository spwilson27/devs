# Task: Settings View & Persistent User Preferences (Sub-Epic: 13_Console_Settings_Views)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-059]

## 1. Initial Test Written
- [ ] Write a unit test for the `SettingsView` component to ensure it is rendered when the `viewMode` is set to `SETTINGS`, regardless of the project phase (REQ-062).
- [ ] Write a test for the `Tier 3: Persistent User Preferences` store to verify that settings like "Reduced Motion" or "Log Verbosity" are persisted to `vscode.globalState` (REQ-043).
- [ ] Write a test to ensure that theme synchronization works correctly when the host VSCode theme changes (REQ-029).

## 2. Task Implementation
- [ ] Create the `SettingsView` component in `@devs/vscode/src/webview/views/SettingsView.tsx` using `vscode-webview-ui-toolkit` components.
- [ ] Implement the `Tier 3` state logic in the Zustand store, bridging to the VSCode `workspaceState` or `globalState` via `postMessage`.
- [ ] Implement the "Always Available" access in the Sidebar/Navigation for the Settings view.
- [ ] Build the UI for configuring:
    - API endpoint and Model selections.
    - Token/Cost thresholds.
    - UI preferences (Reduced Motion, High Contrast Overrides).
    - Directive history management.
- [ ] Implement the "Animation Throttler" toggle and "Reduced Motion" logic in the global state to affect all visualizations (Roadmap, Pulse animations).

## 3. Code Review
- [ ] Verify that no sensitive data (like API keys) is displayed in plaintext; ensure they are handled via VSCode's `SecretStorage`.
- [ ] Confirm that all settings use the `--vscode-*` tokens for theme resilience (REQ-071).
- [ ] Ensure the component is accessible via keyboard and meets WCAG 2.1 AA contrast ratios (REQ-102).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` for the `SettingsView` and `UserPreferences` store.
- [ ] Manually verify persistence by changing a setting, reloading the window, and checking the setting's value.

## 5. Update Documentation
- [ ] Update the User Guide with a description of all available settings and their impact on the `devs` workflow.

## 6. Automated Verification
- [ ] Run a script that simulates a theme change in VSCode and verifies that the `SettingsView` updates its CSS variables accordingly within 50ms (UI-DES-026).

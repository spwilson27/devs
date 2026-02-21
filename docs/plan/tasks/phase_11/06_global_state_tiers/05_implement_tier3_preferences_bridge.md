# Task: Implement Tier 3 (Persistent) Preference Bridge (Sub-Epic: 06_Global_State_Tiers)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-043]

## 1. Initial Test Written
- [ ] Create `packages/vscode/src/state/__tests__/preferences.store.test.ts` to test `usePreferencesStore`.
- [ ] Mock the `vscode.getState()` and `vscode.setState()` functions if available in the testing environment.
- [ ] Test the `loadFromVscode()` and `saveToVscode()` actions.
- [ ] Verify that updating a preference in the store triggers a call to `vscode.setState()`.
- [ ] Test initial hydration of preferences from a mocked `vscode.getState()` object.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/state/preferences.store.ts` using `zustand`.
- [ ] Implement `usePreferencesStore` with: `themeOverride: string`, `onboardingComplete: boolean`, `preferredLayout: 'STANDARD' | 'WIDE'`.
- [ ] Add update actions: `setTheme(theme)`, `setOnboarding(complete)`, `setLayout(layout)`.
- [ ] Create a `vscodeBridge` middleware or manual effect that persists state to `vscode.getState()` whenever Tier 3 state changes.
- [ ] Implement `hydrateFromVscode()` that reads from `vscode.getState()` and populates the store on extension startup.
- [ ] Export `usePreferencesStore` for settings components.

## 3. Code Review
- [ ] Verify that Tier 3 state is NOT reset on reload, ensuring persistent behavior.
- [ ] Check for correct usage of `vscode-webview-ui-toolkit` types if applicable.
- [ ] Ensure that only Tier 3 state is persisted to `vscode.getState()`; Tier 1 and Tier 2 should remain volatile.

## 4. Run Automated Tests to Verify
- [ ] Execute `pnpm test packages/vscode/src/state/__tests__/preferences.store.test.ts`.
- [ ] Ensure 100% pass rate.

## 5. Update Documentation
- [ ] Update `packages/vscode/README.md` explaining how user preferences are persisted between sessions.
- [ ] Document the available preference keys.

## 6. Automated Verification
- [ ] Run `tsc` in `packages/vscode` to ensure no errors exist in the implementation.

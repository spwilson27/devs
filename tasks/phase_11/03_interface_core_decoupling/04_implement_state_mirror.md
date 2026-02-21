# Task: Implement Tier 2 Synchronized Project Mirror (Sub-Epic: 03_Interface_Core_Decoupling)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-003], [6_UI_UX_ARCH-REQ-008]

## 1. Initial Test Written
- [ ] Create a test `packages/vscode/tests/state_mirror.test.ts`.
- [ ] Mock an incoming state update message from the MCP bridge.
- [ ] Write a test that verifies the Zustand store updates its internal "mirror" and that a subscriber component receives the new data.
- [ ] Test the "Thin UI" constraint: verify that attempting to modify the state directly (without an MCP tool call) is impossible or results in a console error.

## 2. Task Implementation
- [ ] Implement the `useProjectStore` (Tier 2) in `packages/vscode/src/webview/store/projectStore.ts` using Zustand.
- [ ] Create an `applyStateDelta` reducer that handles incremental updates to the project mirror.
- [ ] Implement the "Strict Observational" guard: the store should only have `readonly` properties for business data, with setters only for UI-local state (Tier 1).
- [ ] Hook the store into the `window.message` listener created in Task 03 to enable real-time hydration.

## 3. Code Review
- [ ] Verify that the store is "Normalized" (REQ-042) to prevent redundant data and complex update logic.
- [ ] Ensure that no derived business logic (e.g., "Is task completed?") is computed in the store; it should simply reflect what the MCP resource provided.
- [ ] Check for the presence of the `desync_detection` logic that requests a full state refresh if a `sequence_id` is skipped.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/vscode/tests/state_mirror.test.ts` and ensure the store remains synchronized and protected.

## 5. Update Documentation
- [ ] Update `phases/phase_11.md` or a local `STATE_MANAGEMENT.md` to reflect the completion of the Tier 2 mirror.

## 6. Automated Verification
- [ ] Run `npm run lint` on the webview package and ensure no forbidden state mutations are detected in the components.

# Task: TDD Lifecycle & Status Visualization (Sub-Epic: 101_Interface_DOD_Polish)

## Covered Requirements
- [4_USER_FEATURES-REQ-037]

## 1. Initial Test Written
- [ ] Create a unit test for the `TaskCard` component in `@devs/vscode` webview.
- [ ] Mock the task status with different TDD phases: `ESTABLISHED` (Red), `IMPLEMENTING` (Amber), and `MET` (Green).
- [ ] Verify that the component renders the corresponding Codicons (`error`, `gear`, `check`) with correct theme-aware coloring (e.g., `text-red-600` via VSCode tokens).
- [ ] Add a test case for `npm test` failure/success integration: verify that the `TaskCard` updates its status banner immediately upon receiving a `TEST_RESULT` event.

## 2. Task Implementation
- [ ] In the `TaskCard` or `ActiveTaskView` component, implement status indicators that clearly differentiate between "Test Established" (Red) and "Requirement Met" (Green).
- [ ] Map the task status from the `@devs/core` orchestrator to the visual representation in the UI.
- [ ] Use `@vscode/codicons` to show clear, recognizable status markers next to each task ID.
- [ ] Integrate with the state stream to show a live "Red/Green" banner during implementation turns.
- [ ] Ensure that for each `npm test` execution, the failure output is accessible directly from the status indicator (tooltip or expander).

## 3. Code Review
- [ ] Verify that the TDD status is prominent enough for a user to instantly identify if an agent has met its requirement.
- [ ] Check accessibility: ensure screen readers announce status changes (e.g., "Requirement Met").
- [ ] Confirm no hardcoded colors; use `--vscode-charts-red`, `--vscode-charts-green`.

## 4. Run Automated Tests to Verify
- [ ] Run `vitest` in the webview package to confirm TDD status rendering logic.
- [ ] Execute a manual end-to-end trace with a mock project and verify the "Red to Green" transition in the UI.

## 5. Update Documentation
- [ ] Update the `User Features` document with screenshots or descriptions of the TDD Status UI.
- [ ] Ensure the AOD documentation for the `TaskCard` component explains the mapping of core task states to UI indicators.

## 6. Automated Verification
- [ ] Run the `validate-all` script in the VSCode extension package and verify that the TDD-related components pass 100% of functional tests.

# Task: Console View Scaffolding & Routing (Sub-Epic: 13_Console_Settings_Views)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-058]

## 1. Initial Test Written
- [ ] Write a unit test for the `ConsoleView` component to ensure it renders the `ThoughtStreamer`, `ToolLog`, and `DirectiveWhisperer` sub-components.
- [ ] Write an integration test for the `ViewRouter` (State-Driven Virtual Router) to verify that navigating to `/console` correctly renders the `ConsoleView` only when the project phase is 4 or higher (REQ-062).
- [ ] Write a test to ensure that the `ConsoleView` is a "Thin UI" (observational only), verifying it doesn't contain business logic for state transitions (REQ-003).

## 2. Task Implementation
- [ ] Create the `ConsoleView` component in `@devs/vscode/src/webview/views/ConsoleView.tsx`.
- [ ] Implement the `ViewRouter` logic using the Tier 1 Global UI State (Zustand) to handle the `viewMode: 'CONSOLE'` state.
- [ ] Implement the `Incremental View Unlocking` logic to gate access to the Console view until Phase 4 is active.
- [ ] Scaffold the `ToolLog` (Action/Observation Log) and `DirectiveWhisperer` (HITL Input) components within the `ConsoleView` layout.
- [ ] Ensure the layout is a split-pane or multi-pane design as per the architecture (Sidebar persistent, MainView transitions).
- [ ] Implement the `Active Task Lock` logic (REQ-067) that warns the user if they navigate away from the Console while a critical HITL gate is active.

## 3. Code Review
- [ ] Verify that no hardcoded colors are used; use VSCode CSS variables like `--vscode-editor-background` (REQ-071).
- [ ] Ensure the component utilizes the `vscode-webview-ui-toolkit` primitives for accessibility and platform parity.
- [ ] Confirm the implementation of `Shadow DOM` isolation for Tailwind CSS (REQ-070).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` in the `@devs/vscode` package to verify routing and scaffolding.

## 5. Update Documentation
- [ ] Update the `ViewRouter` documentation to include the new `/console` route and its access requirements.

## 6. Automated Verification
- [ ] Execute a script that checks the component tree of the built Webview to ensure `ConsoleView` is rendered with its expected sub-components when the state is set to Phase 4.

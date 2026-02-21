# Task: Develop Active Task Card UI (Sub-Epic: 31_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-036]

## 1. Initial Test Written
- [ ] Create a unit test `test_active_task_card.tsx` (or equivalent for CLI/VSCode) to mount the `ActiveTaskCard` component.
- [ ] Provide mock state props to the component including `task_title`, `status`, and specifically a `req_id` (e.g., `REQ-036`).
- [ ] Assert that the DOM/CLI output correctly renders the Task Title, Status, and REQ-ID visibly.

## 2. Task Implementation
- [ ] Implement the `ActiveTaskCard` component for both the CLI (using an interactive TUI library like ink/blessed) and the VSCode Webview sidebar.
- [ ] Wire the component to the orchestrator's real-time state stream (RTES) to listen for `TASK_STARTED` and `TASK_UPDATED` events.
- [ ] Extract the `req_id` from the current active node in the LangGraph state and ensure it's propagated in the payload.

## 3. Code Review
- [ ] Check that the component does not introduce unnecessary re-renders when other non-task events fire.
- [ ] Verify that the styling matches the established design system (e.g., fonts, padding, color for active states).
- [ ] Ensure gracefully fallback UI is rendered when no task is active.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:ui -- active_task_card` to ensure unit tests and snapshot tests pass.
- [ ] Run the CLI TUI test suite to verify the card appears correctly in the terminal output.

## 5. Update Documentation
- [ ] Update the `UI/UX Architecture` document to include the `ActiveTaskCard` component in the component library.
- [ ] Document the required payload structure for `TASK_STARTED` to explicitly include `req_id` in `specs/2_tas.md`.

## 6. Automated Verification
- [ ] Execute an automated UI test (e.g., Playwright/Puppeteer) that connects to a mock MCP server broadcasting a task start event, and verify the `ActiveTaskCard` appears with the correct REQ-ID.

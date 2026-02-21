# Task: Delta-Based Review Interface to Mitigate Approval Fatigue (Sub-Epic: 20_Security Alert Table and Escalation UI)

## Covered Requirements
- [8_RISKS-REQ-117]
- [1_PRD-REQ-GOAL-003]

## 1. Initial Test Written
- [ ] In `src/webview/__tests__/DeltaReviewPanel.test.tsx`, write React Testing Library tests for a `<DeltaReviewPanel />` component:
  - Test that it renders a unified diff view (using a `<DiffViewer />` sub-component) given `beforeContent: string` and `afterContent: string` props.
  - Test that changed lines are highlighted (added lines green, removed lines red, context lines neutral).
  - Test that clicking "Approve" calls the `onApprove()` callback.
  - Test that clicking "Request Changes" reveals a `<textarea>` for feedback and an "Submit Feedback" button.
  - Test that "Submit Feedback" calls `onRequestChanges(feedback: string)` with the textarea content and is disabled when feedback is empty.
  - Test that the component renders a collapsible "Unchanged Context" section showing ±5 lines around each change, with a "Show all" toggle to expand the full diff.
  - Test that an `approvalType: 'DOCUMENT' | 'CODE' | 'ARCHITECTURE'` prop changes the panel header label accordingly.
  - Test that a `metadata` prop `{ taskId, taskTitle, reqIds: string[] }` is rendered in a summary bar at the top of the panel, showing the linked requirement IDs as clickable chips.
  - All tests must be written and failing before implementation.
- [ ] In `src/webview/__tests__/ApprovalQueue.test.tsx`:
  - Test that `<ApprovalQueue />` renders a numbered list of pending approvals from an `approvals: ApprovalItem[]` prop.
  - Test that selecting an approval item renders the `<DeltaReviewPanel />` for that item.
  - Test that after approving, the item is removed from the queue and the next item is auto-selected.
  - Test that a "Skip All" button dispatches `SKIP_ALL_APPROVALS` message.

## 2. Task Implementation
- [ ] Create `src/webview/components/DiffViewer.tsx`:
  - Accept `{ before: string; after: string; contextLines?: number }` props.
  - Compute a unified diff using the `diff` npm package (`import { createPatch } from 'diff'`).
  - Render each hunk with: green `+` lines, red `-` lines, grey context lines.
  - Implement a `showAll` toggle state – by default show only ±`contextLines` (default 5) around changes; when `showAll` is true, show the full file.
  - Use `<pre>` / `<code>` blocks with monospace font and horizontal scrolling for long lines.
- [ ] Create `src/webview/components/DeltaReviewPanel.tsx`:
  - Props: `{ beforeContent: string; afterContent: string; approvalType: 'DOCUMENT' | 'CODE' | 'ARCHITECTURE'; metadata: { taskId: string; taskTitle: string; reqIds: string[] }; onApprove: () => void; onRequestChanges: (feedback: string) => void; }`.
  - Render a summary bar showing `approvalType`, `taskId`, `taskTitle`, and `reqIds` as badge chips.
  - Render `<DiffViewer before={beforeContent} after={afterContent} />`.
  - Render action footer with "Approve" (green) and "Request Changes" (amber) buttons.
  - On "Request Changes" click: show a `<textarea>` and "Submit Feedback" button (disabled when empty).
- [ ] Create `src/webview/components/ApprovalQueue.tsx`:
  - Props: `{ approvals: ApprovalItem[]; onApprove: (id: string) => void; onRequestChanges: (id: string, feedback: string) => void; onSkipAll: () => void; }`.
  - Local state: `selectedId: string | null` (auto-select the first item).
  - Render a left sidebar list of approval items (numbered, showing `taskTitle` and `approvalType`).
  - Render the selected `<DeltaReviewPanel />` in the main content area.
  - After approve/requestChanges, advance `selectedId` to the next pending item.
  - Render a "Skip All (N remaining)" button that calls `onSkipAll`.
- [ ] Add `ApprovalItem` type to `src/shared/types.ts`: `{ id: string; taskId: string; taskTitle: string; approvalType: 'DOCUMENT'|'CODE'|'ARCHITECTURE'; beforeContent: string; afterContent: string; reqIds: string[]; }`.
- [ ] Wire into `DashboardPanel.tsx`:
  - Add a "Review Queue" tab.
  - On `APPROVAL_ITEMS_UPDATED` message, update local `approvals` state.
  - Dispatch `APPROVE_ITEM` / `REQUEST_CHANGES` / `SKIP_ALL_APPROVALS` messages to the extension host.
- [ ] In `src/extension/webviewMessageHandler.ts`:
  - Handle `APPROVE_ITEM`: mark the approval record in the DB as approved; advance the orchestrator.
  - Handle `REQUEST_CHANGES`: inject the feedback as a directive into the relevant task context; re-queue the task.
  - Handle `SKIP_ALL_APPROVALS`: approve all pending items with a `"auto-approved"` annotation in the DB.
- [ ] In the orchestrator, before emitting any checkpoint that requires human review (document approval, code review junction), push an `ApprovalItem` to the queue and pause execution until the item is resolved.

## 3. Code Review
- [ ] Verify `DiffViewer` uses the `diff` library and does NOT implement its own diff algorithm.
- [ ] Verify `DeltaReviewPanel` is stateless with respect to approval outcomes – all state flows up via callbacks.
- [ ] Verify `ApprovalQueue` auto-advances after each approval rather than requiring the user to manually select the next item (reduces fatigue).
- [ ] Verify that `reqIds` chips in the summary bar are rendered with `aria-label="Requirement {id}"` for screen readers.
- [ ] Verify the "Skip All" button requires no confirmation (it is a deliberate power-user shortcut, documented as such).
- [ ] Verify `beforeContent` / `afterContent` are never stored in the Redux/component store for longer than needed – they should be ephemeral in the `ApprovalItem` queue.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="DeltaReviewPanel|DiffViewer|ApprovalQueue"` and confirm all tests pass.
- [ ] Run `npm run lint` and `npm run typecheck` with zero errors.
- [ ] Run `npm run build:webview` and confirm successful compilation.

## 5. Update Documentation
- [ ] Create `src/webview/components/DeltaReviewPanel.agent.md`:
  - Document the three `approvalType` values and when each is used.
  - Document the `onApprove` and `onRequestChanges` callback contracts.
- [ ] Create `src/webview/components/ApprovalQueue.agent.md`:
  - Document the `ApprovalItem` type.
  - Document the message protocol (`APPROVAL_ITEMS_UPDATED`, `APPROVE_ITEM`, `REQUEST_CHANGES`, `SKIP_ALL_APPROVALS`).
  - Document the design decision to auto-advance after each approval (mitigates approval fatigue per `8_RISKS-REQ-117`).
- [ ] Update `src/webview/README.md` to list `DeltaReviewPanel`, `DiffViewer`, and `ApprovalQueue` in the component inventory.
- [ ] Update the orchestrator's `checkpoints.agent.md` to document how approval junctions integrate with the `ApprovalQueue`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="DeltaReviewPanel|DiffViewer|ApprovalQueue" --coverage` and confirm coverage ≥ 90% for each of the three new components.
- [ ] Run the E2E approval queue scenario: `npx playwright test tests/e2e/approval-queue.spec.ts` that:
  1. Simulates 3 pending approval items in the queue.
  2. Approves the first, requests changes on the second, and verifies auto-advance behavior.
  3. Clicks "Skip All" on the remaining item and verifies the queue is empty.

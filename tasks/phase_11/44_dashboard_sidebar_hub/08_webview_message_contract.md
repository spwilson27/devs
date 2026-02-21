# Task: Webview<->Extension Message Contract & Batching (Sub-Epic: 44_Dashboard_Sidebar_Hub)

## Covered Requirements
- [1_PRD-REQ-INT-007], [4_USER_FEATURES-REQ-006]

## 1. Initial Test Written
- [ ] Write integration tests at tests/extension/webview-messages.test.ts that mock the WebviewViewProvider and verify:
  - When the webview sends `{ type: 'getDashboardData' }` the extension responds with `{ type: 'dashboardData', payload: { activeEpic, taskTree, agents } }` within 100ms under normal conditions.
  - When rapid updates occur, the extension batches dashboard update events and emits at most one `dashboardDataUpdate` per 50ms interval.
  - When the webview sends `{ type: 'requestReviewPreview', payload: { specId } }` the extension streams back chunks `reviewChunk` messages and ends with `{ type: 'reviewComplete' }`.

## 2. Task Implementation
- [ ] Define a JSON schema for the contract in specs/message-contracts/dashboard.json describing message types: getDashboardData, dashboardData, dashboardDataUpdate, requestReviewPreview, reviewChunk, reviewComplete, error.
- [ ] Implement message handling in src/extension/dashboardSidebarProvider.ts:
  - In resolveWebviewView, set webview.onDidReceiveMessage(msg => handleMessage(msg, webview));
  - Implement handleMessage to respond to getDashboardData by reading project state (mocked API) and posting a dashboardData message.
  - Implement a batching buffer (50ms) for frequent datastore changes: use a simple debounce/batch function that collects state changes and posts a single `dashboardDataUpdate` message with the merged diff.
- [ ] Add defensive validation: validate incoming messages against the schema and respond with `{type:'error', message}` on invalid requests.

## 3. Code Review
- [ ] Validate message schema completeness and versioning (include a `contractVersion` field in messages).
- [ ] Ensure no large binary data is sent; if needed, provide resource URIs instead.
- [ ] Ensure error paths are tested and do not crash the provider.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- tests/extension/webview-messages.test.ts` and confirm all message contract tests pass.

## 5. Update Documentation
- [ ] Add specs/message-contracts/dashboard.json to the repo and document the contract in docs/message_contracts.md with examples and a note about batching (50ms throttle).

## 6. Automated Verification
- [ ] Add a CI verification step that runs the message tests and a small simulation that fires 100 state updates and asserts that the provider emitted <= (100 / 50ms + margin) update messages.

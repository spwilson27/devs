# Task: Implement postMessage ingestion and batching for ThoughtStreamer (Sub-Epic: 57_ThoughtStreamer_Component)

## Covered Requirements
- [1_PRD-REQ-INT-009], [6_UI_UX_ARCH-REQ-015]

## 1. Initial Test Written
- [ ] Create an integration test at src/ui/components/__tests__/ThoughtStreamer.postmessage.spec.tsx that simulates window.postMessage or the webview message API sending a stream of events with shape { id, type: 'THOUGHT'|'ACTION'|'OBS', text, timestamp } and asserts that messages are appended in correct order and rendered with correct data-type attributes.

## 2. Task Implementation
- [ ] Implement src/ui/lib/thoughtStreamIngest.ts:
  - Handler that validates incoming messages (use zod or a lightweight schema) and normalizes to the component message shape.
  - Implement a batching buffer that accumulates incoming events for a short window (e.g., 16ms–50ms) and applies a single state update to the ThoughtStreamer store (Zustand or component state) to avoid thrash and to meet UI throttling rules.
  - Ensure deduplication by message id and safe removal of event listeners on unmount.
  - Provide a clear API for the extension host to send { type:'THOUGHT', payload } via vscode.postMessage or window.postMessage.

## 3. Code Review
- [ ] Ensure schema validation exists, batching uses requestAnimationFrame or setTimeout with clear cancellation, state updates are atomic, handler cleanup occurs on unmount, and no synchronous blocking work occurs.

## 4. Run Automated Tests to Verify
- [ ] Run the new integration tests and a manual dev harness where the extension host sends 500 messages quickly and verify UI remains responsive and messages appear in order.

## 5. Update Documentation
- [ ] Add an example snippet for extension host code (vscode.postMessage({ type: 'THOUGHT', id, text, timestamp })) and document the ingestion schema and batching behavior in docs/ui/thoughtstreamer.md.

## 6. Automated Verification
- [ ] CI integration: add an integration test that sends N messages and asserts store length equals N, and that UI node count remains under virtualization threshold when virtualization is enabled.

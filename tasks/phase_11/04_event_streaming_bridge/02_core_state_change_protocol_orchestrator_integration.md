# Task: Core: STATE_CHANGE Protocol & Orchestrator Integration (Sub-Epic: 04_Event_Streaming_Bridge)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-010]

## 1. Initial Test Written
- [ ] In `@devs/core/src/orchestrator/orchestrator.test.ts`, create a test case that expects a `STATE_CHANGE` event to be emitted.
- [ ] Mock the `EventEmitter` or the `MessageBatcher` and verify that when a LangGraph node completes, a `STATE_CHANGE` event containing the new project state or a reference to it (e.g., project ID, task ID) is broadcast.
- [ ] Verify that the `STATE_CHANGE` event contains a `sequence_id` to prevent desync in the UI.
- [ ] Ensure that a `STATE_CHANGE` event is emitted at the beginning and end of each task implementation turn.

## 2. Task Implementation
- [ ] Update the Orchestrator's internal event logic in `@devs/core/src/orchestrator/` to emit `STATE_CHANGE` events.
- [ ] Define the `STATE_CHANGE` event schema in `@devs/core/src/protocol/events.ts`.
- [ ] The event should include at least the `project_id`, `active_task_id`, `active_phase_id`, and a `timestamp`.
- [ ] It should also include a `sequence_id` that increments with every write to the SQLite "Flight Recorder".
- [ ] Hook the Orchestrator's LangGraph `checkpoint` callback to trigger the `STATE_CHANGE` emission, ensuring that the UI updates reflect the most recent ACID-compliant state in the database.

## 3. Code Review
- [ ] Verify that `STATE_CHANGE` events are only emitted after a successful write to the SQLite database.
- [ ] Ensure that the event payload is minimal to avoid overhead (relying on the UI to fetch deltas or perform partial refreshes from the database).
- [ ] Confirm that error states (failed transitions) also emit a `STATE_CHANGE` event with error metadata.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test @devs/core` and specifically verify orchestrator event emission.
- [ ] Run an integration test that performs a mock project development cycle and logs all emitted `STATE_CHANGE` events to a JSON file for inspection.

## 5. Update Documentation
- [ ] Update the `MCP and AI Development Design` document (or its distilled requirements) to include the `STATE_CHANGE` protocol details.
- [ ] Document how the `sequence_id` should be used by the UI to detect and recover from state desync.

## 6. Automated Verification
- [ ] Use a trace-analysis script to confirm that for every 10 state-mutating operations in the Orchestrator, exactly 10 `STATE_CHANGE` events were emitted.

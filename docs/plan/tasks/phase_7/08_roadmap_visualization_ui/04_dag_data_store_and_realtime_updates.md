# Task: Implement DAG Data Store and Realtime Updates (Sub-Epic: 08_Roadmap_Visualization_UI)

## Covered Requirements
- [1_PRD-REQ-UI-006], [4_USER_FEATURES-REQ-033]

## 1. Initial Test Written
- [ ] Write unit tests for the DAG store at tests/stores/dagStore.test.(ts|js) verifying:
  - Inserting epics/tasks produces stable node/edge collections.
  - Updating a task status emits an update event containing the changed node and aggregate progress.
  - Concurrent updates are serialized and result in a consistent final state.

## 2. Task Implementation
- [ ] Implement src/server/stores/dagStore.(ts|js):
  - Provide API: load(initialData), getSnapshot(), updateTaskStatus(taskId, status), onChange(callback).
  - Implement websocket (or server-sent events) broadcasting on change at /ws/roadmap or /sse/roadmap endpoints.
  - Persist snapshots optionally to a simple file-based store (e.g., JSON file under data/roadmap-snapshots/) to survive restarts for local dev.

## 3. Code Review
- [ ] Validate that store APIs are asynchronous, handle error conditions, and provide deterministic ordering guarantees (sequence ID or vector clock). Verify event payloads are minimal and include taskId, newStatus, timestamp, and originating REQ-IDs.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests and an integration test that starts the server, connects a websocket client, triggers an update, and asserts the client receives the correct event payload and aggregate progress values.

## 5. Update Documentation
- [ ] Document the store API and event payload schema in docs/roadmap_store.md and add instructions for local persistence path and rotation policy.

## 6. Automated Verification
- [ ] Add a script `scripts/verify_dag_store.sh` that seeds the store, performs a set of deterministic updates, and asserts the final snapshot matches the expected JSON file in tests/fixtures/expected_snapshot.json.
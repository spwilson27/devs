# Task: Implement Epic Commencement Checkpoint UI & Backend (Sub-Epic: 06_Roadmap_Planner_And_Gates)

## Covered Requirements
- [1_PRD-REQ-UI-004]

## 1. Initial Test Written
- [ ] Create integration tests at tests/phase_7/test_epic_commence_endpoint.py using pytest (and Playwright/selenium if UI tests exist):
  - test_commence_endpoint_blocks_when_gate_fails: Use a test client to POST /api/epics/{epic_id}/commence with an epic that fails evaluate_epic_start and assert HTTP 403 and JSON body containing reasons array.
  - test_commence_endpoint_succeeds_and_transitions_state: For an epic passing the epic start gate, POST to commence should return 200 and the epic state should be updated to 'in_progress' in the project store.
  - test_ui_shows_commence_button_disabled: Render a minimal UI component (EpicCommenceButton) in a headless test and assert the button is disabled and shows the gate reasons when the gate fails.
- [ ] Mock evaluate_epic_start and project store for deterministic behavior and offline tests.

## 2. Task Implementation
- [ ] Backend:
  - Add or extend src/api/roadmap_endpoints.py to include POST /api/epics/{epic_id}/commence (or integrate with existing API router).
  - Endpoint behavior:
    - Validate request and user authorization (use existing auth utilities; stub simple role check for tests).
    - Call evaluate_epic_start(epic, project_state).
    - If not allowed, return 403 with JSON {"allowed": false, "reasons": [...], "code": "EPIC_START_BLOCKED"}.
    - If allowed, atomically set epic.state='in_progress' in project store and emit 'epic_commenced' event (log + event bus stub).
  - Add unit tests for endpoint logic using test client fixtures.
- [ ] UI stub:
  - Implement web/ui/components/EpicCommenceButton.(js|tsx):
    - Props: epicId
    - On mount fetch /api/epics/{epicId}/status or provided API to determine gate status and reasons.
    - Render a button with data-testid="epic-commence-button" that is disabled when gate not allowed and shows a tooltip/modal with reasons when clicked or hovered.
    - Implement minimal CSS and ensure accessibility attributes (aria-disabled, aria-label).
  - Keep UI component small and testable with data-testid hooks.

## 3. Code Review
- [ ] Ensure API adheres to RESTful error codes and does not leak sensitive internal details.
- [ ] Verify UI component is accessible and has deterministic behavior for tests.
- [ ] Confirm authentication/authorization is enforced and tested (at least a stubbed role check in tests).

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/phase_7/test_epic_commence_endpoint.py
- [ ] If Playwright/selenium tests are present, run them headlessly (npx playwright test or pytest-playwright) to validate the UI component states.

## 5. Update Documentation
- [ ] Add docs/roadmap/ui_epic_commence.md containing the API contract (request/response examples), UI component props and expected behaviors, and guidance for integrating the component into the Roadmap webview.
- [ ] Update docs/phase_7.md to reference the Epic Commencement Checkpoint and list how UI and backend interact.

## 6. Automated Verification
- [ ] Add ci/verify_epic_commence.sh script that runs backend tests, then uses a test client to hit the commence endpoint with sample fixtures and asserts responses and state transitions.
- [ ] Add a simple smoke test that instantiates the UI component in a headless DOM and asserts button state transitions for allowed/blocked scenarios.

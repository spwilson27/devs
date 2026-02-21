# Task: End-to-end integration tests for Blueprint Gate flow (Wait-for-Approval, Persistence, Freeze, Checksum) (Sub-Epic: 11_Blueprint Gate Logic)

## Covered Requirements
- [9_ROADMAP-REQ-008], [9_ROADMAP-REQ-002], [9_ROADMAP-TAS-404], [8_RISKS-REQ-062]

## 1. Initial Test Written
- [ ] Write a single deterministic end-to-end test at tests/e2e/test_blueprint_gate_flow.py that exercises the whole gate flow. The test should:
  - create a small blueprint document under a temp repo dir
  - call the Approval API to create an approval token for that document and assert token stored with checksum
  - start a LangGraph execution that includes a WaitForApproval node targeting that token; assert execution is suspended (non-complete)
  - call the Approval API to approve the token (simulate approver)
  - assert the LangGraph execution resumes and completes successfully
  - attempt to modify a protected core file without approval and assert it's blocked
  - attempt the same modification with a valid approved token and assert success
  - assert checksum verification passes at each relevant point

## 2. Task Implementation
- [ ] Implement the e2e test harness and necessary test fixtures:
  - Add a lightweight test server fixture that boots the app in test mode and exposes API endpoints and in-memory event bus.
  - Add a LangGraph runner fixture that can execute simple graphs and expose hooks to observe node states (suspended/resumed/completed).
  - The test should be fully automated (no human input) and run within CI time limits; use fast timeouts and in-memory backends where possible.
  - Provide reusable helper utilities in tests/helpers/e2e_helpers.py to: create docs, compute checksum, create approval token, poll for execution state, and approve tokens programmatically.

## 3. Code Review
- [ ] Review the E2E test for flakiness and ensure deterministic assertions:
  - Use explicit timeouts and retries with exponential backoff for network/async operations
  - Avoid sleeping for long intervals; prefer event-driven waiting (listen for resume event)
  - Ensure cleanup of created temporary files and DB rows after test completes
  - Ensure the test asserts both positive and negative cases (blocked without approval, allowed with approval)

## 4. Run Automated Tests to Verify
- [ ] Provide a script tests/e2e/run_blueprint_gate_flow.sh that sets up the test environment and runs pytest -q tests/e2e/test_blueprint_gate_flow.py. Run the script locally and in CI to verify the gate end-to-end.

## 5. Update Documentation
- [ ] Add docs/blueprint-gate/e2e.md that documents what the E2E test covers, how to run it locally, and the expected outputs. Include diagrams (mermaid) for the full flow: Document -> ApprovalToken -> LangGraph Wait -> Approver -> Resume -> Architecture Freeze checks.

## 6. Automated Verification
- [ ] Wire this E2E script into the phase-6 gating CI job (or create a CI job script tests/ci/phase6_blueprint_gate.yml) that runs the E2E harness and fails the job when the E2E test fails. The CI step must exit non-zero on any mismatch and publish test logs for debugging.

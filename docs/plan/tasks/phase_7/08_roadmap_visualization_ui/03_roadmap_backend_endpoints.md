# Task: Add Roadmap Backend Endpoints (Sub-Epic: 08_Roadmap_Visualization_UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-033], [1_PRD-REQ-UI-006]

## 1. Initial Test Written
- [ ] Write integration tests at tests/api/roadmap.api.test.(ts|js) that start the test server (or use supertest) and assert the following endpoints:
  - GET /api/roadmap -> 200 JSON { epics: [ { id, title, tasks: [...] } ], meta: { generated_at } }
  - GET /api/roadmap/progress -> 200 JSON { dag: { nodes: [...], edges: [...] }, progress_summary: { completed, total } }
  - POST /api/roadmap/approve -> 200 when payload { epicId, approver, decision:"approve" } is valid (used for approval UI flows).
  - Tests must seed an in-memory store with a deterministic roadmap and assert shape and values.

## 2. Task Implementation
- [ ] Implement route handlers/controllers at src/server/routes/roadmap.(ts|js) and connect them to the core DAG/roadmap store.
  - Implement minimal business logic: assemble epics array, include task statuses, and compute progress_summary.
  - Validate inputs and return standardized error responses.
  - Implement authorization stub (middleware) that can be replaced by real auth; tests should bypass or mock it.

## 3. Code Review
- [ ] Verify that API contracts are stable, documented (OpenAPI snippet), and that responses include traceability fields linking tasks back to their originating REQ-IDs (e.g., task.trace = ["4_USER_FEATURES-REQ-014"]). Ensure good error handling and no sensitive info leaked.

## 4. Run Automated Tests to Verify
- [ ] Run the integration tests: `npm run test:api -- tests/api/roadmap.api.test` and verify all endpoints return expected shapes and status codes.

## 5. Update Documentation
- [ ] Add an API spec fragment in docs/api.md documenting the three routes above, example requests/responses, and the required fields used by the UI.

## 6. Automated Verification
- [ ] Add a script `scripts/verify_roadmap_api.sh` that launches the server in test mode, calls GET /api/roadmap and GET /api/roadmap/progress and asserts JSON schema matches expected fields including that at least one task includes a trace to `4_USER_FEATURES-REQ-014`.
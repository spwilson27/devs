# Task: Implement MCP Server Scaffold and Agent-Oriented Documentation (Sub-Epic: 04_1_PRD)

## Covered Requirements
- [1_PRD-REQ-GOAL-004]

## 1. Initial Test Written
- [ ] Create unit tests first using pytest at `tests/unit/test_mcp_server.py`.
  - Tests to write (exact assertions):
    - test_health_endpoint:
      - Use FastAPI's TestClient (or starlette TestClient) to call GET /health
      - assert response.status_code == 200 and response.json() == {"status": "ok"}
    - test_agent_docs_endpoint_returns_schema:
      - Call GET /agent/docs
      - assert response.status_code == 200 and response.json() contains keys ["endpoints", "version"]
    - test_agent_execute_request_validation:
      - Call POST /agent/execute with invalid payload and assert 422 or validation error is returned

Provide exact requests and expected responses so an agent can implement tests verbatim.

## 2. Task Implementation
- [ ] Implement a minimal MCP server scaffold at `src/mcp_server.py` using FastAPI (recommended) with the following endpoints and behaviors:
  - GET /health -> returns JSON {"status": "ok"}
  - GET /agent/docs -> returns a small JSON schema describing available agent endpoints, payload shapes, and version info
  - POST /agent/execute -> accepts JSON {"task_id": str, "payload": dict} and returns {"status": "accepted", "task_id": str}
  - POST /agent/profile -> accepts profiling data, returns 200
- [ ] Use Pydantic models for request validation and provide clear error responses for invalid input.
- [ ] Add a small, optional API-Key header check (configurable) to demonstrate authentication placeholder logic.
- [ ] Do not implement persistent storage; keep the scaffold in-memory and deterministic for testing.

## 3. Code Review
- [ ] Verify the server implementation:
  - Uses Pydantic for request validation.
  - Endpoints are documented and return deterministic responses.
  - No secrets are hard-coded; authentication is a placeholder expecting an environment variable if enabled.
  - Tests run without starting an external server by using TestClient.

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/unit/test_mcp_server.py -q` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add `docs/mcp_server.md` containing:
  - API endpoint list and JSON schemas for request/response.
  - Local run instructions (how to run with Uvicorn for manual testing).
  - Example curl commands for each endpoint.
  - Note describing that this is a scaffold and where to extend for production (auth, persistence, rate-limiting).

## 6. Automated Verification
- [ ] Add `scripts/verify_mcp_server.sh` that runs the unit tests using TestClient and exits non-zero if any test fails. The script should not start a real server; it must use the FastAPI TestClient to avoid I/O in CI.

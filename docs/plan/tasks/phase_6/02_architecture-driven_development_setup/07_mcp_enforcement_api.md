# Task: Expose Blueprint Status via MCP API and enforce via MCP (Sub-Epic: 02_Architecture-Driven Development Setup)

## Covered Requirements
- [1_PRD-REQ-PIL-002], [3_MCP-REQ-GOAL-002]

## 1. Initial Test Written
- [ ] Create `tests/phase_6/test_mcp_blueprint_endpoint.py`:
  - Start a test instance of the project's MCP server or a minimal FastAPI/Flask app `src/mcp/blueprint_api.py` exposing `/mcp/blueprint-status`.
  - Test `test_blueprint_status_endpoint()` queries the endpoint and asserts JSON response contains keys for `prd` and `tas` with values `{approved: bool, token: str|null, checksum: str}`.
  - Test `test_mcp_enforcement()` simulates a Developer Agent calling MCP `/mcp/blueprint-status` and expects enforcement logic to return `allowed: false` when unapproved.

## 2. Task Implementation
- [ ] Implement `src/mcp/blueprint_api.py` (or integrate into existing MCP server) with:
  - Endpoint `GET /mcp/blueprint-status` that returns `{ "documents": { "prd": {"approved": bool, "token": str|null, "checksum": str}, "tas": {...} } }`.
  - An enforcement helper `mcp.enforce_blueprint_allowed()` that Developer Agents can call before starting implementation; this helper should return HTTP 423 (Locked) or a structured JSON indicating blocked status.
  - Ensure endpoint is read-only, rate-limited, and requires an API key or internal auth if the project already has an MCP auth mechanism (tests may use a test key).

## 3. Code Review
- [ ] Verify: API is stable, responses are machine-readable, authentication is pluggable, and the implementation does not allow bypass (e.g., no fallback to file-system if API indicates blocked).

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/phase_6/test_mcp_blueprint_endpoint.py` ensuring endpoint responses conform to the spec and enforcement behaves as expected.

## 5. Update Documentation
- [ ] Add "MCP Blueprint API" to `docs/architecture_add.md` with example request/response JSON, auth requirements, and how Developer Agents should call the endpoint before implementation.

## 6. Automated Verification
- [ ] CI: `pytest -q tests/phase_6/test_mcp_blueprint_endpoint.py && curl -sS http://localhost:8000/mcp/blueprint-status | jq .` (test harness must start server prior to checking).
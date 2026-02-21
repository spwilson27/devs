# Task: Define SAOP observability schema and implement logging/API for traceability (Sub-Epic: 05_3_MCP)

## Covered Requirements
- [3_MCP-TAS-001]

## 1. Initial Test Written
- [ ] Create `tests/tasks/test_saop_logging_schema.py` using pytest and `jsonschema`:
  - Define an explicit JSON Schema for the SAOP envelope with fields: `id` (string UUID), `timestamp` (ISO8601), `agent_id` (string), `turn_index` (integer), `tool_calls` (array), `reasoning_chain` (string/blob), `observation` (object), `signature` (optional string).
  - Write a test that validates a sample envelope against the schema (use `jsonschema.validate`).
  - Write a second test that calls `mcp.observability.logger.log_envelope(envelope, db_path)` and asserts the `agent_logs` SQLite table receives a new row with the raw envelope blob.

## 2. Task Implementation
- [ ] Implement the schema and logger:
  - Add `mcp/observability/schema.py` exporting the SAOP JSON Schema as `SAOP_SCHEMA`.
  - Add `mcp/observability/logger.py` with function `log_envelope(envelope: dict, db_path: Path = Path('.devs/state.sqlite')) -> str` which:
    - Validates the envelope against `SAOP_SCHEMA`.
    - Opens a connection to SQLite and inserts a row into `agent_logs(id, task_id, timestamp, envelope_blob)` storing envelope as JSON blob. Create the `agent_logs` table if missing in a migration-safe manner.
    - Returns the inserted row id.
  - Add a minimal SSE generator stub `mcp/observability/stream.py` exposing `stream_envelopes(db_path)` that yields recent envelopes (for the ProjectServer to expose).

## 3. Code Review
- [ ] Verify:
  - All schema validations are strict (types enforced) and envelope size is limited (reject >500KB).
  - SQL uses parameterized statements to avoid injection and uses transactions when creating tables and inserting.
  - Reasoning chain stored as blob (TEXT) to avoid truncation and supports retrieval.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/tasks/test_saop_logging_schema.py -q` and ensure both schema validation and DB insertion tests pass.

## 5. Update Documentation
- [ ] Add `docs/mcp/observability.md` documenting SAOP schema, example queries against `agent_logs`, and how to stream traces via the ProjectServer SSE endpoint.

## 6. Automated Verification
- [ ] As part of the test suite, assert that `SELECT COUNT(1) FROM agent_logs` increases by 1 after `log_envelope` is called; include the SQL query in the test to make verification deterministic.
# Task: Define MCP Tool Request/Response Schemas (Sub-Epic: 033_Foundational Technical Requirements (Part 24))

## Covered Requirements
- [2_TAS-REQ-051A]

## Dependencies
- depends_on: [01_define_normative_proto_files.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a set of JSON schema files in a well-known directory (e.g., `docs/schemas/mcp/`) for each tool listed in `2_TAS-REQ-051A`.
- [ ] Write a script or test in `devs-core` that validates example request and response objects against these JSON schemas.
- [ ] The test should specifically check that optional fields not yet populated return a JSON `null`, never absent (as per `2_TAS-REQ-051`).

## 2. Task Implementation
- [ ] Define JSON schemas for `list_runs`, `get_run`, `get_stage_output`, `stream_logs`, `get_pool_state`, `get_workflow_definition`, `list_checkpoints`, `submit_run`, `cancel_run`, `pause_run`, `resume_run`, `cancel_stage`, `pause_stage`, `resume_stage`, `write_workflow_definition`, `inject_stage_input`, `assert_stage_output`, `report_progress`, `signal_completion`, and `report_rate_limit`.
- [ ] Ensure that the schemas for `WorkflowRun`, `StageRun`, and `StageOutput` match the definitions in `2_TAS-REQ-051A` exactly.
- [ ] Implement a `SchemaRegistry` or similar utility in `devs-core` that can serve these schemas for the MCP server.
- [ ] Ensure all responses follow the envelope format from `2_TAS-REQ-049` (with `result` and `error` fields).

## 3. Code Review
- [ ] Confirm that ISO8601 timestamps are used for all date fields.
- [ ] Verify that UUID fields explicitly mention the expected format.
- [ ] Ensure the schemas accurately reflect the "Glass-Box" philosophy, exposing all internal state.
- [ ] Verify that there are no "plain-text-only" responses as per `2_TAS-REQ-049`.

## 4. Run Automated Tests to Verify
- [ ] Run the schema validation script to ensure all examples conform to the schemas.
- [ ] Run `cargo test -p devs-core` and verify `SchemaRegistry` correctly serves the defined schemas.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to indicate the location of the MCP tool schemas.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Verify traceability using `./tools/verify_requirements.py`.

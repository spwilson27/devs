# Task: Define MCP Tool Request/Response Schema Types (Sub-Epic: 033_Foundational Technical Requirements (Part 24))

## Covered Requirements
- [2_TAS-REQ-051A]

## Dependencies
- depends_on: [01_define_normative_proto_files.md]
- shared_components: [devs-core (consumer — uses domain types), devs-proto (consumer — references proto message shapes for consistency)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/mcp_schema_types.rs`, write the following tests. All annotated with `// Covers: 2_TAS-REQ-051A`.
- [ ] `test_list_runs_request_serialization`: construct a `ListRunsRequest { project_id: Some(uuid), status: Some(RunStatusFilter::Running) }` and serialize to JSON. Assert the output matches `{"project_id":"<uuid>","status":"running"}`. Also test with `None` fields and assert they serialize as `null` (not absent): `{"project_id":null,"status":null}`.
- [ ] `test_list_runs_response_serialization`: construct a `ListRunsResponse` with one `RunSummary` containing all fields. Serialize and assert the JSON shape matches the spec: `runs` array with objects containing `run_id`, `slug`, `workflow_name`, `project_id`, `status`, `created_at`, `started_at`, `completed_at`. Assert `started_at: null` serializes as JSON `null`, not absent.
- [ ] `test_get_run_response_includes_stage_runs`: construct a `GetRunResponse` with two stage runs. Serialize and assert `stage_runs` is a JSON array with objects containing all 11 fields from the spec (`stage_run_id`, `run_id`, `stage_name`, `attempt`, `status`, `agent_tool`, `pool_name`, `started_at`, `completed_at`, `exit_code`, `output`). Assert optional fields serialize as `null`.
- [ ] `test_get_stage_output_response_fields`: construct a `StageOutputResponse` with `stdout`, `stderr`, `structured` (as `Option<serde_json::Value>`), `exit_code`, `log_path`, `truncated`. Serialize and assert all 6 fields present. When `structured` is `None`, assert it serializes as `null`.
- [ ] `test_stream_logs_chunk_serialization`: construct a `LogChunk { chunk: base64_bytes, stream: "stdout", sequence: 42 }`. Serialize and assert JSON matches spec shape.
- [ ] `test_get_pool_state_response_nested_agents`: construct a `PoolStateResponse` with a pool containing two agents with capabilities. Serialize and assert nested structure matches spec: `pools[].agents[].{tool, capabilities, fallback, rate_limited, rate_limit_until}`.
- [ ] `test_submit_run_request_serialization`: construct `SubmitRunRequest { workflow_name, project_id, name: None, inputs: HashMap }`. Serialize. Assert `name` is `null` not absent.
- [ ] `test_cancel_pause_resume_request_shape`: for `CancelRunRequest`, `PauseRunRequest`, `ResumeRunRequest`, each has only `run_id`. Serialize and assert JSON shape `{"run_id":"<uuid>"}`.
- [ ] `test_stage_control_request_shape`: for `CancelStageRequest`, `PauseStageRequest`, `ResumeStageRequest`, each has `run_id` and `stage_name`. Serialize and assert.
- [ ] `test_signal_completion_request_serialization`: construct `SignalCompletionRequest { run_id, stage_name, success: true, output: Some(json_value) }`. Serialize. Assert `output` present as JSON object when `Some`, as `null` when `None`.
- [ ] `test_all_optional_fields_serialize_as_null_not_absent`: for every response type that has optional fields, construct with `None` values, serialize to `serde_json::Value`, and assert the key exists with value `Value::Null` using `.get("field_name") == Some(&Value::Null)`.

## 2. Task Implementation
- [ ] In `crates/devs-core/src/mcp_types.rs`, define Rust structs for all MCP tool request and response types using `#[derive(Serialize, Deserialize, Debug, Clone)]` from `serde`. Use `#[serde(serialize_with = ...)]` or explicit `Option<T>` serialization to ensure `None` fields serialize as JSON `null` (not skipped). This requires **not** using `#[serde(skip_serializing_if = "Option::is_none")]` on any field.
- [ ] Define request types: `ListRunsRequest`, `GetRunRequest`, `GetStageOutputRequest`, `StreamLogsRequest`, `GetPoolStateRequest`, `GetWorkflowDefinitionRequest`, `ListCheckpointsRequest`, `SubmitRunRequest`, `CancelRunRequest`, `PauseRunRequest`, `ResumeRunRequest`, `CancelStageRequest`, `PauseStageRequest`, `ResumeStageRequest`, `WriteWorkflowDefinitionRequest`, `InjectStageInputRequest`, `AssertStageOutputRequest`, `ReportProgressRequest`, `SignalCompletionRequest`, `ReportRateLimitRequest`.
- [ ] Define response types: `ListRunsResponse` (with `Vec<RunSummary>`), `GetRunResponse` (full `WorkflowRun` with `Vec<StageRun>`), `StageOutputResponse`, `LogChunk`, `PoolStateResponse` (with nested `Vec<PoolState>` containing `Vec<AgentState>`), `WorkflowDefinitionResponse`, `ListCheckpointsResponse`, `AssertionResultResponse`.
- [ ] Define shared sub-types: `RunSummary` (7 fields), `WorkflowRun` (full with `stage_runs`), `StageRun` (11 fields including `output: Option<StageOutput>`), `StageOutput` (6 fields), `PoolState` (6 fields), `AgentState` (5 fields), `CheckpointEntry` (5 fields).
- [ ] Use `chrono::DateTime<Utc>` for all timestamp fields, serialized as ISO 8601 strings. Use `uuid::Uuid` for all UUID fields. Use `Option<T>` for all nullable fields per the spec (e.g., `started_at`, `completed_at`, `exit_code`, `output`, `agent_tool`, `rate_limit_until`).
- [ ] Ensure all field names match the spec exactly (snake_case in Rust, matching the JSON field names from §5.4 of the spec). If the JSON uses snake_case, no `#[serde(rename)]` is needed.
- [ ] Re-export `mcp_types` module from `crates/devs-core/src/lib.rs`.

## 3. Code Review
- [ ] Verify every MCP tool listed in [2_TAS-REQ-051A] has corresponding request and response types: `list_runs`, `get_run`, `get_stage_output`, `stream_logs`, `get_pool_state`, `get_workflow_definition`, `list_checkpoints`, `submit_run`, `cancel_run`, `pause_run`, `resume_run`, `cancel_stage`, `pause_stage`, `resume_stage`, `write_workflow_definition`, `inject_stage_input`, `assert_stage_output`, `report_progress`, `signal_completion`, `report_rate_limit`.
- [ ] Verify no optional field uses `skip_serializing_if` — all `None` values must appear as `null` in JSON output.
- [ ] Verify field types match the spec: UUIDs are `Uuid`, timestamps are `DateTime<Utc>`, integers are the correct width, booleans are `bool`.
- [ ] Verify `StageOutput` has exactly the 6 fields from the spec: `stdout` (string ≤1MiB), `stderr` (string ≤1MiB), `structured` (Option<Value>), `exit_code` (i32), `log_path` (String), `truncated` (bool).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- mcp_schema` — all MCP schema type tests must pass.
- [ ] Run `cargo test -p devs-core` — full test suite must pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-051A` traceability annotations to all test functions.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm no lint errors.
- [ ] Run `./do test` and confirm all tests pass.

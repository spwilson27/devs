# Task: AC-RISK-025-01 MCP E2E — Snapshot Reflects Submit-Time Definition, Not Post-Update Definition (Sub-Epic: 55_Risk 025 Verification)

## Covered Requirements
- [AC-RISK-025-01]

## Dependencies
- depends_on: ["02_mit_025_mitigation_integration_test.md"]
- shared_components: [devs-scheduler, devs-checkpoint, devs-mcp, devs-grpc]

## 1. Initial Test Written

- [ ] In `crates/devs-mcp/tests/e2e_snapshot_submit_time.rs`, write an MCP E2E test `test_ac_risk_025_01_snapshot_matches_submit_time_definition` that:

  **Setup:**
  1. Start a full `devs-server` test instance (using the test-server harness that binds gRPC on a randomly assigned port and MCP on a second port).
  2. Register project `"proj-alpha"` with the server via the CLI or gRPC `ProjectService::register_project`.
  3. Send an MCP `write_workflow_definition` tool call (via `POST /mcp/v1/call`) with workflow name `"wf-snapshot-test"` and body `DefinitionV1` containing a single stage `{"name": "stage-alpha", "prompt": "Version 1 prompt"}`.

  **Submit Run (capture snapshot):**
  4. Send an MCP `submit_run` tool call with `workflow_name: "wf-snapshot-test"`, `project_id: "proj-alpha"`, `run_name: "run-001"`.
  5. Assert the response contains a valid `run_id` (UUID4 format).
  6. Annotate with `// REQ: AC-RISK-025-01`.

  **Mutate Live Definition Before First Stage Dispatch:**
  7. Send an MCP `write_workflow_definition` tool call updating `"wf-snapshot-test"` with `DefinitionV2` containing a stage `{"name": "stage-beta", "prompt": "Version 2 prompt"}`.
  8. Assert the response is `200 OK`.

  **Verify Snapshot Is Unchanged:**
  9. Read `workflow_snapshot.json` for the `run_id` returned in step 5 directly from the filesystem (the test server's `CheckpointStore` root is accessible from the test harness via a `TempDir` handle).
  10. Deserialize the snapshot JSON.
  11. Assert `snapshot.definition.stages[0].name == "stage-alpha"` (not `"stage-beta"`).
  12. Assert `snapshot.run_id == run_id` from step 5.
  13. Assert `snapshot.schema_version == 1`.
  14. Annotate with `// REQ: AC-RISK-025-01`.

  **Additional MCP verification via `get_run_snapshot` tool (if implemented):**
  15. Send an MCP `get_run_snapshot` tool call with `run_id` from step 5.
  16. Assert the returned `definition.stages[0].name == "stage-alpha"`.
  17. Assert the returned value matches the on-disk file content byte-for-byte (modulo whitespace).

- [ ] Write a variant test `test_ac_risk_025_01_snapshot_unchanged_after_multiple_write_definition_calls` that:
  1. Submits a run capturing `DefinitionV1`.
  2. Issues three sequential `write_workflow_definition` MCP calls with `DefinitionV2`, `DefinitionV3`, `DefinitionV4`.
  3. Reads the snapshot file after each mutation.
  4. Asserts the snapshot always contains `DefinitionV1`.
  5. Annotate with `// REQ: AC-RISK-025-01`.

## 2. Task Implementation

- [ ] Confirm the MCP server (`crates/devs-mcp/src/handlers/`) has a `write_workflow_definition` handler that:
  - Calls `scheduler.write_workflow_definition(project_id, workflow_name, new_def).await`.
  - Does NOT call any `CheckpointStore` method that touches `workflow_snapshot.json`.
  - Returns `200 OK` with an empty body or confirmation JSON.
  - Is annotated with `// REQ: AC-RISK-025-01, RISK-025-BR-003`.

- [ ] Confirm the MCP server has a `submit_run` handler that:
  - Calls `scheduler.submit_run(request).await`.
  - Returns the `run_id` in the MCP tool result JSON as `{"run_id": "<uuid4>"}`.
  - Is annotated with `// REQ: AC-RISK-025-01`.

- [ ] If a `get_run_snapshot` MCP tool does not yet exist, implement it in `crates/devs-mcp/src/handlers/runs.rs`:
  ```rust
  /// Returns the immutable workflow snapshot for a run.
  /// REQ: AC-RISK-025-01
  pub async fn get_run_snapshot(
      State(scheduler): State<Arc<Scheduler>>,
      Json(req): Json<GetRunSnapshotRequest>,
  ) -> Result<Json<WorkflowSnapshot>, McpError> {
      let snapshot = scheduler
          .checkpoint_store
          .load_workflow_snapshot(&req.run_id)
          .await?;
      Ok(Json(snapshot))
  }
  ```
  Register this handler in the MCP router and add it to the MCP tool manifest.

- [ ] In `crates/devs-mcp/tests/harness.rs` (or create if absent), ensure the `TestServer` struct exposes:
  - `fn checkpoint_root(&self) -> &std::path::Path` — the root directory of the `CheckpointStore` so tests can read snapshot files directly.
  - `fn mcp_url(&self) -> String` — the base URL for MCP `POST /mcp/v1/call` requests.

## 3. Code Review

- [ ] Confirm the `write_workflow_definition` MCP handler contains zero references to `write_workflow_snapshot`, `snapshot_path`, or `CheckpointStore` — it MUST only touch the live workflow map.
- [ ] Confirm the E2E test drives the server through the **MCP interface** (HTTP POST to `/mcp/v1/call`), not via a direct function call, to satisfy the E2E interface boundary requirement (≥50% MCP E2E coverage gate from the PRD).
- [ ] Confirm the test uses a fresh `TempDir` for each test case so snapshot files from one test do not affect another.
- [ ] Confirm the `// REQ: AC-RISK-025-01` annotation appears in both the production handler and the test.
- [ ] Confirm the test constructs `DefinitionV1` and `DefinitionV2` with structurally different stage names (not just different prompt text) so the assertion is unambiguous.

## 4. Run Automated Tests to Verify

- [ ] Run:
  ```bash
  cargo test -p devs-mcp e2e_snapshot_submit_time
  ```
  Both MCP E2E tests must pass.

- [ ] Run:
  ```bash
  ./do test
  ```
  No regressions.

- [ ] Run the coverage tool and confirm the MCP interface achieves ≥50% E2E line coverage:
  ```bash
  ./do coverage
  ```

## 5. Update Documentation

- [ ] Add a doc comment to the `get_run_snapshot` MCP tool in `crates/devs-mcp/src/manifest.rs` (or equivalent tool-list file) explaining that the returned snapshot is immutable after `submit_run` and citing `AC-RISK-025-01`.
- [ ] Update `crates/devs-mcp/README.md` with an entry for the `get_run_snapshot` tool listing its request/response schema.

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `AC-RISK-025-01` appears with `status: covered`.
- [ ] Run `./do coverage` and confirm the MCP E2E test contributes to the `devs-mcp` crate's line coverage.
- [ ] Inspect `target/traceability.json` and confirm `"AC-RISK-025-01"` has a non-empty `test_refs` list containing at least `test_ac_risk_025_01_snapshot_matches_submit_time_definition`.
- [ ] Confirm the MCP handler for `write_workflow_definition` has `// REQ: AC-RISK-025-01` in its body by running:
  ```bash
  grep -n "AC-RISK-025-01" crates/devs-mcp/src/handlers/runs.rs
  ```
  and confirming at least one match.

# Task: Configure Server Infrastructure for Workflow Submission (Sub-Epic: 13_Roadmap Phase 4 Infrastructure)

## Covered Requirements
- [AC-ROAD-P4-001], [AC-ROAD-P4-002], [ROAD-P4-DEP-001]

## Dependencies
- depends_on: ["10_agent_tdd_loop_enforcement/01_define_core_tdd_workflows.md", "12_roadmap_dependency_verification/01_define_additional_workflows.md"]
- shared_components: [devs-config, devs-pool, devs-grpc, devs-cli, Server Discovery Protocol]

## 1. Initial Test Written
- [ ] Create an E2E test module at `devs-cli/tests/e2e/submit_workflow_test.rs` with the following tests:
  - `test_server_starts_and_writes_discovery_file()`: Starts `devs-server` with test config, asserts server binds to gRPC port, and discovery file exists at `~/.config/devs/server.addr` (or `DEVS_DISCOVERY_FILE` path)
  - `test_submit_workflow_returns_json()`: For each of the six standard workflows, executes `devs submit <workflow> --format json` and asserts:
    - Exit code is 0
    - Stdout is valid JSON (parse with `serde_json::from_str::<SubmitResponse>()`)
    - Response contains non-empty `run_id` field matching UUID v4 regex: `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`
  - `test_submit_presubmit_check_returns_pending_status()`: Specifically for `presubmit-check`, asserts the JSON response contains `"status": "pending"` (case-insensitive)
  - `test_submit_with_invalid_workflow_fails_gracefully()`: Attempts to submit a non-existent workflow and asserts exit code is non-zero with descriptive error message
- [ ] Tests must use isolated test directories via `DEVS_DISCOVERY_FILE` environment variable to avoid conflicts with running server instances
- [ ] Add test helper functions: `start_test_server()`, `stop_server()`, `submit_workflow(workflow_name)`, `parse_json_response(output)`

## 2. Task Implementation
- [ ] Create a `devs.toml` template at `.devs/devs.toml` for bootstrap verification with the following content:
  ```toml
  [server]
  listen_addr = "127.0.0.1:7890"
  mcp_port = 7891
  
  [pool]
  name = "standard"
  max_concurrent = 4
  
  [[pool.agent]]
  tool = "opencode"
  capabilities = ["code-gen", "test"]
  
  [[pool.agent]]
  tool = "claude"
  capabilities = ["code-gen", "review"]
  fallback = true
  ```
- [ ] Ensure `devs-server` loads workflow definitions from `.devs/workflows/` directory at startup (configurable via `workflow_search_paths` in config)
- [ ] Implement/verify `devs-cli submit` command supports `--format json` flag:
  - When `--format json` is provided, output must be machine-parseable JSON
  - When not provided, output can be human-readable text
  - JSON schema: `{ "run_id": "<uuid>", "status": "pending", "workflow": "<name>", "submitted_at": "<iso8601>" }`
- [ ] Implement server-side validation for workflow submission:
  - Check workflow file exists in search paths
  - Parse and validate workflow TOML schema
  - Verify referenced pool exists
  - Return `SubmitResponse` with `run_id` and initial status
- [ ] Ensure `devs-cli` connects to server via discovery protocol:
  - Check `--server` flag first
  - Fall back to discovery file at `~/.config/devs/server.addr`
  - Use `DEVS_DISCOVERY_FILE` env var for test isolation
- [ ] Implement UUID v4 generation for `run_id` using `uuid::Uuid::new_v4()`
- [ ] Ensure workflow snapshot is created at submit time (stored in `.devs/state/snapshots/`)

## 3. Code Review
- [ ] Verify server correctly maps `standard` pool configuration to agent spawning logic
- [ ] Ensure CLI JSON output matches the gRPC `SubmitRunResponse` proto definition:
  ```protobuf
  message SubmitRunResponse {
    string run_id = 1;
    string status = 2;
    string workflow = 3;
    string submitted_at = 4;
  }
  ```
- [ ] Validate UUID generation uses cryptographically secure random source
- [ ] Confirm discovery file is written atomically via temp-file + rename pattern
- [ ] Verify workflow snapshot is immutable and contains full workflow definition

## 4. Run Automated Tests to Verify
- [ ] Run E2E tests: `cargo test -p devs-cli --test e2e submit_workflow`
- [ ] Manually test workflow submission:
  ```bash
  devs-server --config .devs/devs.toml &
  sleep 2
  devs submit presubmit-check --format json | jq -e '.run_id != null and .status == "pending"'
  ```

## 5. Update Documentation
- [ ] Update `docs/cli-reference.md` with `devs submit` command documentation:
  - `--format json` flag usage
  - Example output JSON schema
  - Error handling behavior
- [ ] Update `docs/server-config.md` with pool configuration examples
- [ ] Document discovery file protocol in `docs/server-discovery.md`

## 6. Automated Verification
- [ ] Run verification script:
  ```bash
  #!/bin/bash
  set -e
  devs-server --config .devs/devs.toml &
  SERVER_PID=$!
  trap "kill $SERVER_PID" EXIT
  sleep 2
  
  # Test all six workflows
  for workflow in tdd-red tdd-green presubmit-check build-only unit-test-crate e2e-all; do
    output=$(devs submit $workflow --format json)
    echo "$output" | jq -e '.run_id != null and .status != null' > /dev/null || exit 1
    echo "✓ $workflow submitted successfully"
  done
  
  # Specific check for presubmit-check
  output=$(devs submit presubmit-check --format json)
  echo "$output" | jq -e '.status == "pending"' > /dev/null || exit 1
  echo "✓ presubmit-check returns pending status"
  ```
- [ ] Ensure script exits 0 only if all workflows are accepted and `presubmit-check` returns correct status

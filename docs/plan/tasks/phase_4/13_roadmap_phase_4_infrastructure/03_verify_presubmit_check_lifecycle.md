# Task: Verify Presubmit-Check Workflow Lifecycle (Sub-Epic: 13_Roadmap Phase 4 Infrastructure)

## Covered Requirements
- [AC-ROAD-P4-003]

## Dependencies
- depends_on: ["02_configure_server_infrastructure.md"]
- shared_components: [devs-scheduler, devs-cli, devs-grpc, ./do Entrypoint Script, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an E2E test module at `devs-cli/tests/e2e/workflow_lifecycle_test.rs` with the following tests:
  - `test_presubmit_check_completes_successfully()`:
    1. Starts `devs-server` with test config and `standard` pool
    2. Submits `presubmit-check` workflow via `devs submit presubmit-check --format json`
    3. Extracts `run_id` from JSON response
    4. Polls `devs status <run_id> --format json` every 2 seconds until terminal state
    5. Asserts final `"status"` is `"completed"` (case-insensitive)
    6. Asserts all stages in `stages[]` array have `"status": "completed"`
  - `test_presubmit_check_stage_progression()`:
    - During polling, records stage state transitions
    - Asserts stages follow expected order: `build` → (`format` | `lint` | `unit-tests`) → `coverage` → `e2e-tests`
    - Asserts no stage skips its dependencies
  - `test_presubmit_check_fails_on_stage_failure()`:
    - Negative test: modifies a workflow stage to intentionally fail
    - Asserts run reaches `"status": "failed"` when any stage fails
    - Asserts downstream stages do not execute after failure
- [ ] Tests must use `DEVS_DISCOVERY_FILE` for test isolation
- [ ] Test timeout: 600 seconds (10 minutes) for full presubmit-check completion
- [ ] Add test helper: `poll_until_complete(run_id, timeout_secs, interval_secs) -> WorkflowRunStatus`

## 2. Task Implementation
- [ ] Ensure `devs-scheduler` correctly executes the `presubmit-check` DAG:
  - Stage `build` runs first (no dependencies)
  - Stages `format`, `lint`, `unit-tests` run in parallel after `build` completes
  - Stage `coverage` runs after `unit-tests` completes
  - Stage `e2e-tests` runs after `format` and `lint` complete
- [ ] Configure `standard` pool with a "local" or "shell" agent adapter for bootstrap:
  - Agent executes shell commands directly (e.g., `./do build`, `./do format`)
  - Agent reports completion via `exit_code` signal
  - No external AI agent CLI required for bootstrap verification
- [ ] Implement/verify `devs status <run_id>` command:
  - `--format json` flag outputs machine-parseable JSON
  - JSON schema:
    ```json
    {
      "run_id": "<uuid>",
      "workflow": "presubmit-check",
      "status": "completed|failed|running|pending",
      "stages": [
        { "name": "build", "status": "completed", "exit_code": 0 },
        { "name": "format", "status": "completed", "exit_code": 0 }
      ],
      "started_at": "<iso8601>",
      "completed_at": "<iso8601>"
    }
    ```
- [ ] Implement scheduler checkpoint persistence:
  - After each stage completes, save `WorkflowRun` state to `.devs/state/checkpoints/`
  - Checkpoint includes stage statuses, exit codes, and timestamps
  - Enables run recovery after server restart
- [ ] Implement stage execution logging:
  - Each stage writes logs to `.devs/state/logs/<run_id>/<stage_name>.log`
  - Logs include stdout/stderr from agent execution
  - Logs are included in checkpoint for persistence
- [ ] Ensure scheduler respects `depends_on` relationships:
  - Stage does not start until all dependencies have `status: "completed"`
  - Stage transitions to `failed` if any dependency fails
  - Stage transitions to `cancelled` if run is cancelled mid-execution

## 3. Code Review
- [ ] Verify DAG execution order matches `presubmit-check.toml` dependencies:
  ```
  build → format ─┬→ e2e-tests
        → lint  ──┘
        → unit-tests → coverage
  ```
- [ ] Ensure polling interval (2 seconds) is reasonable and doesn't overload server with requests
- [ ] Validate stage-level completion signals (`exit_code`) are correctly captured in `StageRun` state
- [ ] Confirm checkpoint persistence uses atomic git commit (temp-file + rename pattern)
- [ ] Verify log retention policy is applied (configurable max age/size)
- [ ] Review parallel stage execution: `format`, `lint`, `unit-tests` must run concurrently

## 4. Run Automated Tests to Verify
- [ ] Run E2E lifecycle test: `cargo test -p devs-cli --test e2e workflow_lifecycle -- --ignored`
- [ ] Manually execute full presubmit-check:
  ```bash
  devs-server --config .devs/devs.toml &
  SERVER_PID=$!
  sleep 2
  
  output=$(devs submit presubmit-check --format json)
  run_id=$(echo "$output" | jq -r '.run_id')
  echo "Submitted presubmit-check with run_id: $run_id"
  
  # Poll until complete (timeout 600s)
  for i in {1..300}; do
    status=$(devs status $run_id --format json | jq -r '.status')
    echo "[$i] Run status: $status"
    if [ "$status" = "completed" ] || [ "$status" = "failed" ]; then
      break
    fi
    sleep 2
  done
  
  # Verify final status
  devs status $run_id --format json | jq -e '.status == "completed" and (.stages | all(.status == "completed"))'
  
  kill $SERVER_PID
  ```

## 5. Update Documentation
- [ ] Update `docs/cli-reference.md` with `devs status` command documentation:
  - `--format json` flag usage
  - Example output JSON schema
  - Stage status field descriptions
- [ ] Document workflow lifecycle states in `docs/workflow-states.md`:
  - State machine diagram for `WorkflowRun` (pending → running → completed/failed/cancelled)
  - State machine diagram for `StageRun` (pending → running → completed/failed/cancelled)
  - Dependency-driven transitions
- [ ] Add troubleshooting section for common lifecycle failures:
  - Stage stuck in "running" state
  - Run fails immediately after submit
  - Dependency deadlock detection

## 6. Automated Verification
- [ ] Execute presubmit-check in CI pipeline and verify completion:
  ```yaml
  # .gitlab-ci.yml snippet
  bootstrap-verification:
    script:
      - devs-server --config .devs/devs.toml &
      - sleep 2
      - output=$(devs submit presubmit-check --format json)
      - run_id=$(echo "$output" | jq -r '.run_id')
      - echo "run_id=$run_id" >> bootstrap.env
      - |
        for i in {1..300}; do
          status=$(devs status $run_id --format json | jq -r '.status')
          if [ "$status" = "completed" ]; then
            echo "✓ Run completed successfully"
            exit 0
          elif [ "$status" = "failed" ]; then
            echo "✗ Run failed"
            devs status $run_id --format json | jq '.stages[] | select(.status == "failed")'
            exit 1
          fi
          sleep 2
        done
      - echo "✗ Timeout waiting for run completion"
      - exit 1
  ```
- [ ] Verify using jq assertion on CI runner:
  ```bash
  devs status <run_id> --format json | jq -e '.status == "completed" and (.stages | all(.status == "completed"))'
  ```
- [ ] CI pipeline must show: `Run <run_id> completed successfully` in log output
- [ ] Verification must pass on all three platforms (Linux, macOS, Windows) for bootstrap completion

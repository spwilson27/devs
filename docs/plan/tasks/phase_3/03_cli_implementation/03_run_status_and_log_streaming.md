# Task: Run Status and Log Streaming Commands (Sub-Epic: 03_CLI Implementation)

## Covered Requirements
- [1_PRD-REQ-039], [2_TAS-REQ-061], [2_TAS-REQ-064]

## Dependencies
- depends_on: [02_workflow_submission_and_listing.md]
- shared_components: [devs-proto (consumer), devs-core (consumer)]

## 1. Initial Test Written
- [ ] Write unit tests for run ID resolution logic in `crates/devs-cli/src/commands/resolve.rs`:
  - A valid UUID string (e.g., `"550e8400-e29b-41d4-a716-446655440000"`) is parsed as `RunIdentifier::Uuid`.
  - A non-UUID string (e.g., `"my-run-slug"`) is parsed as `RunIdentifier::Slug`.
  - Both formats are accepted by the `FromStr` implementation.
- [ ] Write an E2E test using `assert_cmd` + mock gRPC server for `devs status <run-slug>`:
  - Text mode: output contains run header (name, workflow, status, created, elapsed) and a stage table with columns `STAGE`, `STATUS`, `ATTEMPT`, `STARTED`, `ELAPSED`.
  - JSON mode: stdout is a valid JSON object with `"run_id"`, `"status"`, and `"stages"` array fields.
- [ ] Write an E2E test for `devs status <uuid>` and verify UUID-based lookup works.
- [ ] Write an E2E test for `devs logs <run-slug>` (non-streaming) that verifies historical log lines are printed to stdout, each prefixed with `[stdout]` or `[stderr]`.
- [ ] Write an E2E test for `devs logs <run-slug> <stage-name>` filtering logs to a specific stage.
- [ ] Write an E2E test for `devs logs --follow <run-slug>` against a mock server that streams log chunks then sends a terminal `Completed` status → verify exit code 0.
- [ ] Write an E2E test for `devs logs --follow <run-slug>` where the run ends in `Failed` → verify exit code 1.
- [ ] Write an E2E test for `devs logs --follow <run-slug>` where the run ends in `Cancelled` → verify exit code 1.

## 2. Task Implementation
- [ ] Define `RunIdentifier` enum in `crates/devs-cli/src/commands/resolve.rs`:
  - `Uuid(uuid::Uuid)` — parsed if input matches UUID format.
  - `Slug(String)` — fallback for non-UUID input.
  - Implement `FromStr` for `RunIdentifier` (attempt UUID parse first, fall back to slug).
- [ ] Implement `devs status <run-id-or-slug>` in `crates/devs-cli/src/commands/status.rs`:
  - Parse the argument as `RunIdentifier`.
  - Call `RunService::get_run` via gRPC, passing both UUID and slug fields so the server can resolve.
  - Text output: header block with run name, workflow, status, created timestamp, elapsed duration. Stage table with columns: `STAGE`, `STATUS`, `ATTEMPT`, `STARTED`, `ELAPSED`.
  - JSON output: serialize the full `WorkflowRun` protobuf response as JSON using `serde_json`.
- [ ] Implement `devs logs <run-id-or-slug> [stage]` in `crates/devs-cli/src/commands/logs.rs`:
  - Positional arg: run identifier (required).
  - Optional positional arg: stage name (filters to single stage).
  - Flag: `--follow` (bool, default false).
  - Non-follow mode: call `LogService::get_logs` (unary RPC), print all log lines prefixed with `[stdout]` or `[stderr]` based on the stream field in each log entry.
  - Follow mode: call `LogService::stream_logs` (server-streaming RPC), print chunks as they arrive with the same prefix format.
  - When `--follow` is active, keep reading the stream until a terminal event indicates `Completed`, `Failed`, or `Cancelled`.
  - Exit code in follow mode: 0 if `Completed`, 1 if `Failed` or `Cancelled` (per [2_TAS-REQ-064]).
- [ ] Handle Ctrl+C gracefully in follow mode: install a `tokio::signal::ctrl_c` handler, drop the gRPC stream, and exit with code 130 (standard SIGINT convention).
- [ ] Implement human-readable duration formatting (e.g., `2m 34s`) for the `ELAPSED` column.

## 3. Code Review
- [ ] Verify `RunIdentifier` resolution: UUID format takes precedence if the string parses as a valid UUID.
- [ ] Verify `--follow` exit code logic exactly matches [2_TAS-REQ-064]: 0 for Completed, 1 for Failed/Cancelled.
- [ ] Verify log line prefixes (`[stdout]`/`[stderr]`) are consistent and parseable.
- [ ] Verify that the gRPC streaming connection is properly cleaned up on Ctrl+C (no resource leaks, no hanging tasks).
- [ ] Verify elapsed time formatting uses human-readable durations (e.g., `2m 34s`, not raw seconds).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli` and ensure all status and logs tests pass.
- [ ] Run `./do test` to ensure no regressions.

## 5. Update Documentation
- [ ] Add doc comments to `StatusCommand`, `LogsCommand`, and `RunIdentifier`.

## 6. Automated Verification
- [ ] Run `cargo clippy -p devs-cli -- -D warnings` and confirm zero warnings.
- [ ] Run `cargo test -p devs-cli -- --nocapture 2>&1 | grep "test result"` and verify 0 failures.
- [ ] Run `grep -r "// Covers:" crates/devs-cli/ | grep "2_TAS-REQ-064"` to verify traceability annotation for follow-mode exit codes.

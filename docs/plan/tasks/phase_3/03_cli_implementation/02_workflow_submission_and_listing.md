# Task: Workflow Submission and Listing Commands (Sub-Epic: 03_CLI Implementation)

## Covered Requirements
- [1_PRD-REQ-035], [1_PRD-REQ-039], [2_TAS-REQ-061]

## Dependencies
- depends_on: [01_cli_scaffold_and_global_flags.md]
- shared_components: [devs-proto (consumer), devs-core (consumer), devs-scheduler (consumer — submit_run, list_runs RPCs via devs-grpc)]

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-cli/src/commands/submit.rs` for input parameter parsing:
  - `"key=value"` → `("key", "value")`
  - `"key=val=ue"` → `("key", "val=ue")` (first `=` is separator)
  - `"key="` → `("key", "")` (empty value is valid)
  - `"keyonly"` → error (no `=` present)
- [ ] Write an E2E test using `assert_cmd` that starts a mock gRPC server (using `tonic`'s test utilities or a helper binary), then invokes `devs submit test-workflow --name my-run --input foo=bar --server 127.0.0.1:<mock-port>` and asserts:
  - Exit code 0.
  - Stdout contains the returned run ID or slug.
- [ ] Write an E2E test for `devs submit test-workflow --format json --server ...` and assert stdout is valid JSON containing `"run_id"` and `"slug"` fields.
- [ ] Write an E2E test for `devs list --server ...` and assert:
  - Text mode: output contains column headers `RUN-ID`, `SLUG`, `WORKFLOW`, `STATUS`, `CREATED`.
  - JSON mode (`--format json`): stdout is a valid JSON array.
- [ ] Write an E2E test for `devs list --project my-project --server ...` and verify the project filter is passed to the gRPC call.

## 2. Task Implementation
- [ ] Implement `devs submit <workflow>` in `crates/devs-cli/src/commands/submit.rs`:
  - Positional arg: `workflow` (String).
  - Optional flag: `--name <run-name>` (String).
  - Repeatable flag: `--input <key=value>` (Vec<String>).
  - Parse `--input` values by splitting on the first `=` character using `splitn(2, '=')`.
  - Build a `SubmitRunRequest` protobuf message from `devs-proto` and call `WorkflowService::submit_run` via the gRPC channel.
  - Text output: print `Run submitted: <slug> (<run-id>)`.
  - JSON output: print `{"run_id": "<uuid>", "slug": "<slug>"}`.
- [ ] Implement `devs list` in `crates/devs-cli/src/commands/list.rs`:
  - Optional flag: `--project <name>` (String).
  - Call `RunService::list_runs` via gRPC.
  - Text output: formatted table with columns `RUN-ID` (first 8 chars of UUID), `SLUG`, `WORKFLOW`, `STATUS`, `CREATED` (RFC 3339 timestamp).
  - JSON output: serialize the list of runs as a JSON array to stdout.
- [ ] Register both subcommands in the `Commands` enum in `main.rs`.
- [ ] Implement a shared `format_table(headers: &[&str], rows: Vec<Vec<String>>) -> String` utility in `crates/devs-cli/src/output.rs` for consistent text table formatting across commands.

## 3. Code Review
- [ ] Verify `--input` parsing handles edge cases: values containing `=`, empty values, keys with special characters.
- [ ] Verify text table output uses consistent column widths (left-aligned, space-padded).
- [ ] Verify JSON output writes exactly one JSON document to stdout with no trailing text.
- [ ] Verify that `devs-proto` generated types are used directly for gRPC calls — no manual protobuf construction.
- [ ] Verify that `1_PRD-REQ-035` is satisfied: `submit` is the CLI mechanism for manual workflow triggering with `--name` and `--input` flags.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli` and ensure all submit and list tests pass.
- [ ] Run `./do test` to ensure no regressions across the workspace.

## 5. Update Documentation
- [ ] Add doc comments to `SubmitCommand`, `ListCommand` structs and their `run()` methods.

## 6. Automated Verification
- [ ] Run `cargo clippy -p devs-cli -- -D warnings` and confirm zero warnings.
- [ ] Run `cargo test -p devs-cli -- --nocapture 2>&1 | grep "test result"` and verify 0 failures.
- [ ] Run `grep -r "// Covers:" crates/devs-cli/ | grep -E "1_PRD-REQ-035|1_PRD-REQ-039|2_TAS-REQ-061"` to verify traceability annotations exist.

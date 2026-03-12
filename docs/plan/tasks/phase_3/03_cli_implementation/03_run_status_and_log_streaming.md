# Task: Run Status and Log Streaming (Sub-Epic: 03_CLI Implementation)

## Covered Requirements
- [1_PRD-REQ-039], [2_TAS-REQ-061], [2_TAS-REQ-064]

## Dependencies
- depends_on: [02_workflow_submission_and_listing.md]
- shared_components: [devs-proto, devs-core]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/e2e/test_cli_status.py` (using `assert_cmd`) that invokes `devs status <run-id-or-slug>` and asserts correct status headers.
- [ ] Write a test for `devs logs <run-id-or-slug>` and verify it correctly streams historical logs.
- [ ] Write a test for `devs logs --follow` and verify it streams until the run completes.
- [ ] Write a test for `devs logs --follow` and verify it returns a non-zero exit code if the run fails.

## 2. Task Implementation
- [ ] Implement `devs status <run-id-or-slug>`:
  - Logic: Call `RunService.GetRun` over gRPC.
  - Output formatting:
    - Text: Run header plus table with `STAGE`, `STATUS`, `ATTEMPT`, `STARTED`, `ELAPSED`.
    - JSON: Single run object.
- [ ] Implement `devs logs <run-id-or-slug> [stage]`:
  - Optional flag: `--follow`.
  - Logic: Call `LogService.StreamLogs` over gRPC.
  - Prefix lines with `[stdout]` or `[stderr]`.
  - Handle `--follow`: If specified, keep the stream open until the run reaches a terminal state.
- [ ] Implement exit code logic for `devs logs --follow`:
  - 0: Successfully completed.
  - 1: Failed or Cancelled.

## 3. Code Review
- [ ] Verify that `devs status` correctly handles both UUID and Slug for identification.
- [ ] Ensure that log streaming uses the chunked transfer mechanism from the server correctly.
- [ ] Verify that the `devs-cli` correctly handles stream cancellation when the user presses Ctrl+C.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and ensure the status and log tests pass.
- [ ] Verify that `devs status` output matches the required textual format.

## 5. Update Documentation
- [ ] Update CLI documentation to include `status` and `logs` commands.

## 6. Automated Verification
- [ ] Run `cargo-llvm-cov` and verify that the log streaming code paths are covered.

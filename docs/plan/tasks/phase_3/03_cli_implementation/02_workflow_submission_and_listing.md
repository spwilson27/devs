# Task: Workflow Submission and Listing (Sub-Epic: 03_CLI Implementation)

## Covered Requirements
- [1_PRD-REQ-035], [1_PRD-REQ-039], [2_TAS-REQ-061]

## Dependencies
- depends_on: [01_cli_scaffold_and_global_flags.md]
- shared_components: [devs-proto, devs-core]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/e2e/test_cli_submit.py` (using `assert_cmd`) that invokes `devs submit <workflow>` and asserts a successful response.
- [ ] Write a test that provides input parameters via `--input key=value` and verifies they are correctly parsed.
- [ ] Write a test for `devs list` and verify it correctly displays a table of active runs.
- [ ] Write a test for `devs list --format json` and assert it returns a valid JSON array of runs.

## 2. Task Implementation
- [ ] Implement `devs submit <workflow>`:
  - Positional argument: `workflow` name.
  - Optional flag: `--name <run-name>`.
  - Multi-flag: `--input <key=value>`.
  - Logic: Call `WorkflowService.SubmitRun` over gRPC.
  - Return the newly created Run ID or Slug.
- [ ] Implement `devs list`:
  - Optional flag: `--project <id>`.
  - Logic: Call `RunService.ListRuns` over gRPC.
  - Output formatting:
    - Text: Table with `RUN-ID (short)`, `SLUG`, `WORKFLOW`, `STATUS`, `CREATED`.
    - JSON: Array of run objects.
- [ ] Handle project ambiguity: If `--project` is missing and cannot be inferred from the current directory, exit with error [3_PRD-BR-044].

## 3. Code Review
- [ ] Verify that input parameter parsing (`key=value`) handles the first `=` as the separator and allows subsequent `=` in the value.
- [ ] Ensure that table headers align with requirements.
- [ ] Verify that the `devs-proto` generated types are correctly mapped to CLI output models.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` to verify `submit` and `list` functionality.
- [ ] Manually verify that `devs list` displays a readable table.

## 5. Update Documentation
- [ ] Document the CLI `submit` and `list` commands in the project's README or CLI help.

## 6. Automated Verification
- [ ] Run `./do coverage` and ensure that `devs-cli` achieves ≥ 50% line coverage for the new commands.

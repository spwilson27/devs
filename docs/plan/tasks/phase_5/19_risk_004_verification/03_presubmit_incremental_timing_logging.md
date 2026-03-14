# Task: Presubmit Incremental Timing Logging (Sub-Epic: 19_Risk 004 Verification)

## Covered Requirements
- [RISK-005-BR-002]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create (or update) a test in `tests/test_presubmit.py` (or similar) that invokes `./do presubmit`.
- [ ] Mock the steps in `./do presubmit` to run very quickly.
- [ ] Verify that `target/presubmit_timings.jsonl` is created and contains JSON objects (one per line).
- [ ] Verify that if a step is interrupted or fails, the entries for *completed* steps are already present in the file (verifying incremental flush).
- [ ] Assert that each JSON object contains the expected fields: `step`, `started_at`, `duration_ms`, `budget_ms`, `over_budget`.

## 2. Task Implementation
- [ ] Update `cmd_presubmit()` in the `./do` script to handle incremental timing logging.
- [ ] Ensure the file `target/presubmit_timings.jsonl` is opened in append mode (or truncated at the start and then appended).
- [ ] For each step in the `checks` list:
    - Capture the start time using `time.time()`.
    - Execute the step.
    - Calculate the duration in milliseconds.
    - Create a JSON object with:
        - `step`: The name of the step (e.g., "setup", "format").
        - `started_at`: ISO 8601 timestamp.
        - `duration_ms`: Integer.
        - `budget_ms`: Defined in a constant table matching `[MIT-005]`.
        - `over_budget`: Boolean (`duration_ms > budget_ms * 1.2` as per `[RISK-005-BR-004]`).
    - Append this object to `target/presubmit_timings.jsonl` followed by a newline.
    - **CRITICAL**: Use `file.flush()` and `os.fsync(file.fileno())` immediately after writing each line to ensure it's on disk before the next step starts.
- [ ] Ensure the `target/` directory exists before writing the file.

## 3. Code Review
- [ ] Verify that the incremental write is truly incremental (not buffering in memory).
- [ ] Check that `over_budget` logic correctly uses the 20% margin defined in `[RISK-005-BR-004]`.
- [ ] Ensure that even if a step fails, the log entry for *that* step is written before the script exits.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and confirm the presubmit timing tests pass.
- [ ] Manually run `./do presubmit` and inspect `target/presubmit_timings.jsonl`.

## 5. Update Documentation
- [ ] Document the schema of `target/presubmit_timings.jsonl` in a developer guide.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `[RISK-005-BR-002]` is marked as verified.

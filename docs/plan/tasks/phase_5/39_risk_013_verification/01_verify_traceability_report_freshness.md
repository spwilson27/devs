# Task: Verify Traceability Report Freshness and Timestamp Generation (Sub-Epic: 39_Risk 013 Verification)

## Covered Requirements
- [AC-RISK-013-04]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline (Consumer), Traceability & Coverage Infrastructure (Consumer)]

## 1. Initial Test Written
- [ ] Create a Python integration test in `.tools/tests/test_traceability_freshness.py`.
- [ ] The test MUST:
    1.  Get the current system time.
    2.  Execute `./do test` (or the specific command that generates the traceability report).
    3.  Load `target/traceability.json`.
    4.  Verify that the `generated_at` field exists and is an ISO 8601 string.
    5.  Parse the `generated_at` timestamp and assert that it is within 60 seconds of the current system time recorded in step 1.
    6.  Verify that running the command twice updates the timestamp each time.

## 2. Task Implementation
- [ ] Update `.tools/verify_requirements.py` to ensure that it captures the current system time at the start of its execution.
- [ ] Add a `generated_at` field to the root object of the JSON output generated in `target/traceability.json`.
- [ ] Format the timestamp as a standard ISO 8601 string with UTC timezone (e.g., `"2026-03-12T14:30:00Z"`).
- [ ] Ensure that the file is overwritten fresh on every invocation, not appended to or partially updated.
- [ ] Verify that the `generated_at` field is included in the structured report that the CLI/TUI might eventually consume.

## 3. Code Review
- [ ] Confirm that the timestamp is generated using a reliable library (e.g., Python's `datetime` with `timezone.utc`).
- [ ] Verify that the file writing operation is atomic (write to temp, then rename) to avoid race conditions with other tools reading it.
- [ ] Ensure the 60-second window in the test is reasonable for slow CI environments while still enforcing "freshness".

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_traceability_freshness.py` and ensure it passes consistently.
- [ ] Run a local `./do test` and manually inspect `target/traceability.json` to confirm the field is present and correct.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to note that `traceability.json` now includes a mandatory `generated_at` timestamp for freshness verification.

## 6. Automated Verification
- [ ] Run `./do test` and then use a shell command to verify the timestamp: `python3 -c "import json, time, datetime; report = json.load(open('target/traceability.json')); report_time = datetime.datetime.fromisoformat(report['generated_at'].replace('Z', '+00:00')).timestamp(); now = time.time(); assert abs(now - report_time) < 60"`

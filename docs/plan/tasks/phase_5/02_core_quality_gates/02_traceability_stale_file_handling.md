# Task: Traceability Stale File Handling (Sub-Epic: 02_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-AC-5.15]

## Dependencies
- depends_on: [02_core_quality_gates/01_traceability_hardening.md]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test case `tests/test_traceability_staleness.py` that:
    - Writes a `target/traceability.json` with a `generated_at` timestamp > 1 hour ago.
    - Simulates an agent's check (this may require a small utility script or helper).
    - Asserts that the agent considers the file stale and triggers a re-run of `./do test`.

## 2. Task Implementation
- [ ] Update `.tools/verify_requirements.py` to include a `generated_at` field in the `target/traceability.json` output, using an ISO 8601 UTC timestamp.
- [ ] Implement a utility (or a specific mode in `.tools/verify_requirements.py`) that:
    - Reads the `generated_at` from `target/traceability.json`.
    - Compares it with the current time.
    - If the difference is > 1 hour, exits with a specific "stale" status or prints a warning.
- [ ] (Optional) Integrate this check into the agent's start-of-session logic, although the agent itself will be responsible for calling it.

## 3. Code Review
- [ ] Confirm that `generated_at` is updated on every run of the traceability report.
- [ ] Ensure the 1-hour threshold is strictly enforced.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_traceability_staleness.py`.
- [ ] Manually run the tool with a stale file to confirm it correctly identifies the staleness.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to note that `target/traceability.json` is only valid for 1 hour.

## 6. Automated Verification
- [ ] Verify that `generated_at` is always present and in a valid format in the JSON output.
- [ ] Verify that a newly generated file is correctly identified as not stale.

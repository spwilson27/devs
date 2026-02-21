# Task: Root Cause Analysis (RCA) Report Generator (Sub-Epic: 32_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-060]

## 1. Initial Test Written
- [ ] Unit tests for RCA generator that assert the output document contains these sections: Summary, Failure Snapshot (head sha, failing test names), Reproduction Steps, Key Diff Snippets, Stack Traces, Environment (OS, python/node versions), and Suggested Remediations.
- [ ] Integration test that feeds a synthetic failing test run + sandbox metadata and asserts the generated RCA markdown and a structured JSON contain required fields and are schema-valid.

## 2. Task Implementation
- [ ] Implement devs/agents/rca_agent.py (RootCauseAgent) with an API:
  - generate_rca(task_id, failure_artifacts) -> (markdown_str, json_metadata)
- [ ] RCA pipeline steps:
  - Ingest test runner output and logs.
  - Extract failing stack trace and failing test IDs.
  - Pull last 3 commits and compute diffs for files touched by failing tests.
  - Run heuristics to classify probable root causes (test-only change, dependency upgrade, flaky assertion) and emit confidence scores.
  - Render a human-readable markdown report and a machine-readable JSON report.
- [ ] Hook RCA generation into the TDD engine: when a task fails N times (configurable) or on explicit user request, generate and persist an RCA and attach it to the task record.

## 3. Code Review
- [ ] Validate RCA output is deterministic given the same inputs.
- [ ] Ensure PII/secrets are redacted from logs before inclusion in RCA.
- [ ] Confirm the heuristics are modular and unit-testable.

## 4. Run Automated Tests to Verify
- [ ] Run unit/integration tests that cover generator outputs and schema validation.

## 5. Update Documentation
- [ ] Add docs/rca/usage.md describing how RCA reports are produced, stored, and how to request them via CLI/API.

## 6. Automated Verification
- [ ] Include a CI test that runs the RCA generator against a stored failing-run fixture and validates the resulting markdown content against a snapshot (golden file) while allowing non-deterministic fields (timestamps, uuids) to be normalized.

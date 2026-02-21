# Task: Implement Origin Traceability (Requirement-to-Code Mapping) (Sub-Epic: 25_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-064]

## 1. Initial Test Written
- [ ] Add tests at tests/test_origin_traceability.py using pytest. Implement the following first:
  - test_commit_includes_requirement_mapping: simulate a CommitGate commit for a task associated with requirement ID(s) and assert the produced commit message and commit metadata include an explicit mapping to the requirement ID(s).
  - test_trace_recorded_in_sqlite: if CommitNode stores mappings in an sqlite metadata db, assert that an `origin_trace` table row is created with columns (commit_sha, requirement_id, task_id, timestamp, author).
  - test_trace_retrieval: exercise the API/function that given a requirement_id returns the list of commit SHAs and verify correctness.

## 2. Task Implementation
- [ ] Implement origin traceability in src/devs/tracing/origin_trace.py and update CommitNode/CommitGate to record mappings:
  - Create a lightweight storage schema (sqlite) with table origin_trace(commit_sha TEXT PRIMARY KEY, requirement_id TEXT, task_id TEXT, timestamp DATETIME, author TEXT, extra JSON).
  - On successful atomic commit, write a row per requirement mapped to that commit. Also include the same mapping in the commit message footer in a machine-parsable form (e.g., `Origin-Req: 8_RISKS-REQ-064, Task: 25_8_RISKS-01`).
  - Provide a small query API: def get_commits_for_requirement(requirement_id: str) -> List[str]
  - Ensure write operations are atomic with the commit: if DB write fails the commit must be rolled back (or vice versa) to preserve consistency.

## 3. Code Review
- [ ] Verify atomicity between git commit and trace persistence, validate schema and indexes for efficient lookup, ensure commit message format is strictly parseable, and ensure no sensitive data is stored in the trace rows.

## 4. Run Automated Tests to Verify
- [ ] Run pytest -q tests/test_origin_traceability.py and an integration that creates a temporary repo, performs commit via CommitGate, and asserts both git log and sqlite contain consistent trace records.

## 5. Update Documentation
- [ ] Add docs/tracing/origin_trace.md describing the schema, commit message format, and sample commands for retrieving requirement->commit mappings.

## 6. Automated Verification
- [ ] Add scripts/verify_origin_trace.sh which performs a commit in a temporary repo, queries the sqlite store and git log, and exits with non-zero status if mismatches are detected. Wire this into CI as a post-commit verification step for DeveloperAgent-generated commits.

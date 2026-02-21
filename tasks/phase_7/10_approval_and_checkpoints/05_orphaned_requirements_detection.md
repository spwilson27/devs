# Task: Implement Orphaned Requirements Detection & Dashboard (Sub-Epic: 10_Approval_and_Checkpoints)

## Covered Requirements
- [TAS-068], [4_USER_FEATURES-REQ-034]

## 1. Initial Test Written
- [ ] Create tests/phase_7/10_approval_and_checkpoints/test_orphan_detector.py. Write this test first:
  - Use pytest and an in-memory SQLite DB seeded with:
    - requirements table rows: R1, R2, R3
    - tasks table rows: T1, T2
    - requirement_task_map containing only R1->T1 mapping
  - Call find_orphaned_requirements(db_conn) and assert it returns [R2, R3] (order-insensitive).
  - The test should also assert that find_orphaned_requirements returns an empty list when all requirements are mapped.

## 2. Task Implementation
- [ ] Implement src/approvals/orphan_detector.py with:
  - find_orphaned_requirements(db_conn) -> List[str]
    - Implementation: LEFT JOIN requirements r ON requirement_task_map m and select r.id where no mapping exists OR mappings have been soft-deleted.
    - Use efficient SQL and ensure queries use indexes (create index on requirement_task_map.requirement_id).
  - Implement a job runner scripts/jobs/find_orphans.py that:
    - Connects to the production DB, runs find_orphaned_requirements, writes results into a new table orphaned_requirements(requirement_id, detected_at, details_json).
    - Emits a JSON report to artifacts/orphan_reports/<timestamp>.json.
- [ ] Add an endpoint GET /api/requirements/orphans (or extend existing API) that returns the latest orphan report and a count.

## 3. Code Review
- [ ] Verify:
  - SQL correctness and that detection handles cases with multiple mappings (uses GROUP BY/COUNT correctly).
  - Query performance for large requirement sets (indexes exist and queries are incremental if required).
  - The job is safe to run frequently and does not lock long-running transactions.
  - Orphaned requirements are auditable; the orphaned_requirements table must include detected_at and a snapshot of the requirement text.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/phase_7/10_approval_and_checkpoints/test_orphan_detector.py
- [ ] Smoke-run: python scripts/jobs/find_orphans.py --db /tmp/devs_test.db and inspect artifacts/orphan_reports/<ts>.json for expected entries.

## 5. Update Documentation
- [ ] Add docs/monitoring/orphan_detection.md describing the detection query, how to interpret the report, and remediation steps (re-decompose, link task manually, or archive requirement).
- [ ] Add a short runbook entry in docs/ops/runbooks/orphan_detection.md describing scheduled frequency and how to triage findings.

## 6. Automated Verification
- [ ] Implement scripts/check_orphans.sh which invokes the job runner and exits with status 2 if any orphaned requirement is found, 0 if none. Use this script as a CI gate to prevent merges that introduce new orphans.

# Task: Implement Progress Summary Generator for Maker (Sub-Epic: 10_Approval_and_Checkpoints)

## Covered Requirements
- [1_PRD-REQ-NEED-MAKER-02]

## 1. Initial Test Written
- [ ] Create tests/phase_7/10_approval_and_checkpoints/test_progress_summary.py. Required first steps:
  - Seed a temporary DB with one epic containing tasks in various statuses: completed, in_progress, blocked, and pending. Include estimated hours for some tasks.
  - Write unit tests for generate_progress_summary(epic_id) that assert the returned string meets these exact expectations:
    - Contains a short headline: "Epic '<epic_title>' — X% complete"
    - Contains three short bullets (one-line each) describing: (1) completed vs total tasks, (2) top 2 blockers by count or priority, (3) recommended next step (derived deterministically from oldest in-progress task).
    - The summary must be non-technical and suitable for a Maker to read in under 10 seconds.
  - Tests should include locale-sensitive formatting (numbers as integers) and a golden-string snapshot for a seeded dataset.

## 2. Task Implementation
- [ ] Implement src/approvals/summary.py with:
  - generate_progress_summary(epic_id, db_conn, locale='en_US') -> str
  - Internal helpers: _compute_progress_stats(tasks), _top_blockers(tasks, n=2), _recommend_next_step(tasks)
  - Use plain templates (f-strings) and avoid heavy NLP libraries. Ensure deterministic ordering (sort by created_at or priority) to make tests stable.
- [ ] Expose a thin API endpoint GET /api/epics/{epic_id}/summary that returns {summary: string} (optional adapter layer if REST API exists).

## 3. Code Review
- [ ] Verify:
  - Summary text is concise, deterministic, and uses only project-approved templates.
  - Functions are pure (given same DB state they return same string) and have unit tests covering edge cases (no tasks, all complete, highly blocked).
  - Internationalization hooks present (function accepts locale) even if only en_US implemented.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/phase_7/10_approval_and_checkpoints/test_progress_summary.py
- [ ] Run optional smoke: curl GET /api/epics/<epic_id>/summary and assert HTTP 200 and JSON summary exists.

## 5. Update Documentation
- [ ] Add docs/features/progress_summaries.md showing example summaries for three different epic states and explaining how the recommendation is computed.
- [ ] Add a brief note in docs/user-facing/what_to_expect.md so Makers know where to find these summaries in the UI/CLI.

## 6. Automated Verification
- [ ] Add scripts/verify_progress_summary.py which seeds deterministic sample data and asserts that generate_progress_summary returns the golden snapshot; return non-zero on mismatch so CI can run it as a gate.

# Task: Implement Epic Start Review interface (CLI + non-interactive JSON apply) (Sub-Epic: 10_Approval_and_Checkpoints)

## Covered Requirements
- [1_PRD-REQ-HITL-004]

## 1. Initial Test Written
- [ ] Create tests/phase_7/10_approval_and_checkpoints/test_epic_start_review.py. Write this first:
  - Use pytest and a DB fixture to seed an epic with 30 tasks (25+ for review) and a sample requirement mapping.
  - Test the function build_epic_review_snapshot(epic_id) returns JSON with: epic_id, epic_title, tasks:[{task_id,title,status,estimate}], and metadata (task_count, percent_complete).
  - Test apply_epic_review_changes(epic_id, changes) where changes is a list of operations: [{op:'add',task:{title,...}}, {op:'remove',task_id:...}]. Assert that after apply, requirement_task_map and epic_review_snapshots are updated and a new snapshot row exists.
  - The tests must fail before the implementation.

## 2. Task Implementation
- [ ] Implement src/approvals/review.py with two idempotent functions:
  - build_epic_review_snapshot(epic_id) -> dict (does not mutate DB)
  - apply_epic_review_changes(epic_id, changes, actor_id) -> new_snapshot_id (applies add/remove, creates task rows if needed, updates requirement_task_map, writes epic_review_snapshots row with before/after snapshot)
- [ ] Implement a small CLI shim scripts/epic_review.py that accepts `--epic-id` and `--apply-changes <file.json>` and either prints the snapshot (JSON) or applies changes (reads JSON and calls apply_epic_review_changes). Use exit codes for success/failure and write audit log lines to logs/epic_review.log.

## 3. Code Review
- [ ] Verify:
  - apply_epic_review_changes is transactional: either all changes and snapshot are written or none are.
  - There is an audit trail (actor_id, timestamp, changes) captured in epic_review_snapshots or a separate audit table.
  - Tasks added by review include minimal required fields (title, estimate) and are linked into requirement_task_map when provided.
  - CLI is non-interactive and suitable for automation; avoid interactive prompts.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/phase_7/10_approval_and_checkpoints/test_epic_start_review.py
- [ ] Run: python scripts/epic_review.py --epic-id <seeded_epic> and validate printed JSON matches build_epic_review_snapshot output.

## 5. Update Documentation
- [ ] Add docs/cli/epic_review.md explaining the CLI usage, JSON schema for apply-changes, and examples for programmatic use.
- [ ] Add an architectural note to docs/phase_7/10_approval_and_checkpoints/review_design.md describing transaction boundaries and snapshot semantics.

## 6. Automated Verification
- [ ] Add scripts/test_epic_review.sh that seeds test data, runs the CLI to dump snapshot, applies a sample change JSON, and asserts snapshots and DB state updated accordingly. Use this in CI smoke tests.

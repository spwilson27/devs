# Task: Enforce Commit Message Task-ID and Metadata (Sub-Epic: 08_1_PRD)

## Covered Requirements
- [1_PRD-REQ-IMP-008]

## 1. Initial Test Written
- [ ] Add tests that validate CommitNode rejects commits without a valid task_id and that commit messages always include the Task-ID trailer:
  - Attempt commit_changes with missing or empty task_id and assert CommitNode responds with validation error and does not write a git commit or DB row.
  - After a successful commit, assert git show -1 --pretty=%B includes a trailer line "Task-ID: <task_id>" and that commits.sqlite contains a row with matching task_id and commit_hash.

## 2. Task Implementation
- [ ] Implement strict validation and commit message formatting:
  - Validate non-empty task_id and metadata.task_id==task_id.
  - Commit message format:
    - First line: short subject
    - Blank line
    - Body: detailed description
    - Trailer lines (exact labels):
      Task-ID: <task_id>
      Sub-Epic: 08_1_PRD
      Reqs: 1_PRD-REQ-IMP-004,1_PRD-REQ-IMP-008
  - Ensure commits.sqlite has columns (task_id, commit_hash, message_trailer_json, timestamp) and is updated transactionally with the commit.

## 3. Code Review
- [ ] Verify validation covers edge cases (long ids, unicode), and that commit message encoding preserves non-ASCII characters; ensure DB writes are atomic and indexed on task_id.

## 4. Run Automated Tests to Verify
- [ ] Run tests verifying invalid commits are rejected and valid commits include the Task-ID trailer and DB row; test retrieval queries return expected metadata.

## 5. Update Documentation
- [ ] Extend docs/git.md with the commit message template, examples of valid/invalid commits, and SQL examples to query commits by Task-ID.

## 6. Automated Verification
- [ ] Provide scripts/verify_taskid_enforcement.(sh|py) that demonstrates a rejected commit attempt and a successful commit with Task-ID trailer and DB entry; exit 0 only when behavior matches.

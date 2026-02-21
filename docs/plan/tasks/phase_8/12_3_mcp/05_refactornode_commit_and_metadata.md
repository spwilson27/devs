# Task: RefactorNode - Commit Metadata and Task Linking (Sub-Epic: 12_3_MCP)

## Covered Requirements
- [3_MCP-TAS-085]

## 1. Initial Test Written
- [ ] Write tests that assert RefactorNode triggers a CommitNode call with the correct metadata and that commits include Task ID and Node ID in the message and commit metadata.
  - Test file: tests/integration/test_refactornode_commit.py
  - Tests to write first:
    1. test_commit_message_includes_task_and_node: mock CommitNode/CommitClient and assert commit message contains "Refactor: <task_id>" and commit body contains node_id and serialized refactor summary.
    2. test_sqlite_status_update_on_commit: after successful commit, a sqlite record should be written to the repo-state DB with columns {task_id, node_id, commit_sha, status='complete'}.

## 2. Task Implementation
- [ ] Implement the Commit bridging logic:
  - After surgical_edit reports success, RefactorNode should create a CommitPayload including: subject, body, files_changed list, patch_id, node_id, task_id, timestamp.
  - Use the project's CommitNode/CommitClient API to perform a commit; if one does not exist, implement a thin wrapper in src/tools/commit_client.{py,ts} that performs `git add` + `git commit --no-verify -m <message>` and returns commit SHA.
  - On success, write a status record to the project's sqlite state store (use existing DB helpers) linking node_id->commit_sha with status 'complete' and commit timestamp.

## 3. Code Review
- [ ] Verify:
  - Commits are atomic and include Task/Node IDs in both subject and body for traceability.
  - No secrets or large blobs are committed into git; validate file sizes and patterns before committing.
  - Database writes are transactional and won't be left in an inconsistent state if commit fails.

## 4. Run Automated Tests to Verify
- [ ] Execute the integration tests mocking git and sqlite; validate that commit SHA is recorded and that CommitNode was invoked once.

## 5. Update Documentation
- [ ] Update docs/agents/refactor_node.md with the commit message conventions and the sqlite schema change (table/fields used to record node->commit mapping).

## 6. Automated Verification
- [ ] Add an automated verification that replays the commit SHA (git show <sha>) and validates the commit message contains the expected Task and Node IDs. Provide script `scripts/verify_refactor_commit.sh`.

# Task: Implement CommitNode (Atomic Commit) specification and tests (Sub-Epic: 10_1_PRD)

## Covered Requirements
- [1_PRD-REQ-PIL-003]

## 1. Initial Test Written
- [ ] Create tests at tests/tdd/commitnode.commit.test.js (Jest) that validate CommitNode only commits after green tests and records commit metadata atomically.
  - Test steps:
    1. Initialize a temporary git repository in a sandbox with a pre-green snapshot and a succeeding test run.
    2. Call CommitNode API (e.g., require('../src/agents/commit_node').commitTask(sandboxPath, { taskId, author } )).
    3. Assert that a new commit exists, its message contains: `task:<taskId>`, and includes the Co-authored-by: Copilot trailer.
    4. Assert that commit is atomic (no partial staging) and that a local SQLite (or repo state file) record is created mapping taskId -> commitHash.
    5. Verify that CommitNode refuses to commit if the specified workspace has failing tests (simulate by altering a file and running test runner to fail) and returns { status: 'blocked_by_tests' }.

- [ ] Run the test to confirm it fails before implementation.

## 2. Task Implementation
- [ ] Implement src/agents/commit_node.js (or .ts) with function `async commitTask(sandboxPath, { taskId, author })`.
  - Behavior requirements:
    - Verify workspace tests are green by invoking the test runner.
    - If green, create a single atomic commit with message: `task(${taskId}): <short description>` and append the trailer `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`.
    - Store commit metadata in a local SQLite DB (e.g., .devs/git_commits.sqlite) table mapping taskId -> commitHash, author, timestamp.
    - Ensure commit is done in a way that preserves working tree state and is reversible (provide the commitHash on success).
    - If tests are failing, abort and return { status: 'blocked_by_tests', failingTests: <summary> }.

## 3. Code Review
- [ ] Confirm atomicity of commit (use git commands that stage and commit in one flow), correct commit message format, and presence of required Co-authored-by trailer.
- [ ] Validate SQLite writes are transactional (use WAL or explicit transaction) and tests cover both success and failure branches.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest tests/tdd/commitnode.commit.test.js --runInBand` and ensure tests pass, verifying the commit message and SQLite entry.

## 5. Update Documentation
- [ ] Add docs/tas/commit_node.md documenting commit semantics, metadata schema, and the requirement to include the Co-authored-by trailer on all agent commits.

## 6. Automated Verification
- [ ] CI should run the commit test, then inspect the git log and SQLite DB to ensure the mapping taskId -> commitHash is present and that commit messages conform to the format. Fail the pipeline on any deviation.
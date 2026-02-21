# Task: Implement CommitNode for atomic Git commit + SQLite update (Sub-Epic: 03_TAS)

## Covered Requirements
- [TAS-039]

## 1. Initial Test Written
- [ ] Create integration tests at tests/integration/commitnode.commit.spec.ts that operate inside a temporary git repository (use `tmp` or `fs.mkdtempSync`) and an in-memory SQLite DB. Tests to write first:
  - Test A: "CommitNode writes a git commit and updates tasks.git_head in a single transaction"
    - Arrange: initialize a temp git repo, create a file, stage it
    - Act: call CommitNode.commit(taskId, commitMessage)
    - Assert: git rev-parse HEAD returns a hash, and the tasks table row for taskId has git_head === that hash
  - Test B: "On git failure, database transaction is rolled back"
    - Arrange: simulate git failure (e.g., make git return non-zero), call CommitNode.commit
    - Assert: DB changes are not persisted (task status unchanged)

## 2. Task Implementation
- [ ] Implement src/tas/CommitNode.ts (TypeScript) with method commit(taskId: string, message: string, options?: {author?: string}): Promise<{commitHash: string}>.
  - Implementation details:
    1. Open a SQLite transaction.
    2. Stage changes (ensure working directory is that of the sandbox/task workspace).
    3. Run `git commit -m <message> --author <author>` using a safe child_process wrapper; do NOT shell interpolate untrusted input.
    4. After successful commit, run `git rev-parse HEAD` to obtain commit hash.
    5. Update tasks table with the git_head and status='done' within the same DB transaction.
    6. If any step fails, rollback DB transaction and revert any partial git state (e.g., `git reset --soft HEAD~1` if commit partially applied).
    7. Emit tracing events tagged with REQ:[TAS-039] and attach commitHash in the trace payload.
  - Security: sanitize inputs, use parameterized DB queries, do not write secrets into commit messages.

## 3. Code Review
- [ ] Verify atomicity: confirm DB transaction wraps the update and commit result write; confirm safe child_process usage (no shell=True), and confirm proper rollback behavior.
- [ ] Ensure CommitNode has comprehensive logging and JSDoc and unit tests for error paths.

## 4. Run Automated Tests to Verify
- [ ] Run integration tests: `pnpm vitest tests/integration/commitnode.commit.spec.ts --run` and ensure commit hash in DB matches `git rev-parse HEAD`.

## 5. Update Documentation
- [ ] Add docs/tas/commitnode.md explaining the CommitNode contract, rollback semantics, and the requirement to store git_head for hard rewind. Reference [TAS-039].

## 6. Automated Verification
- [ ] Create a verification script scripts/tas/verify_commitnode.js that:
    1. Initializes a temp git repo and in-memory DB, 
    2. Performs CommitNode.commit, 
    3. Asserts DB tasks.git_head equals `git rev-parse HEAD`, 
    4. Exits non-zero on mismatch.

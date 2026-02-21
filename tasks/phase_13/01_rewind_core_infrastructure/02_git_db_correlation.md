# Task: Git-DB Correlation — Persist HEAD Hash on Task Completion (Sub-Epic: 01_Rewind Core Infrastructure)

## Covered Requirements
- [TAS-047], [3_MCP-REQ-REL-003]

## 1. Initial Test Written
- [ ] Write a unit test (`src/state/__tests__/gitDbCorrelation.test.ts`) that mocks `simple-git` and asserts that `recordTaskCompletion(db, taskId)` calls `git.revparse(['HEAD'])` to obtain the current HEAD hash.
- [ ] Write a unit test that asserts `recordTaskCompletion` updates the `tasks` row (identified by `taskId`) with `status = 'completed'`, `git_head = <mocked_sha>`, and `completed_at = <ISO timestamp>` inside a single `withTransaction` call.
- [ ] Write a unit test that asserts `recordTaskCompletion` inserts a row into `state_transitions` with `from_status = 'in_progress'`, `to_status = 'completed'`, and `metadata` containing `{"git_head": "<sha>"}`.
- [ ] Write an integration test using a real temporary Git repository (`tmp-git-repo` via `execa` `git init`) and a real SQLite DB (`:memory:` via `openDatabase`) that:
  1. Creates a task row in `tasks` with `status = 'in_progress'`.
  2. Makes a real commit in the temp repo.
  3. Calls `recordTaskCompletion(db, taskId, repoPath)`.
  4. Asserts that `SELECT git_head FROM tasks WHERE id = ?` returns the exact SHA of the commit just made.
- [ ] Write an integration test asserting that if `git.revparse` throws (e.g., no commits yet), `recordTaskCompletion` throws and leaves the `tasks` row unchanged (rollback verified).

## 2. Task Implementation
- [ ] Create `src/state/gitCorrelation.ts` that exports:
  - `getCurrentHead(repoPath: string): Promise<string>` — uses `simple-git(repoPath).revparse(['HEAD'])` and trims whitespace.
  - `recordTaskCompletion(db: Database, taskId: string, repoPath: string): Promise<void>` — wraps the following in `withTransaction`:
    1. Calls `getCurrentHead(repoPath)`.
    2. Reads the current `status` from the `tasks` table for `taskId` (throws if not found or not `in_progress`).
    3. Updates `tasks` SET `status = 'completed'`, `git_head = <sha>`, `completed_at = <now ISO>`.
    4. Inserts into `state_transitions`: `task_id = taskId`, `from_status = 'in_progress'`, `to_status = 'completed'`, `metadata = JSON.stringify({git_head: sha})`.
- [ ] Add `simple-git` to `package.json` dependencies if not already present.
- [ ] Export `recordTaskCompletion` from `src/state/index.ts` (create this barrel if absent).

## 3. Code Review
- [ ] Verify the Git HEAD read and the SQLite write are wrapped in the same `withTransaction` call, ensuring no partial writes (DB updated but git read failed is impossible; git read but DB write fails rolls back).
- [ ] Verify a guard clause throws a descriptive `Error` if the task is not in `in_progress` status before attempting any writes (prevents accidental double-completion).
- [ ] Verify `getCurrentHead` trims whitespace from `simple-git` output to prevent SHA comparison mismatches.
- [ ] Confirm no `any` types are used; `Database` is typed from `better-sqlite3`, `repoPath` is `string`.
- [ ] Confirm the function is `async` only for the `simple-git` call; all SQLite operations remain synchronous (`better-sqlite3`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/state/__tests__/gitDbCorrelation"` and confirm all tests pass.
- [ ] Run `npm run type-check` and confirm zero TypeScript errors in `src/state/gitCorrelation.ts`.

## 5. Update Documentation
- [ ] Update `src/state/state.agent.md` to add a section: **Git-DB Correlation** — describing that `recordTaskCompletion` is the single call-site for marking a task done, and that the `git_head` stored in `tasks` is the canonical pointer for filesystem restoration during rewind.
- [ ] Add a sequence diagram (Mermaid) to `docs/architecture.md` illustrating the flow: `TaskRunner` → `recordTaskCompletion` → `getCurrentHead` + `withTransaction(UPDATE tasks, INSERT state_transitions)`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/state/__tests__/gitDbCorrelation" --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm the gate passes.
- [ ] Run the integration test suite specifically (`npm test -- --testPathPattern="gitDbCorrelation" --testNamePattern="integration"`) and confirm the real-Git + real-SQLite test passes.

# Task: Implement Requirement-to-Commit Git Tagging with SQLite Task Record Linking (Sub-Epic: 12_Audit Logging and Traceability)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-064]

## 1. Initial Test Written

- [ ] Create `src/git/__tests__/CommitTagger.test.ts` using Vitest.
- [ ] Write a unit test: `CommitTagger.buildTrailerLines(taskId: string, reqIds: string[]): string[]` returns an array of Git trailer strings in the format `Devs-Req: REQ_ID` for each `reqId` and `Devs-Task: taskId`. Example input `taskId="task_042"`, `reqIds=["5_SECURITY_DESIGN-REQ-SEC-SD-064", "TAS-071"]` must produce:
  ```
  ["Devs-Task: task_042", "Devs-Req: 5_SECURITY_DESIGN-REQ-SEC-SD-064", "Devs-Req: TAS-071"]
  ```
- [ ] Write a unit test: `CommitTagger.amendCommit(commitHash: string, trailers: string[]): Promise<string>` — mock `execa` to capture the `git commit --amend --no-edit -m` call and verify that:
  - The commit message includes all trailer lines appended after a blank line.
  - The function returns the new commit hash extracted from `git rev-parse HEAD`.
- [ ] Write a unit test: `CommitTagger.updateTaskRecord(db: Database, taskId: string, commitHash: string): Promise<void>` — mock the SQLite `Database`, verify it executes `UPDATE tasks SET git_commit_hash = ? WHERE id = ?` with correct parameters and that it is called exactly once.
- [ ] Write a unit test: `CommitTagger.run(taskId, reqIds, dbPath): Promise<void>` — mock `git rev-parse HEAD` to return a known hash, mock `amendCommit`, mock `updateTaskRecord`. Verify all three internal calls are made in sequence.
- [ ] Write an integration test: in a temporary git repository (use `tmp` + `simple-git`), make an initial commit, call `CommitTagger.run(taskId, reqIds, dbPath)`, then read the latest commit message via `git log -1 --format=%B` and assert trailer lines are present. Also assert the `state.sqlite` `tasks.git_commit_hash` field equals the new commit hash.

## 2. Task Implementation

- [ ] Create `src/git/CommitTagger.ts`. Export a class `CommitTagger` with:
  - `buildTrailerLines(taskId: string, reqIds: string[]): string[]` — produces `["Devs-Task: <taskId>", ...reqIds.map(r => \`Devs-Req: \${r}\`)]`.
  - `getHeadCommitHash(): Promise<string>` — runs `git rev-parse HEAD` via `execa`, returns trimmed stdout.
  - `amendCommit(trailers: string[]): Promise<string>` — fetches current HEAD message via `git log -1 --format=%B`, appends a blank line and all trailers, runs `git commit --amend --no-edit --message="<amended>"`. Returns new HEAD hash via `getHeadCommitHash()`.
  - `updateTaskRecord(db: Database, taskId: string, commitHash: string): Promise<void>` — executes `UPDATE tasks SET git_commit_hash = ? WHERE id = ?` within a transaction.
  - `run(taskId: string, reqIds: string[], dbPath: string): Promise<void>` — orchestrates: build trailers → amend commit → update DB record. Logs all steps via `Logger`.
- [ ] Integrate `CommitTagger.run()` into the `CommitNode` execution step in `src/orchestrator/nodes/CommitNode.ts`: after `git commit` succeeds, call `CommitTagger.run(task.id, task.requirementIds, STATE_DB_PATH)`.
- [ ] Ensure the `tasks` table schema in `src/db/schema.ts` has a `git_commit_hash TEXT` column. Add a migration if it is missing.
- [ ] Add `// [5_SECURITY_DESIGN-REQ-SEC-SD-064]` inline comment above the `CommitTagger` class declaration.

## 3. Code Review

- [ ] Verify that `amendCommit` does NOT force-push or alter any remote ref — it only amends the local HEAD.
- [ ] Confirm `updateTaskRecord` uses a parameterized query (no string interpolation) to prevent SQL injection.
- [ ] Ensure the `Devs-Task:` and `Devs-Req:` trailer keys conform to the Git trailer convention (colon + space, no leading whitespace on the key).
- [ ] Check that `CommitTagger.run()` is idempotent: if `git_commit_hash` is already set for the task, it logs a warning and skips the amend to avoid double-amending.
- [ ] Verify TypeScript strict mode compliance: all parameters typed, no `any`.

## 4. Run Automated Tests to Verify

- [ ] Run `npm run test -- src/git/__tests__/CommitTagger.test.ts` — all unit tests pass.
- [ ] Run `npm run test:integration -- CommitTagger` — integration test against real temp git repo passes.
- [ ] Run `npm run lint` and `npm run typecheck` — zero errors.

## 5. Update Documentation

- [ ] Create `src/git/CommitTagger.agent.md` with:
  - Purpose: tags every generated Git commit with `Devs-Task:` and `Devs-Req:` trailers, then records the commit hash in `state.sqlite tasks.git_commit_hash`.
  - Integration point: invoked from `CommitNode` after successful commit.
  - Idempotency guarantee: skips if `git_commit_hash` already populated.
  - Covered requirement: `[5_SECURITY_DESIGN-REQ-SEC-SD-064]`.
- [ ] Update `docs/architecture/git-strategy.md` to describe the commit tagging convention and trailer format.

## 6. Automated Verification

- [ ] Run `node scripts/validate-all.js --check CommitTagger` — the script must assert:
  1. `src/git/CommitTagger.ts` exists and exports a `CommitTagger` class.
  2. `src/git/CommitTagger.agent.md` exists (AOD density check).
  3. All tests in `src/git/__tests__/` pass via `vitest run`.
  4. The string `// [5_SECURITY_DESIGN-REQ-SEC-SD-064]` appears in `src/git/CommitTagger.ts`.
  5. The `tasks` table in `state.sqlite` (or its migration file) has a `git_commit_hash` column defined.

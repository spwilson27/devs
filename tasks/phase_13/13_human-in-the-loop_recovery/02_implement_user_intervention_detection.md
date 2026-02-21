# Task: Implement User Intervention Detection for Manual src/ Modifications (Sub-Epic: 13_Human-in-the-Loop Recovery)

## Covered Requirements
- [8_RISKS-REQ-075]

## 1. Initial Test Written
- [ ] Create `src/recovery/__tests__/UserInterventionDetector.test.ts` with the following test coverage:
  - **Unit: `detect()` returns empty on clean workspace** — Stage a Git repo with no uncommitted changes in `src/`; assert `UserInterventionDetector.detect(repoPath)` returns `{ hasIntervention: false, modifiedFiles: [] }`.
  - **Unit: `detect()` identifies unstaged modifications in `src/`** — Write a change to `src/foo.ts` without staging; assert `detect()` returns `{ hasIntervention: true, modifiedFiles: ['src/foo.ts'] }`.
  - **Unit: `detect()` identifies staged but uncommitted modifications in `src/`** — Stage a change to `src/bar.ts`; assert `detect()` returns `{ hasIntervention: true, modifiedFiles: ['src/bar.ts'] }`.
  - **Unit: `detect()` ignores changes outside `src/`** — Write a change to `docs/README.md` without staging; assert `detect()` returns `{ hasIntervention: false, modifiedFiles: [] }`.
  - **Unit: `detect()` ignores untracked files in `src/`** — Add a new untracked file `src/new.ts`; assert `detect()` returns `{ hasIntervention: false, modifiedFiles: [] }` (untracked files are not user interventions in tracked code).
  - **Unit: `getInterventionSince(commitSha)` returns files changed after a given commit** — Create two commits with changes to `src/a.ts` and `src/b.ts` respectively; call `getInterventionSince(firstCommitSha)` and assert only `src/b.ts` is returned.
  - **Integration: `detect()` works on a real temp Git repo** — Use `tmp` package to create a real temporary Git repo, make an uncommitted change to a `src/` file, and assert detection succeeds end-to-end.

## 2. Task Implementation
- [ ] Create `src/recovery/UserInterventionDetector.ts`:
  - Export interface `InterventionReport { hasIntervention: boolean; modifiedFiles: string[]; }`.
  - Export class `UserInterventionDetector` accepting `repoPath: string` in its constructor.
  - Implement `async detect(): Promise<InterventionReport>`:
    - Run `git status --porcelain src/` via `execa` (or Node `child_process.execFile`) with `cwd: this.repoPath`.
    - Parse output lines; collect entries with status codes `M`, `MM`, `AM`, `D`, `AD` (modified, deleted) that start with `src/`.
    - Return `{ hasIntervention: modifiedFiles.length > 0, modifiedFiles }`.
  - Implement `async getInterventionSince(commitSha: string): Promise<string[]>`:
    - Run `git diff --name-only <commitSha> HEAD -- src/` via `execa`.
    - Return the list of file paths.
- [ ] Create `src/recovery/index.ts` (or update if exists) to export `UserInterventionDetector` and `InterventionReport`.
- [ ] Integrate `UserInterventionDetector` into the `HumanInTheLoopManager.pause()` flow: before pausing, call `detector.detect()` and persist `interventionReport` as a JSON field on the `hitl_sessions` row (`intervention_report_json TEXT`).
- [ ] Add `intervention_report_json TEXT` column to the `hitl_sessions` migration (add an `ALTER TABLE` migration or update `013_create_hitl_sessions.sql` if not yet applied).
- [ ] Expose a `devs status --intervention` CLI flag in `src/cli/commands/status.ts` that prints the intervention report for the current pending HITL session.

## 3. Code Review
- [ ] Confirm `execa` calls use `execFile` (not `exec` with shell interpolation) to prevent shell injection via `repoPath`.
- [ ] Verify `repoPath` is validated to be an absolute path under the project root before any Git command is run.
- [ ] Confirm output parsing handles CRLF line endings and files with spaces in paths (quoted by Git with `-z` flag if needed).
- [ ] Verify `getInterventionSince` validates `commitSha` matches `/^[0-9a-f]{7,40}$/i` before passing to Git.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=UserInterventionDetector` and confirm all tests pass with zero failures.
- [ ] Run `npm test -- --coverage --testPathPattern=UserInterventionDetector` and confirm line coverage ≥ 90% for `UserInterventionDetector.ts`.

## 5. Update Documentation
- [ ] Create `src/recovery/UserInterventionDetector.agent.md` documenting: purpose, `detect()` and `getInterventionSince()` API contracts, what constitutes a "user intervention" (modified/deleted tracked files in `src/` only), and security invariants around path validation.
- [ ] Update `docs/cli.md` to document the `devs status --intervention` flag.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=UserInterventionDetector --reporter=json > /tmp/intervention_detector_results.json` and assert `numFailedTests === 0` by running `node -e "const r=require('/tmp/intervention_detector_results.json'); process.exit(r.numFailedTests)"`.
- [ ] Run `npm run build` and confirm TypeScript compilation emits zero errors.

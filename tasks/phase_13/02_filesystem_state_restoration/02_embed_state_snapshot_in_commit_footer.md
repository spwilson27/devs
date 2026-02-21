# Task: Embed State Snapshot Block in Every Git Commit Footer (Sub-Epic: 02_Filesystem State Restoration)

## Covered Requirements
- [8_RISKS-REQ-085]

## 1. Initial Test Written
- [ ] In `src/git/__tests__/commit-writer.test.ts`, write unit tests that verify:
  - `buildCommitMessage({ subject, body, snapshot })` returns a string containing a `State-Snapshot:` footer section after two blank lines (Git trailer convention).
  - The snapshot section includes: `task_id`, `phase_id`, `requirements_met` (array of REQ IDs), `requirements_open` (array), and `timestamp` (ISO-8601).
  - Calling `buildCommitMessage` with a missing `snapshot` argument throws a `MissingSnapshotError`.
  - The footer is parseable back by `parseCommitSnapshot(commitMessage)` returning the original snapshot object.
- [ ] In `src/git/__tests__/commit-writer.integration.test.ts`, write an integration test that:
  - Initialises a temp bare git repo with `git init`.
  - Calls `commitWithSnapshot({ cwd, message, snapshot })` and then runs `git log --format="%B" -n 1`.
  - Asserts the raw commit body includes the `State-Snapshot:` JSON block verbatim.

## 2. Task Implementation
- [ ] **Snapshot Type**: In `src/git/commit-writer.types.ts`, define:
  ```typescript
  export interface CommitStateSnapshot {
    task_id: string;
    phase_id: string;
    requirements_met: string[];
    requirements_open: string[];
    timestamp: string; // ISO-8601
  }
  ```
- [ ] **Message Builder**: In `src/git/commit-writer.ts`, implement:
  ```typescript
  export function buildCommitMessage(opts: {
    subject: string;
    body?: string;
    snapshot: CommitStateSnapshot;
  }): string
  ```
  Format:
  ```
  <subject>

  <body>

  State-Snapshot: <JSON.stringify(snapshot)>
  ```
- [ ] **Snapshot Parser**: In `src/git/commit-writer.ts`, implement:
  ```typescript
  export function parseCommitSnapshot(rawMessage: string): CommitStateSnapshot | null
  ```
  Uses a regex to extract the `State-Snapshot:` trailer line and `JSON.parse` its value.
- [ ] **Git Commit Wrapper**: In `src/git/git.utils.ts`, implement:
  ```typescript
  export async function commitWithSnapshot(opts: {
    cwd: string;
    message: string;
    snapshot: CommitStateSnapshot;
  }): Promise<string> // returns new commit SHA
  ```
  Calls `git commit -m "<buildCommitMessage(...)>"` using `execa`.
- [ ] **Orchestrator Hook**: In `src/orchestrator/task-runner.ts`, replace any direct `git commit` calls with `commitWithSnapshot`, passing the current task's requirement fulfillment status retrieved from `src/db/requirements.repository.ts`.

## 3. Code Review
- [ ] Confirm the `State-Snapshot:` footer follows [Git trailer format](https://git-scm.com/docs/git-interpret-trailers) (key: value on its own line) so tooling that parses trailers works correctly.
- [ ] Verify `JSON.stringify(snapshot)` output is on a **single line** (no newlines inside) so `git log --format="%B"` can extract it with a single-line regex.
- [ ] Confirm `parseCommitSnapshot` handles commits that pre-date this feature (no trailer present) by returning `null` gracefully, not throwing.
- [ ] Check that `requirements_met` and `requirements_open` arrays are deduplicated and sorted before serialization for deterministic diffs.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="commit-writer"` and confirm all new tests pass.
- [ ] Run `tsc --noEmit` to confirm no TypeScript errors.

## 5. Update Documentation
- [ ] Update `src/git/commit-writer.agent.md` to document the `State-Snapshot` footer: schema, format, and how to parse it programmatically.
- [ ] Add a section to `docs/architecture/state-management.md` titled "Commit State Snapshot" explaining the footer format and its role in enabling `devs rewind` to determine requirement fulfillment at any historical point.

## 6. Automated Verification
- [ ] Run `npm test -- --ci --testPathPattern="commit-writer"` and assert exit code `0`.
- [ ] Run the integration test suite's git-based test: parse the `State-Snapshot:` line from the test repo commit and assert `JSON.parse` succeeds without errors.
- [ ] Run `git log --format="%B" -n 1` in the integration test temp dir and pipe to `grep "State-Snapshot:"` — assert the exit code is `0` (line found).

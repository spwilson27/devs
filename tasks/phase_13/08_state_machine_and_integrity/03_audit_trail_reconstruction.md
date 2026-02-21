# Task: Implement Git Commit Footer Parser for Audit Trail Reconstruction (Sub-Epic: 08_State Machine and Integrity)

## Covered Requirements
- [8_RISKS-REQ-083]

## 1. Initial Test Written
- [ ] In `packages/devs-core/src/audit/__tests__/commit-footer-parser.test.ts`, write unit tests for a `CommitFooterParser` class:
  - `parse(commitMessage: string): CommitFooterMetadata`:
    - Returns `{ taskId: 'TASK-042', reqIds: ['8_RISKS-REQ-001', '1_PRD-REQ-INT-006'], phaseId: 'phase_13' }` when given a commit message containing a correctly formatted footer block.
    - Returns `{ taskId: null, reqIds: [], phaseId: null }` when the commit message has no structured footer.
    - Returns `{ taskId: 'TASK-042', reqIds: [], phaseId: 'phase_13' }` when `Req-Ids` footer key is absent but `Task-Id` and `Phase-Id` are present.
    - Throws `MalformedCommitFooterError` when a footer key is present but its value is empty string.
  - `parseAll(commitMessages: string[]): CommitFooterMetadata[]`: returns an array of parsed results, skipping commits without footers (not throwing).
- [ ] In `packages/devs-core/src/audit/__tests__/audit-trail-reconstructor.test.ts`, write integration tests for `AuditTrailReconstructor`:
  - `reconstruct(repoPath: string): Promise<AuditTrail>`:
    - Calls `git log --format="%H%n%B%n---COMMIT-END---"` on the given repo path and feeds each commit body through `CommitFooterParser`.
    - Returns an `AuditTrail` with a `entries` array where each entry has `{ sha: string, taskId: string | null, reqIds: string[], phaseId: string | null, timestamp: Date }`.
    - Filters out entries where `taskId` is `null` (non-devs commits).
    - Emits `AuditTrailReconstructed` event with the full trail after completion.
  - Mock `child_process.execFile` to return a fixed git log output string; assert parsed entries match expected shape.

## 2. Task Implementation
- [ ] Create `packages/devs-core/src/audit/commit-footer-parser.ts`:
  - Define the structured footer format (Git trailer convention):
    ```
    Task-Id: TASK-042
    Phase-Id: phase_13
    Req-Ids: 8_RISKS-REQ-001, 1_PRD-REQ-INT-006
    ```
  - `CommitFooterParser` class with `parse(commitMessage: string): CommitFooterMetadata` using regex to extract trailer key-value pairs from the last paragraph of the commit message.
  - Throws `MalformedCommitFooterError` (from `errors.ts`) when a recognized key has an empty value.
- [ ] Create `packages/devs-core/src/audit/audit-trail-reconstructor.ts`:
  - `AuditTrailReconstructor` class with injected `GitService` and `CommitFooterParser`.
  - `reconstruct(repoPath: string): Promise<AuditTrail>`:
    1. Calls `GitService.log(repoPath, ['--format=%H%n%B%n---COMMIT-END---'])` to get all commit SHAs and bodies.
    2. Splits output on `---COMMIT-END---` delimiter.
    3. For each chunk: extracts the SHA (first line) and passes remainder to `CommitFooterParser.parse()`.
    4. Builds `AuditTrailEntry[]`, filtering null `taskId` entries.
    5. Emits `AuditTrailReconstructed` event.
    6. Returns `{ entries: AuditTrailEntry[], generatedAt: Date }`.
- [ ] Export all from `packages/devs-core/src/audit/index.ts`.
- [ ] Ensure all devs-generated commits use the structured footer format by updating the `GitService.commit()` method in `packages/devs-core/src/git/git-service.ts` to accept and append `CommitFooterMetadata` to the commit message.

## 3. Code Review
- [ ] Verify the commit footer parser uses the standard Git trailer format (key: value, one per line, separated from body by a blank line) and does not rely on positional parsing.
- [ ] Confirm `AuditTrailReconstructor.reconstruct()` handles repositories with zero devs-formatted commits gracefully (returns `{ entries: [] }`).
- [ ] Ensure `GitService.log()` uses `execFile` (not `exec`) to prevent shell injection from commit message content.
- [ ] Confirm `MalformedCommitFooterError` includes the raw commit SHA and the offending line for debuggability.
- [ ] Verify `Req-Ids` is parsed as a comma-separated list and each ID is trimmed of whitespace.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter devs-core test -- --testPathPattern="audit"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter devs-core test -- --coverage --testPathPattern="audit"` and confirm ≥ 90% line/branch coverage for `audit/` directory.

## 5. Update Documentation
- [ ] Create `packages/devs-core/src/audit/audit-trail-reconstructor.agent.md` documenting:
  - The expected Git commit footer schema with an example commit message.
  - How `reconstruct()` should be called (after `devs resume` or `devs rewind` to verify state).
  - The `AuditTrail` data shape and what each field represents.
  - Edge cases: non-devs commits are silently skipped; malformed footers throw and are logged to `agent_logs`.
- [ ] Update `docs/architecture/audit-trail.md` describing the commit footer convention and how it supports forensic reconstruction.

## 6. Automated Verification
- [ ] Run `pnpm --filter devs-core test:ci` and assert exit code is `0`.
- [ ] Run `scripts/smoke-audit.sh`:
  ```bash
  #!/usr/bin/env bash
  set -e
  # Create a temp git repo with one devs-formatted commit
  TMPDIR=$(mktemp -d)
  cd "$TMPDIR" && git init && git commit --allow-empty -m "feat: initial
  
  Task-Id: TASK-001
  Phase-Id: phase_01
  Req-Ids: 8_RISKS-REQ-001"
  node -e "
    const { AuditTrailReconstructor } = require('./packages/devs-core/dist');
    const r = new AuditTrailReconstructor();
    r.reconstruct('$TMPDIR').then(trail => {
      if (trail.entries.length !== 1) process.exit(1);
      if (trail.entries[0].taskId !== 'TASK-001') process.exit(1);
    });
  "
  rm -rf "$TMPDIR"
  echo "PASS: AuditTrailReconstructor smoke test"
  ```
  Assert exit code is `0`.

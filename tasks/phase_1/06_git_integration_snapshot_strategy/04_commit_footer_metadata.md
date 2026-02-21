# Task: Format Commit Messages with State Footers (Sub-Epic: 06_Git Integration & Snapshot Strategy)

## Covered Requirements
- [8_RISKS-REQ-085]

## 1. Initial Test Written
- [ ] Write unit tests for `CommitMessageGenerator.generate(taskId, snapshot)`.
- [ ] Verify that the generated message includes the task ID in the title.
- [ ] Verify that the footer contains a `devs-state-snapshot: <JSON_OR_HASH>` line.
- [ ] Verify that the footer contains a `TASK-ID: <ID>` line for easy grep-ability.
- [ ] Ensure that the message follows conventional commit standards (e.g., `task(core): implement feature X`).

## 2. Task Implementation
- [ ] Create `@devs/core/src/git/CommitMessageGenerator.ts`.
- [ ] Implement `generate(taskId: string, metadata: object)`:
    - Title: `task: complete {taskId}`.
    - Description: Brief summary of the task if available.
    - Footer: `TASK-ID: {taskId}
devs-state-snapshot: {compact_state_json_or_hash}`.
- [ ] Integrate this into `SnapshotManager.createTaskSnapshot`.
- [ ] Ensure the snapshot in the footer is either a hash of the current SQLite state or a compact JSON blob of critical state fields (projects, requirements).

## 3. Code Review
- [ ] Verify that the footer contains the "State snapshot" as per 8_RISKS-REQ-085.
- [ ] Ensure the metadata in the footer does not exceed git's recommended message size (e.g., keep it under 1KB).
- [ ] Check that the format is consistent across all tasks.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test -- @devs/core/src/git/CommitMessageGenerator.test.ts`.

## 5. Update Documentation
- [ ] Document the commit message standard in the Project Roadmap or Architecture doc.

## 6. Automated Verification
- [ ] Run a test git commit and verify that `git log -n 1 --pretty=format:%B` contains the `devs-state-snapshot` and `TASK-ID` fields.

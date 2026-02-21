# Task: Hard Rewind Implementation with Filesystem Fidelity (Sub-Epic: 09_Determinism & Robustness Testing)

## Covered Requirements
- [9_ROADMAP-REQ-038], [8_RISKS-REQ-069]

## 1. Initial Test Written
- [ ] Write an integration test for `devs rewind <taskId>`.
- [ ] Setup steps:
    1. Create a project with multiple tasks and commits.
    2. Store a checksum of the filesystem and the `tasks` table state at Task 2.
    3. Complete Task 3 and Task 4.
    4. Execute `rewind` to Task 2.
- [ ] Assertions:
    - Filesystem checksum matches the stored checksum at Task 2.
    - SQLite `tasks` table has deleted/marked entries after Task 2.
    - `git log` shows the HEAD at the commit hash associated with Task 2.

## 2. Task Implementation
- [ ] Implement `Orchestrator.rewind(targetTaskId: string)` in `@devs/core`.
- [ ] The implementation must:
    1. Fetch the `git_commit_hash` from the `tasks` table for the `targetTaskId`.
    2. Execute `git checkout <hash> --force` to restore the filesystem.
    3. Execute a database transaction to remove or "void" all `agent_logs`, `tasks`, `requirements`, and `checkpoints` that were created AFTER the `targetTaskId`.
    4. Reset the LangGraph state to the checkpoint associated with the `targetTaskId`.
- [ ] Add a confirmation prompt in the CLI/VSCode before performing the destructive rewind.

## 3. Code Review
- [ ] Ensure the `--force` flag is used carefully to handle untracked files (verify if they should be deleted or kept).
- [ ] Confirm that the database rollback is truly ACID and won't leave the system in a partial state if the `git checkout` fails.
- [ ] Verify that the rewind logic correctly handles branch state if the project is using multiple branches (though Phase 1 assumes single-branch `main`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test --workspace=@devs/core` integration tests.
- [ ] Perform a manual `devs rewind` on a test project and verify the filesystem "Time-Travel" effect.

## 5. Update Documentation
- [ ] Add a section to the User Guide on "Disaster Recovery & Rewinding".
- [ ] Update the `CLI.md` documentation for the `rewind` command.

## 6. Automated Verification
- [ ] Execute `scripts/verify_rewind_fidelity.ts` which performs a rewind and validates the SHA-256 hash of the entire workspace against a known-good snapshot.

# Task: Implement Git Exclusion and Hidden Files Strategy (Sub-Epic: 06_Git Integration & Snapshot Strategy)

## Covered Requirements
- [UNKNOWN-601], [UNKNOWN-602]

## 1. Initial Test Written
- [ ] Write tests for `GitIgnoreManager.ensureStandardIgnores()`.
- [ ] Verify that `.devs/` is added to the `.gitignore` file of the generated project.
- [ ] Verify that `.git/` (the host repo) is never accidentally staged.
- [ ] Test `SnapshotManager` with a dummy `.devs/state.sqlite` file and ensure it is NOT staged by `git add .`.
- [ ] Test handling of other hidden files (e.g., `.env`, `.agent.md`) to ensure they are handled according to policy.

## 2. Task Implementation
- [ ] Create `@devs/core/src/git/GitIgnoreManager.ts`.
- [ ] Implement logic to automatically append `.devs/` and other internal directories to the project's `.gitignore` if not present.
- [ ] Refine `SnapshotManager` to explicitly use the exclusion strategy:
    - Ensure `.devs/` is never included in the "Project Evolution" git trail.
    - Implement the "state.sqlite git strategy" (UNKNOWN-601): Decide if `.devs/state.sqlite` should be ignored or if it needs a separate "Shadow Git" (for now, follow the requirement to exclude it from Developer Agent write-access and standard project git).
- [ ] Implement "Hidden project files handling" (UNKNOWN-602) to ensure `.agent/` and other metadata folders are correctly tracked or ignored as specified in TAS-104.

## 3. Code Review
- [ ] Confirm that `.devs/` directory is strictly excluded from the standard project git repository to prevent state corruption or leakage.
- [ ] Verify that the `state.sqlite` strategy aligns with the "Flight Recorder" pattern.
- [ ] Ensure that `.agent/` documentation files ARE tracked in git (AOD density requirement).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` and verify `.gitignore` content and staging behavior.

## 5. Update Documentation
- [ ] Add a section on `Git Ignore Policy` to the project's technical documentation.

## 6. Automated Verification
- [ ] Run `git status --ignored` in a test workspace and verify that `.devs/` appears in the ignored list.

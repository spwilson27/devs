# Task: Roadmap Reconstruction from Git Metadata and Specs (Sub-Epic: 09_Determinism & Robustness Testing)

## Covered Requirements
- [8_RISKS-REQ-084]

## 1. Initial Test Written
- [ ] Write a test `tests/integration/roadmap_reconstruction.test.ts`.
- [ ] Scenario:
    1. Initialize a project, generate requirements and tasks.
    2. Commit several tasks to Git (each commit message includes `[TASK-ID: REQ-ID]`).
    3. Manually delete the `.devs/state.sqlite` file.
    4. Invoke `devs doctor --reconstruct`.
- [ ] Assertions:
    - The `requirements` table is repopulated from the `specs/` directory.
    - The `tasks` table is repopulated by parsing the `git log` and mapping commit hashes to Task IDs.
    - The `projects` table reflects the correct current status based on the last commit found.

## 2. Task Implementation
- [ ] Implement `RoadmapReconstructor` in `@devs/core/persistence`.
- [ ] Create a `SpecScanner` that parses Markdown files in `docs/` and `requirements/` to extract requirement metadata.
- [ ] Create a `GitLogParser` that iterates through the repository history and extracts structured metadata (Task IDs, requirement mappings) from commit messages.
- [ ] Add a "Reconciliation" logic that merges findings from both sources to rebuild the SQLite state.
- [ ] Ensure that existing records are not overwritten unless a `--force` flag is used.

## 3. Code Review
- [ ] Verify the regex used to parse commit messages (e.g., `\[Task: (.*)\] \[Req: (.*)\]`).
- [ ] Ensure the reconstruction logic handles gaps in the git history (e.g., manual commits without metadata).
- [ ] Confirm that the reconstruction process is logged as a specific event in `agent_logs`.

## 4. Run Automated Tests to Verify
- [ ] Run the reconstruction integration test.
- [ ] Verify that `devs status` returns the correct progress after a successful reconstruction.

## 5. Update Documentation
- [ ] Document the "Metadata in Commits" standard in the `TAS` to ensure future agents follow the format required for reconstruction.
- [ ] Update the `CLI.md` for the `doctor` command.

## 6. Automated Verification
- [ ] Run `scripts/verify_reconstruction.ts` which wipes the DB, reconstructs it, and compares the resulting task DAG with a saved "golden" JSON roadmap.

# Foundation Milestone (M1) Definition of Done (DoD)

This document lists the exact checklist used by the FoundationValidator to determine whether the Foundation milestone (M1 — Phases 1 & 2) is complete.

Checklist (all must pass):

1. Existence of runtime state
   - .devs/state.sqlite file exists at the project root (resolve via findProjectRoot()).

2. Schema integrity
   - All 7 core Flight Recorder tables exist in the state DB:
     - projects, documents, requirements, epics, tasks, agent_logs, entropy_events

3. Git workspace integrity
   - Workspace is not dirty (no unstaged/staged/untracked changes that would pollute snapshots).
   - HEAD is reachable (an initial commit exists).
   - HEAD is not detached (repository is on a branch).
   - Git object-store passes a connectivity-only fsck when available.

4. Monorepo modules
   - packages/core/package.json must exist and declare "name": "@devs/core".
   - packages/cli/package.json must exist and declare "name": "@devs/cli".

5. Milestone task completion
   - All atomic tasks belonging to epics with order_index in [1, 2] are marked `completed` in the `tasks` table.
   - If any tasks are not completed, the validator lists each incomplete task id, title, and status.

6. Reporting
   - On success: validator returns `passed: true` and an empty `errors` array.
   - On failure: validator returns `passed: false` and `errors` containing human-readable messages explaining each missing requirement or violation.

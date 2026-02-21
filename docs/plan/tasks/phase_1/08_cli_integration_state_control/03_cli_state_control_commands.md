# Task: Implement Orchestrator Control Commands (`pause`, `resume`, `skip`) (Sub-Epic: 08_CLI Integration & State Control)

## Covered Requirements
- [1_PRD-REQ-INT-006]

## 1. Initial Test Written
- [ ] Write integration tests in `packages/cli/tests/control.spec.ts` to verify:
    - Running `devs pause` when the orchestrator is running sets the project status to `PAUSED`.
    - Running `devs resume` when the orchestrator is paused sets the project status to `RUNNING`.
    - Running `devs skip` when the orchestrator is at an implementation task advances to the next task in the DAG.
    - Verifying that these state changes are reflected in the `projects` and `tasks` tables in SQLite.

## 2. Task Implementation
- [ ] Add `pause`, `resume`, and `skip` commands to the CLI.
- [ ] Implement the logic for `pause` and `resume`:
    - Update the `projects.status` column in `state.sqlite`.
    - Implement signaling logic (e.g., via the `EventBus`) to alert any running orchestrator processes.
- [ ] Implement the logic for `skip`:
    - Mark the current task as `SKIPPED` in the `tasks` table.
    - Trigger the orchestrator to advance to the next available node in the LangGraph.
- [ ] Ensure the CLI provides immediate feedback (e.g., "Project Paused," "Resuming Orchestration").

## 3. Code Review
- [ ] Verify that state transitions are ACID-compliant and use transactions.
- [ ] Ensure that `pause` and `resume` are idempotent (pausing an already paused project should not cause an error).
- [ ] Check for proper error handling when no active orchestrator is present.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/cli` and ensure control commands pass.

## 5. Update Documentation
- [ ] Update CLI documentation with `pause`, `resume`, and `skip` command descriptions.
- [ ] Explain the effects of each command on the orchestration lifecycle.

## 6. Automated Verification
- [ ] Verify using `sqlite3` that `devs pause` results in `status = 'PAUSED'` in the `projects` table.

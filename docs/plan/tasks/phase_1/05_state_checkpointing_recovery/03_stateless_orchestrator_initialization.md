# Task: Implement Stateless Orchestrator Initialization from Local State (Sub-Epic: 05_State Checkpointing & Recovery)

## Covered Requirements
- [TAS-002], [TAS-047]

## 1. Initial Test Written
- [ ] Create an integration test suite in `@devs/core/tests/initialization/StatelessInit.test.ts`.
- [ ] Test that `LangGraphEngine` can be initialized from a project's `.devs/state.sqlite` with zero in-memory state.
- [ ] Test the "Pause/Resume Fidelity": Verify that the `StateRepository` can reload all requirement DAGs and task statuses correctly after a total process shutdown.
- [ ] Test that any changes to the project's requirements or task statuses are reflected accurately in the orchestrator after re-initialization.

## 2. Task Implementation
- [ ] Update `@devs/core/src/orchestrator/LangGraphEngine.ts` to implement a "State Reloading" pattern:
    - [ ] Before invoking the graph, call `StateRepository.loadAll(projectId)`.
    - [ ] Populate the graph state with the reloaded memory, requirement DAGs, and task statuses from the `projects`, `requirements`, and `tasks` tables.
- [ ] Implement `reloadProjectContext(projectId: string)` function in `StateRepository.ts`:
    - [ ] Query all requirements and tasks for the given project.
    - [ ] Map these to the LangGraph memory objects.
- [ ] Ensure that `TAS-047` (Stateful Determinism) is maintained by strictly deriving all execution decisions from the reloaded relational state.
- [ ] Implement a `devs pause` command in `@devs/cli` that gracefully stops the orchestrator and ensures a clean checkpoint is written to SQLite.

## 3. Code Review
- [ ] Verify that no critical project state exists outside of `state.sqlite`.
- [ ] Ensure that `StateRepository` correctly handles large numbers of requirements and tasks without significant performance impact during initialization.
- [ ] Check that `thread_id` and `checkpoint_id` are the only inputs needed for full state recovery.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/core` and ensure all initialization and reload tests pass.
- [ ] Execute `devs run`, then `devs pause`, then `devs resume` to manually verify the flow and state consistency.

## 5. Update Documentation
- [ ] Update `docs/specs/2_tas.md` confirming implementation of [TAS-002] and [TAS-047].
- [ ] Add a "Statelessness & Resilience" section to the architecture overview.

## 6. Automated Verification
- [ ] Execute `scripts/verify_statelessness.sh` which:
    - [ ] Starts a project.
    - [ ] Deletes the process's internal memory/cache (simulated).
    - [ ] Restarts the orchestrator.
    - [ ] Verifies that the task execution continues without a glitch using only the `.devs/` folder.

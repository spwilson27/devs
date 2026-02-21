# Task: Implement Heuristic State Reconstruction from Comments/Docs (Sub-Epic: 05_State Checkpointing & Recovery)

## Covered Requirements
- [TAS-069]

## 1. Initial Test Written
- [ ] Create an integration test suite in `@devs/core/tests/recovery/HeuristicRecovery.test.ts`.
- [ ] Test the "Empty DB Path": Verify that the orchestrator can still reconstruct the requirement map and task status if `.devs/state.sqlite` is missing but `.agent.md` and code comments are present.
- [ ] Test that the reconstructed state accurately reflects the project's current status and requirement fulfillment.
- [ ] Test that duplicate requirements or task entries are not created during reconstruction.

## 2. Task Implementation
- [ ] Create `@devs/core/src/recovery/HeuristicReconstructor.ts`.
- [ ] Implement `reconstructStateFromProject(projectDir: string)`:
    - [ ] Scan the project's `.agent/` directory for `.agent.md` files.
    - [ ] Parse each `.agent.md` file for `@REQ_ID` or similar requirement identifiers.
    - [ ] Scan the `src/` directory for code comments containing requirement identifiers (e.g., `// REQ: [ID]`).
    - [ ] Map these requirements to their respective task statuses based on the existing code structure.
    - [ ] Rebuild the `requirements` and `tasks` tables in a fresh `state.sqlite` file if it's missing.
- [ ] Integrate with `@devs/core/src/orchestrator/LangGraphEngine.ts`:
    - [ ] In the event of a missing `.devs/` folder, invoke `HeuristicReconstructor.reconstructStateFromProject`.
- [ ] Ensure that reconstructed state is as accurate as possible, but mark it as `HEURISTICALLY_RECONSTRUCTED` for transparency.

## 3. Code Review
- [ ] Verify that the reconstruction logic accurately parses requirement IDs from both Markdown and code comments.
- [ ] Ensure that the `tasks` and `requirements` tables are correctly populated in the database.
- [ ] Check for potential state inconsistencies during reconstruction.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/core` and ensure all heuristic state reconstruction tests pass.
- [ ] Manually delete the `.devs/` folder and verify that the orchestrator can still reconstruct the project's state.

## 5. Update Documentation
- [ ] Update `docs/specs/2_tas.md` confirming implementation of [TAS-069].
- [ ] Add a "Heuristic State Reconstruction" section to the project's documentation.

## 6. Automated Verification
- [ ] Execute `scripts/verify_heuristic_recovery.ts` which:
    - [ ] Creates a sample project with requirement-tagged code and documentation.
    - [ ] Deletes the `.devs/` folder.
    - [ ] Invokes `reconstructStateFromProject`.
    - [ ] Queries `state.sqlite` to verify that all requirements and task statuses have been correctly reconstructed.

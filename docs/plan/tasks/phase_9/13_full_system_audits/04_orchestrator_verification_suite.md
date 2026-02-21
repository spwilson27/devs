# Task: Build Orchestrator State Transition Verification Suite (Sub-Epic: 13_Full System Audits)

## Covered Requirements
- [TAS-032]

## 1. Initial Test Written
- [ ] Create `tests/orchestrator/state/OrchestratorTransitions.test.ts`.
- [ ] Write tests to verify the determinism of LangGraph state transitions, specifically focusing on `ReviewNode`, `PostParallelValidationNode`, and `FinalValidationGateNode`.
- [ ] Write a test simulating a process kill mid-transition and verifying that state is correctly checkpointed and resumeable.

## 2. Task Implementation
- [ ] Implement robust Vitest integration tests in `tests/orchestrator/state/OrchestratorTransitions.test.ts`.
- [ ] Utilize mock agents and mock sandboxes to simulate 100% pass and 100% fail scenarios across the entire DAG.
- [ ] Assert that the SQLite state transitions line up perfectly with the memory object transitions.
- [ ] Implement helper utilities in `tests/helpers/GraphMock.ts` to ease testing of complex graph cycles.

## 3. Code Review
- [ ] Ensure the tests run fast and don't rely on actual Docker initialization to prevent CI bloat.
- [ ] Verify the tests strictly enforce the ACID state transitions required by `TAS-032`.
- [ ] Review `tests/helpers/GraphMock.ts` for reusability across other orchestrator test suites.

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest run tests/orchestrator/state/OrchestratorTransitions.test.ts` to confirm all assertions pass.

## 5. Update Documentation
- [ ] Document the mocked graph utilities in `docs/testing_guidelines.md`.
- [ ] Update `.agent.md` with guidelines on how future developers should mock state transitions for new nodes.

## 6. Automated Verification
- [ ] Run the entire test suite `npm run test` and check that the new orchestrator verification suite pushes the unit test coverage of the `orchestrator` module above 95%.

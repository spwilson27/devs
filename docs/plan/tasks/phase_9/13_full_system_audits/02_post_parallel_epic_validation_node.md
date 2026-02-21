# Task: Implement Post-Parallel Epic Validation Node (Sub-Epic: 13_Full System Audits)

## Covered Requirements
- [8_RISKS-REQ-049]

## 1. Initial Test Written
- [ ] Create `tests/orchestrator/nodes/PostParallelValidationNode.test.ts`.
- [ ] Write a unit test mocking the LangGraph node transition where parallel tasks converge.
- [ ] Write a test asserting that if the `GlobalSandboxRunner` fails during the "Global Epic Test", the state machine transitions to `RCA_Node` (Root Cause Analysis).
- [ ] Write a test asserting that on success, the state machine moves to the next Epic or Validation phase.

## 2. Task Implementation
- [ ] Implement `PostParallelValidationNode` in `src/orchestrator/nodes/PostParallelValidationNode.ts`.
- [ ] Integrate `GlobalSandboxRunner` to execute the full project test suite after parallel tasks merge.
- [ ] Log the checksum of the commit hashes involved in the parallel tasks to SQLite via the node's state transitions.
- [ ] Implement side-effect regression detection by halting the graph if tests pass individually but fail collectively.

## 3. Code Review
- [ ] Ensure the node is strictly stateless except for the LangGraph context injection.
- [ ] Verify that `PostParallelValidationNode` is idempotent and handles network/sandbox failures by retrying up to 3 times before failing the run.
- [ ] Check that `devs rewind` functionality is not broken if this node fails and requires a state revert.

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest run tests/orchestrator/nodes/PostParallelValidationNode.test.ts` to verify the node logic.
- [ ] Run the linter across `src/orchestrator/nodes/PostParallelValidationNode.ts`.

## 5. Update Documentation
- [ ] Update `docs/architecture/orchestrator.md` with the new node in the LangGraph visual representation.
- [ ] Document the node in the `.agent.md` file for context retention.

## 6. Automated Verification
- [ ] Verify test execution using `npm run test:coverage` and ensure `PostParallelValidationNode` has 100% path coverage.

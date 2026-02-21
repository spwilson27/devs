# Task: RefactorNode - End-to-End Flow and Automated Verification (Sub-Epic: 12_3_MCP)

## Covered Requirements
- [3_MCP-TAS-085]

## 1. Initial Test Written
- [ ] Create an end-to-end test that executes the full Red->Green->Refactor->Commit flow in a sandbox repository and verifies the final state.
  - Test file: tests/e2e/test_refactornode_e2e.py
  - Tests to write first:
    1. test_e2e_refactor_flow: 1) create a sandbox git repo with a small codebase, 2) create a Task that requires a simple cleanup (e.g., sort imports), 3) run DeveloperAgent simulation that executes TestNode (red) -> CodeNode (green stub) -> RefactorNode -> CommitNode, 4) assert commit exists and files are updated as expected.
    2. test_e2e_entropy_and_resume: simulate an adapter failure during refactor; assert sandbox is suspended and that replaying RefactorNode from suspended snapshot resumes and completes.

## 2. Task Implementation
- [ ] Implement orchestration and lightweight simulation harness:
  - Provide a test-only DeveloperAgent harness in tests/helpers/developer_agent_harness.py that can run selected nodes in sequence using real modules but with external tools (surgical_edit, git) stubbed or run in a temp repo.
  - Ensure the harness can configure small timeouts and deterministic behavior for reproducibility.

## 3. Code Review
- [ ] Verify:
  - E2E test covers success, failure, and resume paths.
  - Harness is documented and reusable for future node E2E tests.
  - Test runtime is kept small (<60s) by using minimal repositories and mocked slower components.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E suite: `pytest tests/e2e/test_refactornode_e2e.py -q` and ensure green.

## 5. Update Documentation
- [ ] Add an E2E run guide to docs/agents/refactor_node.md explaining how to run the E2E locally and interpret suspended sandbox artifacts.

## 6. Automated Verification
- [ ] Add a CI job that runs the E2E with reduced scope and verifies the final git state and sqlite status entries; include a gating step that fails the CI on regression.

# Task: Verify Phase 4 Completion & Agentic Bootstrap (Sub-Epic: 04_MVP Roadmap)

## Covered Requirements
- [ROAD-P5-DEP-001]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python integration test `tests/test_phase_4_bootstrap.py` that:
    - Verifies the existence of a "bootstrap" workflow definition in `.devs/workflows/`.
    - Verifies that the `devs` server can successfully parse the bootstrap workflow.
    - Verifies that the MCP server is reachable and responds to `list_tools`.
    - Verifies that a "ping" stage in the bootstrap workflow completes successfully when run against the local server.

## 2. Task Implementation
- [ ] Ensure the Phase 4 bootstrap milestone is active:
    - If the bootstrap workflow is missing, create a minimal `bootstrap.toml` in `.devs/workflows/` that defines a simple self-verification stage.
    - Ensure the `devs` server is configured to load this workflow at startup.
- [ ] Verify the "Agentic Development Loop":
    - Ensure an MCP-connected agent can successfully submit a run of the bootstrap workflow.
    - Ensure the run state is persisted to the project's checkpoint branch as expected from Phase 4.

## 3. Code Review
- [ ] Verify that the bootstrap workflow follows the declarative TOML format defined in Phase 1.
- [ ] Verify that the checkpoint persistence logic correctly handles the dedicated state branch.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_phase_4_bootstrap.py` and ensure it passes.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that the bootstrap milestone has been verified and the agentic loop is officially active for Phase 5.

## 6. Automated Verification
- [ ] Run `./do presubmit` and ensure that the newly added test is included and passing.

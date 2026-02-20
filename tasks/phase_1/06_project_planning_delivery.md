# Tasks for 06_Project Planning Delivery (Phase: phase_1.md)

## Covered Requirements
- [REQ-PLAN-004], [REQ-PLAN-005]

### Task Checklist
- [ ] **Subtask 1: Implement Phase Decomposer Agent**: Create an agent service in `src/planning/phase_decomposer.ts` that takes an generated Epic/Phase and breaks it down into a highly granular, atomic checklist of 25+ tasks. Ensure the LLM prompt enforces the checklist format.
- [ ] **Subtask 2: Implement Requirement Traceability Validator**: Develop a `CoverageValidator` component that parses the generated checklist tasks and verifies that *every single* requirement ID mapped to the phase is explicitly referenced in at least one task. 
- [ ] **Subtask 3: Implement Validator HITL Feedback Loop**: Add logic to detect if the `CoverageValidator` fails (i.e., a requirement is missing from the tasks). If so, automatically feed the missing requirements back to the Phase Decomposer Agent to regenerate the tasks, or trigger an interactive prompt for the user to step in.
- [ ] **Subtask 4: Implement Task Markdown Generator**: Build a file generator in `src/planning/task_exporter.ts` that formats the validated tasks into GitHub-flavored Markdown. It must create the directory structure `tasks/phase_X/` and save the checklists as `YY_epic_name.md`.
- [ ] **Subtask 5: Implement TDD Context Formatter**: Enhance the Markdown Generator to append a specific "Testing & Verification" section to each task document, preparing it for the rigorous test-driven development cycle executed by downstream agents.
- [ ] **Subtask 6: Finalize Planning Handoff Pipeline**: Create an orchestrator method that wires together the Epic Generator (from previous tasks), Phase Decomposer, Coverage Validator, and Markdown Generator, and then emits a `PLANNING_PHASE_COMPLETE` event to signal the TDD loop to begin.

### Testing & Verification
- [ ] **Decomposer Mock Test**: Write a unit test that feeds a mock Epic with 5 requirements to the Phase Decomposer Agent, mocking the LLM response to return an array of granular checklist items.
- [ ] **Coverage Validator Unit Tests**: Test the `CoverageValidator` with two scenarios: one where all requirements are present in the checklist, and one where a requirement ID is missing. Assert it returns `true` and `false` respectively.
- [ ] **File Export Integration Test**: Write a test executing the Markdown Generator with mock tasks and verify the correct folders (`tasks/phase_X/`) and correctly formatted `.md` files are written to a temporary sandboxed file system.
- [ ] **Pipeline E2E Test**: Execute the full handoff pipeline with a mock dependency graph. Assert that the `PLANNING_PHASE_COMPLETE` event is fired and the resulting file system contains the expected number of Markdown files with "Testing & Verification" sections.

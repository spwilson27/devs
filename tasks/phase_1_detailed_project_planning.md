# Tasks for Detailed Project Planning (Phase: phase_1.md)

## Covered Requirements
- [REQ-MAP-006], [REQ-PLAN-001], [REQ-PLAN-002], [REQ-PLAN-003], [REQ-PLAN-004], [REQ-PLAN-005]

### Task Checklist

- [ ] **Subtask 1: Implement Atomic Requirement Extraction (REQ-PLAN-001)**: Develop a `RequirementExtractorAgent` that parses high-level specification documents (PRD, TAS, MCP Design, etc.) located in `specs/`. The agent must extract atomic requirement units and assign them unique IDs (e.g., REQ-001). Implement a deduplication logic that merges semantically identical requirements found across different source documents while preserving all source references.
- [ ] **Subtask 2: Develop Epic & Task Orchestration Logic (REQ-PLAN-002)**: Implement the `PhaseGeneratorAgent` to organize the full list of extracted requirements into 8-16 high-level project phases (Epics). Each phase must be a logical, independent milestone (e.g., "Foundational Vision", "MCP Infrastructure"). Generate these phases as Markdown files in the `phases/` directory, ensuring each file lists its objective and covered requirements.
- [ ] **Subtask 3: Build Requirement Dependency DAG (REQ-PLAN-003)**: Create a `DependencyAnalyzer` utility that constructs a Directed Acyclic Graph (DAG) of requirements and phases. The analyzer must parse "Dependencies" fields from requirements and use topological sorting to ensure a valid implementation order. Implement a circular dependency detector that throws an error if any loops are found in the requirement graph.
- [ ] **Subtask 4: Enforce Task Granularity Limits (REQ-PLAN-004)**: Implement a `TaskBreakdownAgent` that decomposes each phase into at least 25 atomic tasks. Integrate a heuristic or LLM-based estimation step to predict the Lines of Code (LoC) change for each task. If a task is predicted to exceed 200 LoC, the agent must automatically decompose it into smaller, more granular sub-tasks to maintain a manageable development scope.
- [ ] **Subtask 5: Standardize Task Definitions & Schema (REQ-PLAN-005)**: Define a rigid JSON and Markdown structure for all tasks. Every task file generated in the `tasks/` directory MUST include: a unique `ID`, a descriptive `Title`, detailed technical `Description`, a list of `Input Files`, clear `Success Criteria (Tests)`, and a list of `Dependencies`. Implement a `TaskValidator` script to verify that every file in `tasks/*.md` adheres to this schema.
- [ ] **Subtask 6: Implement Mandatory Entropy Detection & Retry Logic (REQ-MAP-006)**: Integrate an "Entropy Detector" into the core TDD execution loop. This system must monitor agent logs for "looping" behavior (e.g., repeating the same tool call, oscillating between the same two code states, or failing the same test repeatedly). Configure the system to enforce a hard limit of 3 retries per task; if the limit is reached, the orchestrator must halt the task and trigger a "Strategy Pivot" or request human intervention.

### Testing & Verification

- [ ] **Requirement Extraction Audit**: Run the `RequirementExtractorAgent` against a sample PRD and verify that it produces a JSON output containing unique IDs and descriptions without duplicates.
- [ ] **Phase Milestone Validation**: Verify that the generated `phases/` directory contains between 8 and 16 files and that each phase represents a distinct, non-overlapping architectural milestone.
- [ ] **DAG Topological Sort Test**: Execute the `DependencyAnalyzer` on a mock set of requirements with complex dependencies and verify that the output sequence respects all dependency constraints.
- [ ] **Task Granularity & Content Scan**: Write a script to iterate through all files in the `tasks/` directory and assert:
    - At least 25 tasks exist for the current phase.
    - Each task contains all required fields: ID, Title, Description, Input Files, Success Criteria, and Dependencies.
    - No task description implies a scope larger than ~200 lines of code.
- [ ] **Entropy Detector Simulation**: Create a "Chaos Test" where an agent is intentionally given an impossible task (e.g., fixing a bug in a read-only file). Verify that the `Entropy Detector` correctly identifies the stall and terminates the execution after exactly 3 retry attempts.

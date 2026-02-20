# Tasks for 05_Project Planning Execution (Phase: phase_1.md)

## Covered Requirements
- [REQ-PLAN-001], [REQ-PLAN-002], [REQ-PLAN-003]

### Task Checklist
- [ ] **Subtask 1: Implement Requirement Distiller Service**: Create a service within `src/planning/distiller.ts` (or equivalent) to ingest Phase 1 & 2 Markdown documents. The service must parse the text, invoke the LLM to extract unique, non-overlapping requirements, and ensure each requirement meets the "Atomic, Testable, and Traceable" criteria.
- [ ] **Subtask 2: Implement Requirement Mapping & ID Generation**: Add logic to assign a unique ID (e.g., REQ-PLAN-001) to each extracted requirement and map it to its source document and section. Save the structured requirements to a centralized manifest.
- [ ] **Subtask 3: Implement Epic Orchestration Engine**: Build an Epic/Phase generator in `src/planning/epic_generator.ts` that analyzes the mapped requirements and groups them into 8 to 16 logical milestones (Epics).
- [ ] **Subtask 4: Implement Dependency DAG Structure**: Create a `TaskDAG` data structure capable of registering tasks as nodes and dependencies as directed edges. Include methods for topological sorting and identifying parallel-executable tasks.
- [ ] **Subtask 5: Implement Deadlock Detection**: Implement cycle detection algorithms (e.g., Tarjan's or simple DFS) within the `TaskDAG` to flag circular dependencies before execution begins.
- [ ] **Subtask 6: Implement Deadlock Resolution HITL Flow**: Create an interactive CLI/MCP prompt that halts the planning process when a circular dependency is detected and requests the user to manually resolve the deadlock before proceeding.

### Testing & Verification
- [ ] **Distiller Unit Tests**: Write unit tests providing mock Phase 1/2 documents to the Distiller Service. Assert that output requirements are deduplicated, correctly formatted, and possess accurate source traceability.
- [ ] **Epic Generation Bounds Test**: Write tests to verify the Epic Orchestration engine enforces the constraint of generating exactly 8 to 16 phases.
- [ ] **DAG Topological Sort Tests**: Test the `TaskDAG` with complex, non-circular dependency trees to ensure tasks are correctly batched for parallel execution.
- [ ] **Deadlock Detection Tests**: Feed a cyclic dependency graph (A -> B -> C -> A) to the `TaskDAG` and assert that a specific deadlock error or flag is triggered.
- [ ] **Resolution Flow Integration Test**: Create an integration test simulating a dependency deadlock, ensuring the system transitions to a paused "Waiting for User Input" state and resumes correctly after a mock DAG edit.

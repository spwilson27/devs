# Tasks for Persona Needs: Agentic & Architectural (Phase: phase_1.md)

## Covered Requirements
- [REQ-NEED-CORE], [REQ-NEED-AGENT-01], [REQ-NEED-AGENT-02], [REQ-NEED-AGENT-03], [REQ-NEED-ARCH-01]

### Task Checklist

- [ ] **Subtask 1: Define SAOP Header & Task Correlation Schema**: Implement the `SAOP_Envelope` header structure within the orchestrator's core types. This must ensure every agent turn includes a `task_id`, `agent_id`, and `thread_id` for strict correlation with the SQLite `agent_logs` table. (Maps to: [REQ-NEED-CORE], [REQ-NEED-AGENT-01])
- [ ] **Subtask 2: Implement TAS Context Provider in `get_project_context`**: Develop the logic for the `get_project_context` MCP tool in the `OrchestratorServer`. This tool must retrieve the active Technical Architecture Specification (TAS) and format it as authoritative context for AI implementation agents. (Maps to: [REQ-NEED-AGENT-01])
- [ ] **Subtask 3: Long-term Memory Indexing for Architectural Decisions**: Configure the LanceDB vector store to index project-wide architectural decisions from the TAS. Implement the `search_memory` tool to allow agents to perform semantic retrieval of these constraints during active tasks. (Maps to: [REQ-NEED-AGENT-01])
- [ ] **Subtask 4: Scaffold OrchestratorServer Core Toolset**: Build the foundational `OrchestratorServer` MCP interface. Implement baseline tools including `search_memory`, `get_project_context`, and `inject_directive` to provide the "Tool-Rich Environment" required by the AI Developer persona. (Maps to: [REQ-NEED-AGENT-02])
- [ ] **Subtask 5: Agent-Ready Observability Hook Implementation**: Setup the initial MCP hooks that will allow generated projects to expose their internal state, logs, and profiling data to AI agents. Ensure this follows the "Native Agentic Observability" pattern defined in TAS-003. (Maps to: [REQ-NEED-AGENT-02])
- [ ] **Subtask 6: SQLite "Flight Recorder" Schema & Persistence**: Implement the `.devs/state.sqlite` schema to record every agent thought, decision, and tool call. Ensure the `agent_logs` table supports high-fidelity persistence of SAOP payloads. (Maps to: [REQ-NEED-AGENT-03])
- [ ] **Subtask 7: Implement ACID State Transition Logic**: Develop a wrapper for the state machine that ensures every state change (task start, tool execution, outcome) is executed within a SQLite transaction to guarantee determinism and crash recovery. (Maps to: [REQ-NEED-AGENT-03])
- [ ] **Subtask 8: Git-DB Correlation for Deterministic Rewind**: Implement the mapping logic that associates successful task completions with specific Git Commit hashes. Store these hashes in the `tasks` table to enable hard rewinds of both the filesystem and database. (Maps to: [REQ-NEED-AGENT-03])
- [ ] **Subtask 9: Gated Autonomy (HITL) Implementation**: Implement the `manage_hitl_gate` MCP tool. This tool must enforce manual "Architect" approval for high-level documents (PRD, TAS) and Epic transitions before the system allows implementation agents to proceed. (Maps to: [REQ-NEED-ARCH-01])
- [ ] **Subtask 10: Entropy-Based Agent Loop Detection**: Implement the entropy detection algorithm that compares hashes of the last three SAOP observation payloads. If a loop is detected, the system must trigger an "Architectural Review" state, forcing the agent to reassess its strategy. (Maps to: [REQ-NEED-ARCH-01])
- [ ] **Subtask 11: Architectural Pattern Compliance System Prompt**: Design and implement the system prompt for the `reviewer` agent persona. This prompt must explicitly instruct the agent to use `get_project_context` to verify all implemented code against the "Strict Patterns" (e.g., Functional Programming with Effect-TS) defined in the TAS. (Maps to: [REQ-NEED-ARCH-01])

### Testing & Verification
- [ ] **Unit Test: SAOP Envelope Validation**: Verify that the orchestrator correctly validates the `SAOP_Envelope` schema and rejects turns missing `task_id` or `agent_id`.
- [ ] **Integration Test: TAS Context Retrieval**: Verify that the `get_project_context` tool returns the correct TAS content from the project's documentation directory.
- [ ] **Persistence Test: SQLite Transaction Integrity**: Simulate a crash during a tool execution and verify that the SQLite state remains consistent and the project can be resumed from the last valid transaction.
- [ ] **Verification Script: Sandbox Determinism**: Execute a series of file operations in the sandbox and verify that the Git-DB correlation correctly maps the resulting state to a reproducible commit hash.
- [ ] **Manual Gate Test: HITL Approval Flow**: Verify that the state machine "freezes" at a TAS gate and only resumes after an `approve` signal is received via the `manage_hitl_gate` tool.

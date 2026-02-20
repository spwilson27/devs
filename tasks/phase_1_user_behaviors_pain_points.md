# Tasks for User Behaviors & Pain Points (Phase: phase_1.md)

## Covered Requirements
- [REQ-UR-006], [REQ-UR-007], [REQ-UR-008], [REQ-UR-009], [REQ-UR-010]

### Task Checklist
- [ ] **Subtask 1: Research Agent Specification (REQ-UR-006)**: Design the "Research Agent" prompt template and logic for performing automated technology landscape analysis. The specification must define how the agent identifies candidate stacks based on project descriptions and compares them using empirical criteria (e.g., community support, license compatibility, and performance).
- [ ] **Subtask 2: TDD & Validation Protocol Definition (REQ-UR-007)**: Implement a foundational "Validation Framework" that enforces mandatory TDD. This includes creating a standardized test runner configuration that blocks implementation tasks if a corresponding test suite is missing or failing, and a "Research Validation" hook to verify tech stack compatibility before phase transitions.
- [ ] **Subtask 3: Glass-Box Approval Schema (REQ-UR-008)**: Define the JSON schema for "User Approval Checkpoints." This schema must support capturing the agent's internal reasoning (the "thinking" process), the proposed decision, and a user's `approve`/`reject`/`modify` response. Integrate this into the agent's core loop as a blocking state.
- [ ] **Subtask 4: Project Memory Interface (REQ-UR-009)**: Design and implement the "Long-term Project Memory" storage interface. This system must handle three tiers of memory: Short-term (task context), Medium-term (phase/epic decisions), and Long-term (immutable project-wide constraints). Use a structured format (e.g., JSON or a local SQLite DB) to ensure persistence across sessions.
- [ ] **Subtask 5: Requirement Distillation Engine (REQ-UR-009)**: Develop the core logic for the "Distillation Engine" that recursively breaks down high-level requirement documents into atomic task manifests. This must include an ordering algorithm that respects technical dependencies between requirements.
- [ ] **Subtask 6: MCP Sandboxing Configuration (REQ-UR-010)**: Define the MCP (Model Context Protocol) server configurations for sandboxing agent execution. This includes white-listing specific CLI tools and directory paths that the agent can access, ensuring it cannot perform actions outside its assigned scope or project root.
- [ ] **Subtask 7: VSCode Extension Interface Bridge (REQ-UR-010)**: Implement the initial communication bridge between the `devs` CLI/Agent and the VSCode Extension. This must allow the agent to send "Checkpoint" notifications to the VSCode UI and receive real-time user feedback through the extension's dashboard.

### Testing & Verification
- [ ] **Research Agent Mock**: Create a test case where the Research Agent is given a "Short Project Description" and must output a valid Tech Landscape Report that maps directly to the user's constraints.
- [ ] **TDD Loop Validation**: Verify that the implementation CLI fails to execute a task if no `test/` directory or corresponding test file is detected for the target component.
- [ ] **Glass-Box State Test**: Build a unit test for the Approval Schema that ensures the agent loop enters a "PENDING_APPROVAL" state and correctly resumes/terminates based on mock user input.
- [ ] **Memory Persistence Check**: Verify that a "Long-term Constraint" (e.g., "Use TypeScript") saved in one task session is correctly retrieved and prioritized by the agent in a subsequent, unrelated task session.
- [ ] **MCP Boundary Test**: Execute a dummy task within the MCP sandbox and verify that attempts to access files outside the `/input` or `/work` directories are rejected by the protocol.

# Tasks for User Journey Mapping (Phase: phase_1.md)

## Covered Requirements
- [REQ-UR-011], [REQ-UR-012], [REQ-UR-013], [REQ-UR-014], [REQ-UR-015]

### Task Checklist
- [ ] **Subtask 1: Implement Agent Loop Entropy Detection (REQ-UR-011)**: Develop a utility to analyze the sequence of tool calls and agent thoughts. Implement an algorithm that identifies repetitive patterns or non-productive cycles (entropy detection). Ensure the orchestrator can flag these states before token usage becomes excessive.
- [ ] **Subtask 2: Configure Max Turn Constraints and HITL Trigger (REQ-UR-011)**: Add a `MAX_TURNS` parameter to the agent execution configuration. Implement a logic branch in the agent loop that pauses execution and triggers a Human-In-The-Loop (HITL) intervention request when either `MAX_TURNS` is reached or the entropy detector flags a loop.
- [ ] **Subtask 3: Build Markdown Architectural Document Parser (REQ-UR-012)**: Implement a parser capable of reading Markdown documents (PRD, TAS, etc.) and extracting requirement blocks, dependency metadata (e.g., `Dependencies: [REQ-ID]`), and functional goals. Use a library like `unified` or `remark` for robust AST traversal.
- [ ] **Subtask 4: Develop Dependency Graph and Epic Generator (REQ-UR-012)**: Create a system that takes parsed requirements and builds a Directed Acyclic Graph (DAG) based on their dependencies. Implement logic to group these requirements into ordered implementation phases (Epics) ensuring no phase depends on an uncompleted requirement from a later phase.
- [ ] **Subtask 5: Standardize the TDD Loop Workflow (REQ-UR-013)**: Define a formal TDD protocol for the implementation agent: 1. Generate a failing unit/integration test. 2. Execute the test and confirm failure. 3. Implement the minimal code change to pass the test. 4. Re-run tests to confirm success. 5. Refactor and verify.
- [ ] **Subtask 6: Integrate Sandboxed Test Execution Environment (REQ-UR-013)**: Configure a secure, isolated environment (e.g., using `isolated-vm` or a dedicated container) where the agent can execute tests and code without risking the host system. Ensure the sandbox provides captured output and exit codes to the orchestrator.
- [ ] **Subtask 7: Implement MCP Debugging Tools (REQ-UR-014)**: Develop an MCP server that exposes tools for agents to introspect the project state. This must include `read_logs`, `inspect_filesystem`, and `query_database` capabilities. Ensure these tools are registered and available to the implementation agent's toolset.
- [ ] **Subtask 8: Enable Agentic Profiling via MCP (REQ-UR-014)**: Create MCP tools that allow agents to trigger runtime profiling (e.g., `node --prof` or similar) and retrieve performance metrics. The agent should be able to analyze these profiles to identify bottlenecks or memory leaks and propose code-level optimizations.
- [ ] **Subtask 9: Define Core Infrastructure Blueprints (REQ-UR-015)**: Create a set of "Infrastructure Blueprints" for recurring project needs, such as JWT authentication, SQLite database schema initialization, and basic CI/CD pipelines (e.g., GitHub Actions). These should be stored as reusable templates.
- [ ] **Subtask 10: Automate "Boilerplate tax" Scaffolding (REQ-UR-015)**: Implement a "Scaffolding Agent" or utility that takes the selected blueprints and automatically applies them to the target project directory. This includes creating directory structures, configuration files, and initial "plumbing" code to reduce manual setup time.

### Testing & Verification
- [ ] **Loop Detection Test**: Run a simulated agent in a controlled loop (e.g., repeatedly calling a dummy tool) and verify the entropy detector flags the loop and the system triggers a HITL intervention before exceeding the turn limit.
- [ ] **Distillation Validation**: Provide a sample PRD with complex dependencies and verify the generated Epic roadmap matches the expected topological sort and requirement grouping.
- [ ] **Sandbox TDD Verification**: Execute a full TDD cycle within the sandbox for a dummy feature and confirm that the system correctly identifies the fail-pass-refactor states.
- [ ] **MCP Tooling Audit**: Verify that the implementation agent can successfully call the `inspect_filesystem` and `read_logs` MCP tools and use the returned data to update its internal state.
- [ ] **Scaffolding Completeness Check**: Trigger the infrastructure automation for a new project and verify that the database schema is initialized and the auth middleware is correctly injected and functional.

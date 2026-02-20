# Tasks for Feature Mapping & Project Planning (Phase: phase_1.md)

## Covered Requirements
- [REQ-MAP-001], [REQ-MAP-002], [REQ-MAP-003], [REQ-MAP-004], [REQ-MAP-005]

### Task Checklist

- [ ] **Subtask 1: Define Parallel Research Orchestration (REQ-MAP-001)**: Initialize a LangGraph.js orchestration graph that supports parallel execution of specialized research nodes. Configure the graph to trigger `MarketResearchAgent`, `CompetitiveAnalysisAgent`, and `TechnologyLandscapeAgent` simultaneously using LangGraph's branching or `RunnableParallel` capabilities. Ensure the system can aggregate the results of these parallel tasks into a unified discovery context.
- [ ] **Subtask 2: Implement Persistent Decision Logging (REQ-MAP-002)**: Set up a local SQLite database at `.devs/state.sqlite`. Design and implement a schema for a `decisions` table including fields for `id`, `phase_id`, `agent_id`, `decision_summary`, `reasoning_path`, and `timestamp`. Integrate a `DecisionLogger` service within the LangGraph orchestrator to automatically capture and persist every architectural or strategic decision made by the agents during the research and planning phase.
- [ ] **Subtask 3: Standardize Research Report Templates (REQ-MAP-003)**: Create Markdown templates for Market, Competitive, and Technology reports. Update the system prompts for all research agents to explicitly require "Pros/Cons" and "Trade-offs" sections for every technology or strategy analyzed. Implement a validation step in the research node that checks for the presence and density of these sections before finalizing the report.
- [ ] **Subtask 4: Configure Sandbox MCP Injection (REQ-MAP-004)**: Develop the "Sandbox" initialization logic responsible for preparing the isolated execution environment. Implement a mechanism to parse MCP server configurations and inject the necessary binaries/scripts into the sandbox on startup. Ensure that the `Agent` persona has immediate, authenticated access to these MCP tools (e.g., debuggers, profilers, file-system utilities) as soon as the sandbox is provisioned.
- [ ] **Subtask 5: Implement Real-time State Streaming (REQ-MAP-005)**: Set up a state-listener within the LangGraph engine that captures real-time updates of the orchestration graph. Develop a streaming interface (e.g., WebSocket or IPC) that broadcasts these state transitions. Implement the initial VSCode Sidebar communication layer to receive and log this stream, providing the "Creator" persona with a live view of agent "thoughts" and process transitions.

### Testing & Verification

- [ ] **Unit Tests for Decision Logging**: Create unit tests for the `DecisionLogger` service to verify that records are correctly inserted into `.devs/state.sqlite` and that the schema handles complex reasoning strings.
- [ ] **Integration Test for Parallel Execution**: Build a test case using a mock LangGraph state to verify that the three research agents (Market, Comp, Tech) execute in parallel and that the orchestrator waits for all three to complete before moving to the next node.
- [ ] **Validation of Research Content**: Write a script to parse generated research reports and assert the existence of "Pros/Cons" and "Trade-offs" headers with non-empty content.
- [ ] **Sandbox MCP Injection Test**: Create a specialized test that starts the sandbox and attempts to execute a basic command through an injected MCP server (e.g., a "ping" or "version" command) to confirm successful tool availability.
- [ ] **State Stream Verification**: Implement a mock client for the state-streaming interface to verify that LangGraph state updates are correctly formatted and broadcasted with low latency.

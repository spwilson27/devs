# Tasks for 03_Feature Mapping Core (Phase: phase_1.md)

## Covered Requirements
- [REQ-MAP-001], [REQ-MAP-002], [REQ-MAP-003]

### Task Checklist
- [ ] **Subtask 1: Define SQLite Schema for Decision Logging**: Implement a database initialization script or migration for `.devs/state.sqlite`. The schema should include a `decisions` table with columns: `id` (UUID or TEXT), `timestamp` (DATETIME), `agent_name` (TEXT), `decision_type` (TEXT), `context` (TEXT), and `rationale` (TEXT). This satisfies REQ-MAP-002.
- [ ] **Subtask 2: Implement `DecisionLogger` Service**: Create a TypeScript service `DecisionLogger` utilizing `better-sqlite3` (or the project's chosen SQLite driver) to handle inserting and querying decisions from the `.devs/state.sqlite` database. Expose a unified method `logDecision(agent: string, type: string, context: any, rationale: string)` for all agents to use. Ensure the `.devs/` directory is created if it doesn't exist. This fulfills REQ-MAP-002.
- [ ] **Subtask 3: Update Research Agent Prompts for Structural Requirements**: Modify the base instructions and system prompts for all research-oriented agents (Market, Competitive, Tech). Inject explicit rules requiring that all evaluated subjects MUST include distinct "Pros/Cons" and "Trade-offs" markdown sections. This implements REQ-MAP-003.
- [ ] **Subtask 4: Enforce Research Output Schema Verification**: Update the output parsing logic (e.g., Zod schemas or regex checks) for the research agents to strictly validate that the generated markdown or JSON structures contain the mandatory "Pros/Cons" and "Trade-offs" sections before accepting the completion. Retry if missing. This reinforces REQ-MAP-003.
- [ ] **Subtask 5: Implement Parallel Research Orchestration via LangGraph**: Refactor the main research phase entry point in the LangGraph orchestration workflow. Replace sequential invocation of the Market, Competitive, and Tech research agents with a parallel execution node (e.g., `Promise.all` equivalent in LangGraph.js) to significantly reduce the overall research completion time for Makers. This fulfills REQ-MAP-001.

### Testing & Verification
- [ ] **Database & Logging Tests**: Write unit tests verifying that the `DecisionLogger` successfully initializes the SQLite database at the correct path (`.devs/state.sqlite`), creates the table, and correctly inserts/retrieves log entries.
- [ ] **Prompt Schema Validation Tests**: Create unit tests with mocked LLM outputs to verify that the research schema validators reject responses missing "Pros/Cons" or "Trade-offs" sections, and accept properly formatted responses.
- [ ] **Parallel Execution Verification**: Write an integration test for the research LangGraph workflow. Use mock agent nodes with fixed artificial delays (e.g., `setTimeout(100ms)`) and verify that the total execution time of the parallel step is approximately equal to the longest individual delay, rather than the sum of all delays.

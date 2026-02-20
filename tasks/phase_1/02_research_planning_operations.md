# Tasks for 02_Research Planning Operations (Phase: phase_1.md)

## Covered Requirements
- [REQ-RES-003], [REQ-RES-004], [REQ-RES-005]

### Task Checklist
- [ ] **Subtask 1: Define User Persona Schema**: Implement a data structure (e.g., in a TypeScript interface or Pydantic model) and system prompt to consistently generate detailed profiles for at least 3 personas (e.g., User, Admin, Developer).
- [ ] **Subtask 2: Implement Primary Value Journey Visualization**: Integrate logic to automatically generate Mermaid.js sequence diagrams representing the "Primary Value Journey" (the core functionality) for each mapped persona.
- [ ] **Subtask 3: Develop Edge Case Analyzer for Niche Markets**: Create a research tool or LLM node that triggers when no direct competitors are found. It must analyze and document "Adjacent Markets" or "Manual Workarounds" currently used by the target personas.
- [ ] **Subtask 4: Integrate Stale Data Prevention Checks**: Build a verification step (e.g., using GitHub API or a web search MCP tool) to perform a live check on recommended libraries or technologies. It must verify the last commit date or release date to ensure no deprecated libraries are recommended.
- [ ] **Subtask 5: Wire Research Agents to the New Capabilities**: Update the main research agent or LangGraph node orchestration to correctly invoke the Persona Mapping, Edge Case Analyzer, and Stale Data Prevention tools during the Research & Planning phase.

### Testing & Verification
- [ ] Create unit tests for the Persona Schema to ensure it rejects incomplete profiles (less than 3 personas).
- [ ] Create unit tests for the Mermaid diagram generator to ensure the output is valid Mermaid.js syntax.
- [ ] Implement an integration test mocking an empty competitor search to verify that the Edge Case Analyzer correctly triggers and identifies "Adjacent Markets".
- [ ] Develop an integration test mocking the GitHub API to verify the Stale Data Prevention check correctly flags libraries with a last commit date older than the defined deprecation threshold (e.g., > 2 years).
- [ ] Run an end-to-end test of the `02_Research Planning Operations` workflow to ensure all three requirements are successfully evaluated in a single agentic pass.

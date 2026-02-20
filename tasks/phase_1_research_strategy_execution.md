# Tasks for Research Strategy & Execution (Phase: phase_1.md)

## Covered Requirements
- [REQ-RES-PLAN], [REQ-RES-001], [REQ-RES-002], [REQ-RES-003], [REQ-RES-004], [REQ-RES-005]

### Task Checklist
- [ ] **Subtask 1: Research Agent Orchestration Hook**: Implement the base `ResearchAgent` class or LangGraph node that coordinates the execution of the four research modules (Market, Tech, Persona, Edge Cases). Ensure it supports state persistence of the "Confidence Score" and "Cited Sources" for each deliverable. `[REQ-RES-PLAN]`
- [ ] **Subtask 2: Market Analysis Implementation**: Configure the Research Agent to search for and identify 5+ competitors. Implement logic to extract feature sets, pricing, and perform a SWOT analysis. Ensure sources are validated against official documentation or GitHub repositories rather than generic marketing copy. `[REQ-RES-001]`
- [ ] **Subtask 3: Competitive Report Formatter**: Create a utility to format the market research findings into a standardized Markdown report including SWOT tables and source citations. Ensure the deliverable meets the 5+ competitor requirement. `[REQ-RES-001]`
- [ ] **Subtask 4: Tech Landscape Evaluation Logic**: Define the evaluation criteria (Performance, Scalability, Community Support, Type Safety, and "Agent-Friendliness") and implement a weighted scoring system for the decision matrix. `[REQ-RES-002]`
- [ ] **Subtask 5: Multi-Stack Comparison Tool**: Develop a tool that compares at least 2 viable tech stacks (e.g., Node.js vs Python) using the weighted scoring from Subtask 4 and generates a formal Decision Matrix report. `[REQ-RES-002]`
- [ ] **Subtask 6: User Persona Generator**: Implement the prompt engineering logic to generate 3+ detailed personas (User, Admin, Developer) with associated goals and constraints. `[REQ-RES-003]`
- [ ] **Subtask 7: Mermaid Journey Mapper**: Integrate a Mermaid.js generator that translates the "Primary Value Journey" identified for each persona into valid Mermaid sequence diagram syntax. `[REQ-RES-003]`
- [ ] **Subtask 8: Adjacent Market Fallback Logic**: Implement a "Pivot" strategy for the agent to analyze "Adjacent Markets" or "Manual Workarounds" if the primary market search yields fewer than 3 direct competitors. `[REQ-RES-004]`
- [ ] **Subtask 9: Library Vitality Checker Tool**: Implement a tool that queries GitHub API or NPM registry to check the "last commit date" and "deprecation status" of any library recommended in the Tech Landscape report to prevent stale data. `[REQ-RES-005]`
- [ ] **Subtask 10: Research Suite Verification**: Implement a final validation step that ensures the research suite contains all required reports, meets the minimum entity counts (5 competitors, 3 personas, 2 stacks), and all libraries are verified as current. `[REQ-RES-PLAN]`

### Testing & Verification
- [ ] **Unit Tests for Scoring Logic**: Build tests to verify the weighted decision matrix correctly calculates scores based on mock input.
- [ ] **Integration Test for Research Pipeline**: Create a test suite that mocks LLM responses and verifies the `ResearchAgent` correctly sequences the report generation and persists the results to the state database.
- [ ] **Mermaid Validation**: Implement a validator that ensures the generated Mermaid.js strings for sequence diagrams are syntactically correct and can be rendered.
- [ ] **Source Validation Check**: Verify that the "Source Validation" logic correctly filters out low-authority marketing sites in favor of documentation/repos.
- [ ] **Stale Data Tool Verification**: Mock a deprecated package and an old GitHub repo to ensure the vitality checker correctly flags them.

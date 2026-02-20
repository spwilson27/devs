# Tasks for 01_Research Planning Strategy (Phase: phase_1.md)

## Covered Requirements
- [REQ-RES-PLAN], [REQ-RES-001], [REQ-RES-002]

### Task Checklist
- [ ] **Subtask 1: Scaffold Research Context State (REQ-RES-PLAN)**: Implement the foundational `ResearchContext` state definition in LangGraph.js/TypeScript. This must include fields for raw research documents, parsed feature mappings, and project planning constraints. Ensure the state object is serializable for checkpointing.
- [ ] **Subtask 2: Implement Research Context Aggregator Node (REQ-RES-001)**: Build a LangGraph node `aggregate_research_node` that reads the `research/` directory (Market, User, Tech docs), parses the markdown, and stores the raw textual data into the `ResearchContext` state.
- [ ] **Subtask 3: Build Feature Mapping Extractor (REQ-RES-001)**: Create a utility service that utilizes the Gemini API to extract high-level features from the aggregated research documents. It should map identified user needs and market requirements into structured feature objects.
- [ ] **Subtask 4: Develop Planning Strategy Generator (REQ-RES-002)**: Implement a LangGraph node `generate_planning_strategy_node` that takes the extracted feature map and generates a structured, prioritized list of project epics/phases.
- [ ] **Subtask 5: Define Data Schemas for Strategy Output (REQ-RES-002)**: Create Zod schemas to rigorously validate the output of the Feature Mapping Extractor and the Planning Strategy Generator, ensuring no hallucinated fields and strict adherence to the project's typing.

### Testing & Verification
- [ ] Implement unit tests for Zod schemas to ensure invalid research structures are rejected with descriptive error messages.
- [ ] Build a mock LangGraph state test to verify that `aggregate_research_node` correctly parses and loads markdown files into state.
- [ ] Create an integration test for `generate_planning_strategy_node` using a mocked Gemini LLM response to ensure the output correctly matches the prioritized epic structure.
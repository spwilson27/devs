# Task: Input Ingestion and Data Locality Verification (Sub-Epic: 09_Determinism & Robustness Testing)

## Covered Requirements
- [TAS-082], [TAS-075]

## 1. Initial Test Written
- [ ] Write a unit test for `InputIngestor`.
- [ ] Verify that a "Project Brief" and "User Journeys" (Markdown/JSON) are correctly parsed into the `documents` and `projects` tables.
- [ ] Write a test for "Data Locality":
    - Mock an Agent turn.
    - Assert that at the end of the turn, no "findings" or "state" variables are stored in the Agent instance's memory.
    - Assert that all findings (e.g., "Market Research Results") have been written to the `agent_logs` or `documents` table in SQLite.

## 2. Task Implementation
- [ ] Implement the `InputIngestor` utility to handle the initial project seed data.
- [ ] Create a `LocalityGuard` middleware for the Orchestrator.
- [ ] The `LocalityGuard` should:
    1. Scan the Agent class instance before and after a node transition in LangGraph.
    2. Ensure that any "private state" (except for configuration/API keys) is cleared between turns.
    3. Force the agent to return its results as a structured object that the `Orchestrator` then persists to SQLite.
- [ ] Update the `Agent` base class to prevent storing ad-hoc state in `this`.

## 3. Code Review
- [ ] Verify that the `projects` table correctly stores the initial "User Brief" as the root document.
- [ ] Ensure that "Data Locality" enforcement doesn't cause significant performance overhead during agent turns.
- [ ] Check that the `LocalityGuard` handles the 1M token context window (summarization) correctly as part of the "State" management.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` and verify that input ingestion and locality checks pass.
- [ ] Manually inspect the `state.sqlite` after a "Research" turn to ensure all research findings are in the `agent_logs` table.

## 5. Update Documentation
- [ ] Update the "Architectural Patterns" section in the `TAS` to explicitly mandate "Data Locality" for all agents.
- [ ] Add a section on "Project Bootstrapping" describing the brief/journey ingestion process.

## 6. Automated Verification
- [ ] Run `scripts/verify_data_locality.ts` which introspects an active agent instance during a test run and verifies that its internal state is minimal/cleared.

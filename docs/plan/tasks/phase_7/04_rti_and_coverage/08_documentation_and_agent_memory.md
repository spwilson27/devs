# Task: Update documentation and agent memory for RTI and coverage (Sub-Epic: 04_RTI_And_Coverage)

## Covered Requirements
- [9_ROADMAP-TAS-043], [8_RISKS-REQ-102], [1_PRD-REQ-MET-003]

## 1. Initial Test Written
- [ ] Create tests/docs/test_rti_docs_present.py that asserts the presence and key headings of the new documentation files:
  - docs/metrics/rti_data_model.md
  - docs/metrics/rti_algorithm.md
  - docs/metrics/rti_validator.md
  - docs/metrics/rti_e2e.md
  - docs/metrics/rti_ci.md
  - The test should open each file and assert that required headings (e.g., "Definition", "Algorithm", "CLI", "Example") exist.

## 2. Task Implementation
- [ ] Create the documentation files listed above with the following content minimums:
  - Definition of RTI (copy from requirement text [1_PRD-REQ-MET-003]) and the policy that RTI==1.0 is required for roadmap completion.
  - Data model section including the mermaid diagram (see 01_define_rti_data_model.md).
  - Algorithm section including pseudocode and complexity (see 03_implement_rti_calculator.md).
  - Validator CLI usage and expected JSON schema (see 04_requirement_coverage_validator.md).
  - E2E pipeline diagram and an example log showing uncovered requirement IDs with source_location.

- [ ] Update the "agent memory" source used by AI agents (if present in the repo, e.g., .copilot/session-state or an agents config file) to include a short canonical summary of RTI behavior and links to the doc pages so agentic components can reference the metric during automation. If there is no formal agent-memory location, add a new file at .config/agent_memory/rti_summary.yaml with keys: id, title, summary, docs_links.

## 3. Code Review
- [ ] Verify documentation accuracy against the implemented code and tests. Ensure mermaid diagrams render in Markdown preview and that examples are copy-paste runnable.

## 4. Run Automated Tests to Verify
- [ ] Run: python -m pytest tests/docs/test_rti_docs_present.py -q

## 5. Update Documentation
- [ ] (Already covered) Commit the docs to docs/metrics/ and ensure links from README or docs index are updated.

## 6. Automated Verification
- [ ] Add a docs sanity-check in CI that runs a simple markdown linter (`markdownlint` or `mdl`) and the tests/docs test to guarantee docs are present and minimally correct.

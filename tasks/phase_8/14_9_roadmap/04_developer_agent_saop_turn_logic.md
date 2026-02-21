# Task: Develop DeveloperAgent SAOP turn logic and PlanNode integration (Sub-Epic: 14_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-TAS-602]

## 1. Initial Test Written
- [ ] Create tests/agents/test_developer_agent.py using pytest with the following tests:
  - test_saop_parser_basic: provide a minimal SAOP text (headers such as "Goal:", "Steps:") and assert DeveloperAgent.parse_saop(saop_text) returns a structured dict with keys ['goal','constraints','steps'] where steps is an ordered list.
  - test_plannode_generation: given a small PRD/TAS dict, assert DeveloperAgent.generate_plan(prd_dict, tas_dict) returns a PlanNode object with id, description, and an ordered list of subtasks.

## 2. Task Implementation
- [ ] Implement agents/developer_agent.py and agents/plannode.py with the following:
  - DeveloperAgent class with methods parse_saop(saop_text: str) -> dict and generate_plan(prd: dict, tas: dict) -> PlanNode.
  - Simple SAOP parser implemented as a deterministic, line-oriented parser that recognizes headings (Goal:, Constraints:, Steps:) and extracts section bodies; include validation and unit tests for malformed SAOP.
  - PlanNode dataclass (agents/plannode.py) with fields id (UUID or deterministic hash), description, subtasks: List[dict]. PlanNode must be serializable to JSON for persistence and to be included in commit messages.
  - Add prompt templates under agents/prompts/ and unit tests to ensure determinism for fixed inputs.

## 3. Code Review
- [ ] Verify SAOP parser is pure (no network/external calls), ensure DeveloperAgent does not execute arbitrary code from parsed SAOP, sanitize any later tool arguments derived from SAOP, and check PlanNode JSON stability across runs.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/agents/test_developer_agent.py and ensure tests pass.

## 5. Update Documentation
- [ ] Add docs/agents/developer_agent.md describing the SAOP format, parser expectations, PlanNode JSON schema, and an example turn sequence showing DeveloperAgent receiving a task and emitting a PlanNode.

## 6. Automated Verification
- [ ] CI: run unit tests and an integration test where a fixed PRD/TAS input produces an identical PlanNode JSON across consecutive runs (use deterministic seeding where needed).
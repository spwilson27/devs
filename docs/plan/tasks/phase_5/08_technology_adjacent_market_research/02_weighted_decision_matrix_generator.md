# Task: Implement Weighted Technology Decision Matrix Generator (Sub-Epic: 08_Technology & Adjacent Market Research)

## Covered Requirements
- [1_PRD-REQ-RES-002], [9_ROADMAP-REQ-RES-002]

## 1. Initial Test Written
- [ ] Create `tests/research/test_decision_matrix_generator.py`.
- [ ] Write a unit test `test_matrix_evaluates_performance_criterion` that provides a fixture `TechLandscapeResult` with 3 technologies and asserts the resulting `DecisionMatrix` contains a `performance` score (0.0–1.0) for each technology.
- [ ] Write a unit test `test_matrix_evaluates_scalability_criterion` with the same fixture and asserts a `scalability` score exists for each entry.
- [ ] Write a unit test `test_matrix_evaluates_agent_friendliness_criterion` asserting an `agent_friendliness` score (0.0–1.0) exists, reflecting criteria such as: availability of an MCP server, quality of API/SDK documentation, structured output support, and LLM tool-call compatibility.
- [ ] Write a unit test `test_weighted_scores_sum_to_one` that asserts the sum of all criterion weights in `MatrixConfig` equals exactly `1.0`.
- [ ] Write a unit test `test_matrix_produces_ranked_list` asserting `DecisionMatrix.ranked_technologies()` returns technologies ordered highest-to-lowest by weighted score.
- [ ] Write an integration test `test_matrix_generation_end_to_end` using a stubbed LLM scorer and a real `TechLandscapeResult` fixture, asserting a valid `DecisionMatrix` is returned with all criteria populated.
- [ ] All tests must initially FAIL (red phase).

## 2. Task Implementation
- [ ] Create `src/research/tools/decision_matrix_generator.py`.
- [ ] Define `MatrixConfig` dataclass in `src/research/models/decision_matrix.py` with fields: `criteria: dict[str, float]` (mapping criterion name → weight, must sum to 1.0), defaulting to `{"performance": 0.30, "scalability": 0.25, "agent_friendliness": 0.30, "ecosystem_maturity": 0.15}`.
- [ ] Define `TechnologyScore(technology_name: str, scores: dict[str, float], weighted_total: float)` dataclass.
- [ ] Define `DecisionMatrix(technologies: list[TechnologyScore], config: MatrixConfig)` with method `ranked_technologies() -> list[TechnologyScore]` returning entries sorted by `weighted_total` descending.
- [ ] Implement `DecisionMatrixGenerator` class with:
  - `__init__(self, llm_client, config: MatrixConfig = None)`.
  - `async score_technology(self, entry: TechnologyEntry, criterion: str) -> float`: Sends a structured prompt to the LLM asking it to score the technology 0.0–1.0 on the given criterion; parses the JSON response `{"score": float, "rationale": str}`.
  - `async generate(self, result: TechLandscapeResult) -> DecisionMatrix`: Scores all technologies across all criteria concurrently using `asyncio.gather`, then assembles the `DecisionMatrix`.
- [ ] The `agent_friendliness` scoring prompt must explicitly instruct the LLM to consider: presence of MCP server, quality of SDK for tool-call integration, structured output (JSON mode) availability, and community adoption in AI-adjacent projects.
- [ ] Add `MatrixConfig` validation on init: raise `ValueError` if `sum(config.criteria.values()) != 1.0` (allow floating point tolerance of 1e-6).
- [ ] Create `src/research/tools/decision_matrix_generator.agent.md` documenting the tool.

## 3. Code Review
- [ ] Verify all LLM scoring calls are dispatched concurrently (not sequentially) — check `asyncio.gather` usage across all `(technology, criterion)` pairs.
- [ ] Verify `MatrixConfig` weight validation is enforced at construction time, not silently ignored.
- [ ] Verify `agent_friendliness` scoring prompt is stored in a dedicated prompt template file (not inline strings) following the project's prompt management conventions.
- [ ] Verify no hardcoded default weights exist outside `MatrixConfig`; the generator must be fully configurable.
- [ ] Confirm all public API methods have return type annotations.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/research/test_decision_matrix_generator.py -v` and confirm all tests pass.
- [ ] Run `pytest --cov=src/research/tools/decision_matrix_generator --cov-report=term-missing` and confirm line coverage ≥ 90%.

## 5. Update Documentation
- [ ] Update `src/research/tools/decision_matrix_generator.agent.md` with the full criterion list, weight defaults, scoring prompt description, and a Mermaid flowchart of the scoring pipeline.
- [ ] Add the `DecisionMatrixGenerator` to `docs/architecture/research_agents.md` with a description of the weighting scheme and a note on the `agent_friendliness` criterion rationale.
- [ ] Update `CHANGELOG.md`.

## 6. Automated Verification
- [ ] Run `pytest tests/research/test_decision_matrix_generator.py --tb=short` and assert exit code is `0`.
- [ ] Run `python -c "from src.research.tools.decision_matrix_generator import DecisionMatrixGenerator, MatrixConfig; c = MatrixConfig(); print('weights ok:', abs(sum(c.criteria.values()) - 1.0) < 1e-6)"` and confirm output is `weights ok: True`.
- [ ] Run `python scripts/verify_aod_density.py src/research/tools/` to confirm 1:1 `.py`/`.agent.md` ratio.

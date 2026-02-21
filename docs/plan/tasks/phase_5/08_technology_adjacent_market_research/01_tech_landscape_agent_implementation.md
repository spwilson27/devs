# Task: Implement TechLandscapeAgent with Search Query Generation (Sub-Epic: 08_Technology & Adjacent Market Research)

## Covered Requirements
- [1_PRD-REQ-RES-002], [9_ROADMAP-REQ-RES-002]

## 1. Initial Test Written
- [ ] Create `tests/research/test_tech_landscape_agent.py`.
- [ ] Write a unit test `test_agent_generates_queries_from_brief` that mocks a user brief input and asserts the `TechLandscapeAgent.generate_queries()` method returns a non-empty list of strings covering at least 3 technology dimensions (e.g., language/runtime, framework, database).
- [ ] Write a unit test `test_agent_executes_parallel_searches` that mocks the `SearchTool` and asserts `TechLandscapeAgent.run()` dispatches at least 3 concurrent search tasks (use `asyncio` and spy on `asyncio.gather` or equivalent).
- [ ] Write an integration test `test_agent_returns_structured_technology_data` that uses a stubbed `SearchTool` returning fixture HTML/JSON, and asserts the agent returns a `TechLandscapeResult` dataclass with fields: `technologies: list[TechnologyEntry]`, `query_log: list[str]`, `raw_sources: list[str]`.
- [ ] Write a unit test `test_technology_entry_schema` to verify `TechnologyEntry` has fields: `name: str`, `category: str` (e.g., "language", "framework", "database", "infra"), `description: str`, `source_urls: list[str]`.
- [ ] All tests must initially FAIL (red phase).

## 2. Task Implementation
- [ ] Create module `src/research/agents/tech_landscape_agent.py`.
- [ ] Define dataclasses `TechnologyEntry(name, category, description, source_urls)` and `TechLandscapeResult(technologies, query_log, raw_sources)` in `src/research/models/tech_landscape.py`.
- [ ] Implement `TechLandscapeAgent` class with:
  - `__init__(self, search_tool: SearchTool, extractor_tool: ContentExtractor, llm_client)` accepting injected dependencies.
  - `generate_queries(self, brief: str) -> list[str]`: Uses the LLM to decompose the brief into technology-specific search queries covering runtime, frameworks, databases, deployment, and AI/agent tooling dimensions.
  - `async run(self, brief: str) -> TechLandscapeResult`: Dispatches `generate_queries` output to `SearchTool` in parallel via `asyncio.gather`, then passes raw HTML to `ContentExtractor`, then uses the LLM to parse results into a list of `TechnologyEntry` objects.
- [ ] The agent must log every query string into `query_log` of the result.
- [ ] Source URLs from search results must be collected into `raw_sources`.
- [ ] Register `TechLandscapeAgent` as a named component in `src/research/agents/__init__.py`.
- [ ] Create an `.agent.md` companion file at `src/research/agents/tech_landscape_agent.agent.md` documenting purpose, inputs, outputs, and dependencies.

## 3. Code Review
- [ ] Verify `TechLandscapeAgent` uses constructor injection for all external tools (no global imports or singletons instantiated inside the class).
- [ ] Verify `async run()` uses `asyncio.gather` (or equivalent async concurrency primitive) — never sequential `await` inside a for-loop for search calls.
- [ ] Verify `TechnologyEntry` and `TechLandscapeResult` are pure dataclasses (no business logic), satisfying separation of concerns.
- [ ] Confirm the module has no direct references to concrete HTTP clients; only interfaces/protocols are imported.
- [ ] Confirm `generate_queries` prompt is stored as a named constant or loaded from a prompt template file, not hardcoded inline.
- [ ] Verify 100% of public methods have type annotations.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/research/test_tech_landscape_agent.py -v` and confirm all tests pass (green phase).
- [ ] Run `pytest --cov=src/research/agents/tech_landscape_agent --cov-report=term-missing` and confirm line coverage ≥ 90%.

## 5. Update Documentation
- [ ] Update `src/research/agents/tech_landscape_agent.agent.md` with final method signatures, data flow diagram (Mermaid sequence diagram showing brief → queries → parallel search → extract → parse → TechLandscapeResult), and known limitations.
- [ ] Add `TechLandscapeAgent` entry to `docs/architecture/research_agents.md` (create file if absent) with a one-paragraph description and links to the agent module and model files.
- [ ] Update `CHANGELOG.md` with an entry describing the new agent.

## 6. Automated Verification
- [ ] Run `python scripts/verify_aod_density.py src/research/agents/` to confirm 1:1 ratio of `.py` to `.agent.md` files (requirement [9_ROADMAP-REQ-041]).
- [ ] Run `pytest tests/research/test_tech_landscape_agent.py --tb=short` and assert exit code is `0`.
- [ ] Run `python -c "from src.research.agents.tech_landscape_agent import TechLandscapeAgent; print('import ok')"` to confirm module is importable without errors.

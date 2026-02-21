# Task: Define ResearchManager Data Models and Agent Interface (Sub-Epic: 02_ResearchManager Agent Core)

## Covered Requirements
- [9_ROADMAP-TAS-301], [1_PRD-REQ-RES-007]

## 1. Initial Test Written
- [ ] Create `tests/unit/agents/research/test_research_manager_interface.py`.
- [ ] Write a test asserting that `ResearchManager` can be instantiated with a valid `ResearchConfig` object (containing `max_parallel_streams: int`, `retry_limit: int`, `confidence_threshold: float`).
- [ ] Write a test asserting that `ResearchManager` exposes an async method `run(brief: str) -> ResearchSuite` with the correct signature (use `inspect.signature` or type checking).
- [ ] Write a test that the `ResearchSuite` dataclass/TypedDict contains fields: `market_report`, `competitive_report`, `tech_report`, `user_research_report`, each typed as `ResearchReport`.
- [ ] Write a test that `ResearchReport` dataclass contains fields: `content: str`, `confidence_score: float`, `citations: list[Citation]`, `generated_at: datetime`.
- [ ] Write a test that `Citation` dataclass contains fields: `url: str`, `title: str`, `credibility_score: float`, `retrieved_at: datetime`.
- [ ] Write a test that `SearchQuery` dataclass contains fields: `query: str`, `stream_type: ResearchStreamType`, `max_results: int`.
- [ ] Write a test that `ResearchStreamType` is an Enum with members: `MARKET`, `COMPETITIVE`, `TECH`, `USER_RESEARCH`.
- [ ] All tests should fail initially since no implementation exists.

## 2. Task Implementation
- [ ] Create the directory structure: `src/agents/research/` with `__init__.py`.
- [ ] Create `src/agents/research/models.py`:
  - Define `ResearchStreamType(Enum)` with members `MARKET`, `COMPETITIVE`, `TECH`, `USER_RESEARCH`.
  - Define `@dataclass Citation` with fields: `url: str`, `title: str`, `credibility_score: float`, `retrieved_at: datetime`.
  - Define `@dataclass ResearchReport` with fields: `content: str`, `confidence_score: float`, `citations: list[Citation]`, `generated_at: datetime`.
  - Define `@dataclass SearchQuery` with fields: `query: str`, `stream_type: ResearchStreamType`, `max_results: int = 10`.
  - Define `@dataclass ResearchSuite` with fields: `market_report: ResearchReport | None`, `competitive_report: ResearchReport | None`, `tech_report: ResearchReport | None`, `user_research_report: ResearchReport | None`.
  - Define `@dataclass ResearchConfig` with fields: `max_parallel_streams: int = 4`, `retry_limit: int = 3`, `confidence_threshold: float = 0.85`.
- [ ] Create `src/agents/research/research_manager.py`:
  - Define class `ResearchManager` with `__init__(self, config: ResearchConfig)` storing the config.
  - Define `async def run(self, brief: str) -> ResearchSuite` as an abstract-style method that raises `NotImplementedError` (to be implemented in subsequent tasks).
  - Export `ResearchManager` from `src/agents/research/__init__.py`.
- [ ] Ensure all imports resolve and no circular dependencies exist.

## 3. Code Review
- [ ] Verify that all data models use Python `dataclasses` or `pydantic.BaseModel` for serialization compatibility with the SQLite state store.
- [ ] Verify `ResearchStreamType` is a proper `enum.Enum` (not a `StrEnum` unless the project standard calls for it).
- [ ] Verify that `ResearchConfig` uses sensible defaults matching the requirements (`retry_limit=3`, `confidence_threshold=0.85`).
- [ ] Verify no business logic has leaked into model definitions — models must be pure data containers.
- [ ] Verify `ResearchManager` class has clear docstrings describing its role (orchestrator for parallelized research).

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/unit/agents/research/test_research_manager_interface.py -v` and confirm all tests pass.
- [ ] Run `mypy src/agents/research/` and confirm zero type errors.

## 5. Update Documentation
- [ ] Add a `## ResearchManager` section to `docs/architecture/agents.md` (create if absent) describing the agent's role, its data models, and their fields.
- [ ] Update `docs/architecture/data-models.md` (create if absent) with the `ResearchSuite`, `ResearchReport`, `Citation`, `SearchQuery`, and `ResearchConfig` schemas.

## 6. Automated Verification
- [ ] Run `python -c "from src.agents.research import ResearchManager; from src.agents.research.models import ResearchSuite, ResearchReport, Citation, SearchQuery, ResearchConfig, ResearchStreamType; print('Import OK')"` and confirm it exits `0` with `Import OK`.
- [ ] Run `pytest tests/unit/agents/research/test_research_manager_interface.py --tb=short` and confirm exit code is `0`.

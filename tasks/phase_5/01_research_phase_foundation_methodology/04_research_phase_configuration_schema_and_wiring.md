# Task: Research Phase Configuration Schema & Runtime Wiring (Sub-Epic: 01_Research Phase Foundation & Methodology)

## Covered Requirements
- [TAS-049], [9_ROADMAP-PHASE-003], [2_TAS-REQ-001]

## 1. Initial Test Written
- [ ] Create `tests/phase_5/test_research_config.py`.
- [ ] Write `test_research_config_loads_from_dict` — construct a `ResearchConfig` from a valid dict of settings and assert all fields are populated correctly.
- [ ] Write `test_research_config_loads_from_yaml` — write a temporary YAML file with research config values, load it via `ResearchConfig.from_yaml(path)`, and assert fields match expected values.
- [ ] Write `test_research_config_defaults` — construct a `ResearchConfig` with only required fields and assert all optional fields have correct documented defaults (e.g., `max_parallel_streams=3`, `min_confidence_score=0.85`, `min_queries_per_domain=2`).
- [ ] Write `test_research_config_validation_min_streams` — assert that constructing `ResearchConfig(max_parallel_streams=0)` raises `ValueError` with message containing `"max_parallel_streams must be >= 1"`.
- [ ] Write `test_research_config_validation_confidence_range` — assert `ResearchConfig(min_confidence_score=1.5)` raises `ValueError` containing `"min_confidence_score must be between 0.0 and 1.0"`.
- [ ] Write `test_research_config_validation_queries_per_domain` — assert `ResearchConfig(min_queries_per_domain=0)` raises `ValueError`.
- [ ] Write `test_research_manager_accepts_research_config` — instantiate `ResearchManager(config=ResearchConfig(...))` and assert no error is raised and `research_manager.config` is a `ResearchConfig` instance.
- [ ] Write `test_pipeline_registers_research_phase` — get the list of phases from the pipeline orchestrator and assert `PipelinePhase.RESEARCH` is present as the first phase.
- [ ] Confirm all tests fail (red) before implementation.

## 2. Task Implementation
- [ ] Create `devs/config/research_config.py`:
  - Define `ResearchConfig` as a `dataclass` (or `pydantic.BaseModel` if that is the project standard) with the following fields and defaults:
    - `max_parallel_streams: int = 3` — maximum concurrent research streams.
    - `min_confidence_score: float = 0.85` — minimum confidence score to pass the research gate.
    - `min_queries_per_domain: int = 2` — minimum number of queries per research domain.
    - `search_api_key: str` — required, no default (raise if absent).
    - `content_extractor_backend: str = "firecrawl"` — which content extractor to use (`"firecrawl"` or `"jina"`).
    - `max_retries: int = 1` — maximum LLM retries on insufficient coverage.
    - `research_first_enforced: bool = True` — feature flag mirroring `RESEARCH_FIRST` constant.
  - Implement field validators:
    - `max_parallel_streams >= 1`
    - `0.0 <= min_confidence_score <= 1.0`
    - `min_queries_per_domain >= 1`
  - Implement `ResearchConfig.from_yaml(path: str) -> ResearchConfig` classmethod that reads a YAML file and constructs the config.
- [ ] Export `ResearchConfig` from `devs/config/__init__.py`.
- [ ] Update `ResearchManager.__init__(self, config: ResearchConfig)` to:
  - Store `self.config = config`.
  - Validate `isinstance(config, ResearchConfig)` and raise `TypeError` if not.
- [ ] Update `BriefExpander.__init__()` to accept and store `config: ResearchConfig` and use `config.min_queries_per_domain` in its retry logic.
- [ ] In the pipeline orchestrator (e.g., `DevsPipeline`), register `PipelinePhase.RESEARCH` as the first phase in the ordered phase list. Confirm the phase ordering is: `RESEARCH → ARCHITECTURE → TASK_BREAKDOWN → CODE_GENERATION`.
- [ ] Add a default `research_config.yaml` template to `devs/config/defaults/research_config.yaml` with all fields documented via YAML comments.

## 3. Code Review
- [ ] Confirm `ResearchConfig` uses strong typing — no `Any` types.
- [ ] Confirm validation is declarative (pydantic validators or `__post_init__` in dataclass) — NOT scattered across consumer classes.
- [ ] Confirm `search_api_key` is never logged or included in `__repr__` / `__str__` — it is a secret.
- [ ] Confirm `from_yaml` does NOT use `eval()` or unsafe YAML loading — use `yaml.safe_load()`.
- [ ] Confirm the default `research_config.yaml` does NOT contain a real `search_api_key` value — it must use a placeholder (e.g., `"YOUR_SEARCH_API_KEY_HERE"`).
- [ ] Confirm phase ordering is encoded in a single authoritative location (not duplicated across files).

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/phase_5/test_research_config.py -v` and confirm all tests pass.
- [ ] Run `pytest --tb=short` (full suite) and confirm no regressions.
- [ ] Run coverage: `pytest --cov=devs.config.research_config --cov-report=term-missing` and confirm 100% branch coverage on validators.
- [ ] Run `python -c "from devs.config import ResearchConfig; c = ResearchConfig(search_api_key='test'); print(c.max_parallel_streams)"` and confirm output is `3`.

## 5. Update Documentation
- [ ] Add `ResearchConfig` reference to `docs/config.md` (or create it) with a table of all fields, their types, defaults, and descriptions. Reference requirements `TAS-049` and `2_TAS-REQ-001` in this table.
- [ ] Document the `research_config.yaml` defaults file location and format in `docs/config.md`.
- [ ] Update `docs/pipeline.md` to document the canonical phase order: `RESEARCH → ARCHITECTURE → TASK_BREAKDOWN → CODE_GENERATION`.
- [ ] Update agent memory file `docs/agent_memory/phase_5.md`: "ResearchConfig schema finalized. Key defaults: `max_parallel_streams=3`, `min_confidence_score=0.85`. Phase order: RESEARCH is always first. `search_api_key` must never be logged."

## 6. Automated Verification
- [ ] Run `pytest tests/phase_5/test_research_config.py -v --tb=short` and assert exit code `0`.
- [ ] Run `python -c "from devs.config import ResearchConfig; print('OK')"` and assert output is `OK`.
- [ ] Run `grep -r "search_api_key" devs/` and assert it does NOT appear in any `__repr__`, `__str__`, or logging statement.
- [ ] Run `pytest --co -q tests/phase_5/test_research_config.py` and assert at least 8 test items are collected.

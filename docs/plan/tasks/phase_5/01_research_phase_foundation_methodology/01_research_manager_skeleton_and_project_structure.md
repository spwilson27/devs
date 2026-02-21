# Task: ResearchManager Agent Skeleton & Project Structure Setup (Sub-Epic: 01_Research Phase Foundation & Methodology)

## Covered Requirements
- [TAS-049], [9_ROADMAP-PHASE-003]

## 1. Initial Test Written
- [ ] Create `tests/phase_5/test_research_manager.py` (or equivalent for the project's test framework).
- [ ] Write a test `test_research_manager_module_imports` that imports `devs.agents.research.research_manager` and asserts the `ResearchManager` class is present and importable.
- [ ] Write a test `test_research_manager_instantiation` that instantiates `ResearchManager` with a mock config object and asserts the instance is created without errors.
- [ ] Write tests verifying the following public method signatures exist on `ResearchManager` (using `inspect` or duck-typing assertions):
  - `run(brief: str) -> ResearchResult`
  - `decompose_brief(brief: str) -> list[ResearchQuery]`
  - `get_status() -> PhaseStatus`
- [ ] Write a test `test_research_phase_directory_structure` that asserts the following directories exist within the project source tree:
  - `devs/agents/research/`
  - `devs/agents/research/tools/`
  - `devs/agents/research/reports/`
  - `devs/models/research/`
- [ ] Write a test `test_research_result_dataclass` that imports `ResearchResult` from `devs.models.research` and asserts it has fields: `market_report`, `tech_report`, `competitive_report`, `user_research_report`, `confidence_score`, `status`.
- [ ] Write a test `test_phase_status_enum` that imports `PhaseStatus` from `devs.models.research` and asserts it has members: `PENDING`, `IN_PROGRESS`, `AWAITING_APPROVAL`, `APPROVED`, `FAILED`.
- [ ] All tests must fail (red) before implementation begins — confirm this by running the test suite.

## 2. Task Implementation
- [ ] Create the directory tree:
  ```
  devs/
    agents/
      research/
        __init__.py
        research_manager.py
        tools/
          __init__.py
        reports/
          __init__.py
    models/
      research/
        __init__.py
        result.py
        status.py
        query.py
  ```
- [ ] In `devs/models/research/status.py`, define the `PhaseStatus` enum with members: `PENDING`, `IN_PROGRESS`, `AWAITING_APPROVAL`, `APPROVED`, `FAILED`.
- [ ] In `devs/models/research/query.py`, define the `ResearchQuery` dataclass with fields: `id: str`, `query_text: str`, `domain: str` (e.g., `"market"`, `"tech"`, `"competitive"`, `"user"`), `priority: int`.
- [ ] In `devs/models/research/result.py`, define the `ResearchResult` dataclass with fields: `market_report: str | None`, `tech_report: str | None`, `competitive_report: str | None`, `user_research_report: str | None`, `confidence_score: float`, `status: PhaseStatus`.
- [ ] In `devs/agents/research/research_manager.py`, implement the `ResearchManager` class:
  - Constructor `__init__(self, config: ResearchConfig)` — accept a config object, store it, set initial `self._status = PhaseStatus.PENDING`.
  - Stub `decompose_brief(self, brief: str) -> list[ResearchQuery]` — raise `NotImplementedError` (to be implemented in the Brief Expansion Engine task).
  - Stub `run(self, brief: str) -> ResearchResult` — raise `NotImplementedError` (to be implemented in subsequent tasks).
  - Implement `get_status(self) -> PhaseStatus` — return `self._status`.
- [ ] Export all public symbols from `devs/agents/research/__init__.py` and `devs/models/research/__init__.py`.
- [ ] Register `devs.agents.research` in any existing agent registry or plugin manifest used by the project (check for a `registry.py` or `plugins.yaml` pattern).

## 3. Code Review
- [ ] Verify the directory structure follows the existing project's module layout conventions (e.g., consistent `__init__.py` usage, naming conventions matching other agents).
- [ ] Confirm `ResearchManager` constructor accepts a typed config object — do NOT use `**kwargs` or untyped dicts.
- [ ] Confirm all dataclasses use `@dataclass` (or `pydantic.BaseModel` if that is the project standard) — do NOT use plain dicts.
- [ ] Confirm `PhaseStatus` uses `enum.Enum` (or `enum.StrEnum` if the project uses string enums).
- [ ] Confirm stubs raise `NotImplementedError` — they must NOT silently return `None` or empty values, which would cause false-positive tests in downstream tasks.
- [ ] Confirm no business logic is implemented in this task — this is structure only.

## 4. Run Automated Tests to Verify
- [ ] Run the full test suite: `pytest tests/phase_5/test_research_manager.py -v` (adjust command for the project's test runner).
- [ ] Confirm all tests introduced in Step 1 now pass (green).
- [ ] Confirm no pre-existing tests were broken by running the full suite: `pytest --tb=short`.
- [ ] Confirm test coverage for the new module is ≥ 90%: `pytest --cov=devs.agents.research --cov=devs.models.research --cov-report=term-missing`.

## 5. Update Documentation
- [ ] Add an entry for `ResearchManager` in `docs/agents.md` (or the equivalent agent catalog) describing its role, inputs (`brief: str`), and outputs (`ResearchResult`).
- [ ] Update `docs/architecture.md` (or equivalent) to include the `devs/agents/research/` module in the agent layer diagram.
- [ ] Add a CHANGELOG entry under `[Unreleased]`: "Added ResearchManager agent skeleton and research phase directory structure (Phase 5, Sub-Epic 01)."
- [ ] Update agent "memory" file (e.g., `docs/agent_memory/phase_5.md`) noting: "ResearchManager skeleton created. Stubs for `run` and `decompose_brief` are intentionally `NotImplementedError` — implement in tasks 02 and 03."

## 6. Automated Verification
- [ ] Run `pytest tests/phase_5/test_research_manager.py -v --tb=short` and assert exit code is `0`.
- [ ] Run `python -c "from devs.agents.research import ResearchManager; print('OK')"` and assert output is `OK`.
- [ ] Run `python -c "from devs.models.research import ResearchResult, PhaseStatus, ResearchQuery; print('OK')"` and assert output is `OK`.
- [ ] Run `pytest --co -q tests/phase_5/test_research_manager.py` and assert at least 7 test items are collected.

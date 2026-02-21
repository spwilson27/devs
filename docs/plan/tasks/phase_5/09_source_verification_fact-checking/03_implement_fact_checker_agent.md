# Task: Implement Fact-Checker Agent (Sub-Epic: 09_Source Verification & Fact-Checking)

## Covered Requirements
- [8_RISKS-REQ-052], [8_RISKS-REQ-126]

## 1. Initial Test Written
- [ ] Create `tests/unit/research/test_fact_checker_agent.py`. Write unit tests for a `FactCheckerAgent` class with an async method `check(report: ResearchReport, raw_data: list[ScrapedPage]) -> FactCheckReport`. Use `unittest.mock.AsyncMock` to mock the underlying LLM call. Test cases:
  - When the LLM returns no discrepancies, `FactCheckReport.discrepancies` is an empty list and `FactCheckReport.passed` is `True`.
  - When the LLM returns one discrepancy (a claim not supported by any scraped page), `FactCheckReport.discrepancies` has length 1 and `FactCheckReport.passed` is `False`.
  - When `raw_data` is an empty list, a `ValueError` is raised (cannot fact-check without raw data).
  - When the LLM call raises an exception, `FactCheckerAgent.check()` re-raises a `FactCheckError` wrapping the original.
- [ ] Create `tests/unit/research/test_fact_check_report_schema.py`. Write unit tests for `FactCheckReport` and `Discrepancy` Pydantic models:
  - `Discrepancy` requires `claim_text: str`, `expected_evidence: str`, `actual_evidence: str`, and `severity: Literal["low", "medium", "high"]`.
  - `FactCheckReport` with `discrepancies=[]` has `passed=True` (auto-computed).
  - `FactCheckReport` with one or more discrepancies has `passed=False`.
- [ ] Create `tests/unit/research/test_scraped_page_schema.py`. Write unit tests for `ScrapedPage` model (fields: `url: HttpUrl`, `raw_markdown: str`, `scraped_at: datetime`):
  - Valid `ScrapedPage` passes schema validation.
  - `raw_markdown` being empty string raises `ValidationError`.

## 2. Task Implementation
- [ ] Create `src/devs/research/schemas/scraped_page.py`. Implement the `ScrapedPage` Pydantic model:
  ```python
  from pydantic import BaseModel, HttpUrl, field_validator
  from datetime import datetime

  class ScrapedPage(BaseModel):
      url: HttpUrl
      raw_markdown: str
      scraped_at: datetime

      @field_validator('raw_markdown')
      @classmethod
      def must_not_be_empty(cls, v):
          if not v.strip():
              raise ValueError('raw_markdown must not be empty.')
          return v
  ```
- [ ] Create `src/devs/research/schemas/fact_check.py`. Implement `Discrepancy` and `FactCheckReport`:
  ```python
  from pydantic import BaseModel, computed_field
  from typing import Literal, List

  class Discrepancy(BaseModel):
      claim_text: str
      expected_evidence: str
      actual_evidence: str
      severity: Literal["low", "medium", "high"]

  class FactCheckReport(BaseModel):
      discrepancies: List[Discrepancy] = []

      @computed_field
      @property
      def passed(self) -> bool:
          return len(self.discrepancies) == 0
  ```
- [ ] Create `src/devs/research/fact_checker_agent.py`. Implement `FactCheckerAgent`:
  - The agent takes an LLM client (injected via constructor) and a structured prompt template.
  - `check(report: ResearchReport, raw_data: list[ScrapedPage]) -> FactCheckReport`:
    1. Raise `ValueError` if `raw_data` is empty.
    2. Build a prompt containing: all claims from `report.claims` and all `raw_markdown` content from `raw_data` (truncated to 4000 tokens each to avoid context overflow).
    3. Call the LLM with `response_format=FactCheckReport` (structured output).
    4. Wrap any LLM exception in `FactCheckError` and re-raise.
    5. Return the parsed `FactCheckReport`.
  - Define `FactCheckError` in `src/devs/research/exceptions.py`.
- [ ] Create the prompt template at `src/devs/research/prompts/fact_checker.py` as a `FACT_CHECKER_SYSTEM_PROMPT` string constant. The prompt must instruct the LLM to:
  - Act as a fact-checker comparing claims in the research report against raw scraped evidence.
  - Identify any claim not supported by any provided scraped page.
  - Return a structured `FactCheckReport` JSON with `discrepancies`, each with `claim_text`, `expected_evidence`, `actual_evidence`, and `severity`.
  - Not add commentary outside of the structured JSON.
- [ ] Update `src/devs/research/__init__.py` to export `FactCheckerAgent`, `FactCheckReport`, `Discrepancy`, `ScrapedPage`.

## 3. Code Review
- [ ] Verify `FactCheckerAgent` uses constructor injection for the LLM client (not a module-level global), enabling clean mocking in tests.
- [ ] Confirm `FactCheckReport.passed` is a `@computed_field` (or `@property`), not a mutable field that could be set incorrectly.
- [ ] Ensure the prompt template never includes user-supplied content directly in the system prompt — all dynamic data must be in the user message (prompt injection prevention).
- [ ] Verify that raw_markdown content in the prompt is truncated (e.g., max 4000 chars per page) to avoid exceeding LLM context limits.
- [ ] Confirm `FactCheckError` wraps the original exception as `__cause__` (using `raise FactCheckError(...) from original_exc`).
- [ ] Ensure all new types are in `schemas/` and agent logic is in agent files, maintaining the project's separation of concerns.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/unit/research/test_fact_checker_agent.py tests/unit/research/test_fact_check_report_schema.py tests/unit/research/test_scraped_page_schema.py -v` and confirm all tests pass with exit code 0.
- [ ] Run `mypy src/devs/research/fact_checker_agent.py src/devs/research/schemas/fact_check.py src/devs/research/schemas/scraped_page.py` and confirm no type errors.

## 5. Update Documentation
- [ ] Add `docs/research/fact_checker_agent.md` documenting: the agent's purpose, inputs (`ResearchReport` + `list[ScrapedPage]`), outputs (`FactCheckReport`), the LLM prompt structure, and the truncation strategy for large scraped pages.
- [ ] Update `docs/research/data_models.md` to add `ScrapedPage`, `Discrepancy`, and `FactCheckReport` schema tables.
- [ ] Update `docs/architecture/agent_memory.md` to note that `FactCheckReport` results must be persisted alongside the `ResearchReport` so downstream agents can inspect discrepancy severity.

## 6. Automated Verification
- [ ] Run `pytest tests/unit/research/test_fact_checker_agent.py --tb=short -q` and confirm output shows all tests `passed` with no `failed` or `error`.
- [ ] Run `python -c "from devs.research.fact_checker_agent import FactCheckerAgent; from devs.research.schemas.fact_check import FactCheckReport, Discrepancy; from devs.research.schemas.scraped_page import ScrapedPage; print('Imports OK')"` and confirm no `ImportError`.
- [ ] Run `grep -n "raise FactCheckError" src/devs/research/fact_checker_agent.py` and verify the pattern exists, confirming exception wrapping is implemented.

# Task: Implement Source Citation Schema & Enforcement (Sub-Epic: 09_Source Verification & Fact-Checking)

## Covered Requirements
- [8_RISKS-REQ-050], [8_RISKS-REQ-126]

## 1. Initial Test Written
- [ ] Create `tests/unit/research/test_citation_schema.py`. Define a `CitedClaim` Pydantic model with fields: `claim_text: str`, `source_url: HttpUrl`, `source_title: str`, `scraped_at: datetime`, and `confidence: float`. Write unit tests asserting:
  - A `CitedClaim` object with all required fields passes validation.
  - A `CitedClaim` missing `source_url` raises a `ValidationError`.
  - A `CitedClaim` with a malformed URL (e.g., `"not-a-url"`) raises a `ValidationError`.
- [ ] Create `tests/unit/research/test_research_report_schema.py`. Define a `ResearchReport` Pydantic model containing a `claims: list[CitedClaim]` field. Write unit tests asserting:
  - A `ResearchReport` with zero claims raises a `ValidationError` (min length 1).
  - A `ResearchReport` with all claims having valid `source_url` fields passes validation.
- [ ] Create `tests/unit/research/test_citation_enforcer.py`. Define a `CitationEnforcer` class with a method `enforce(report: ResearchReport) -> list[str]` returning a list of violation messages. Write unit tests:
  - A report with all claims cited returns an empty list.
  - A report where any claim's `source_url` is `None` or empty returns a non-empty violation list identifying the offending claim text.
  - A report with duplicate URLs returns a warning (not a hard error) in a separate `warnings` list.

## 2. Task Implementation
- [ ] Create `src/devs/research/schemas/citation.py`. Implement the `CitedClaim` Pydantic (v2) model:
  ```python
  from pydantic import BaseModel, HttpUrl
  from datetime import datetime

  class CitedClaim(BaseModel):
      claim_text: str
      source_url: HttpUrl
      source_title: str
      scraped_at: datetime
      confidence: float  # 0.0–1.0
  ```
- [ ] Create `src/devs/research/schemas/report.py`. Implement the `ResearchReport` Pydantic model:
  ```python
  from pydantic import BaseModel, field_validator
  from typing import List
  from .citation import CitedClaim

  class ResearchReport(BaseModel):
      title: str
      generated_at: datetime
      claims: List[CitedClaim]

      @field_validator('claims')
      @classmethod
      def claims_must_not_be_empty(cls, v):
          if not v:
              raise ValueError('ResearchReport must contain at least one claim.')
          return v
  ```
- [ ] Create `src/devs/research/citation_enforcer.py`. Implement the `CitationEnforcer` class:
  - `enforce(report: ResearchReport) -> dict` returning `{"violations": list[str], "warnings": list[str]}`.
  - Violations: any claim where `source_url` is absent.
  - Warnings: any `source_url` that appears more than once across claims.
- [ ] Update `src/devs/research/__init__.py` to export `CitedClaim`, `ResearchReport`, and `CitationEnforcer`.
- [ ] Add the `CitationEnforcer.enforce()` call into the `ResearchManager` agent's report assembly step so that any violation raises a `CitationViolationError` before the report is written to disk.

## 3. Code Review
- [ ] Verify `CitedClaim` uses `pydantic.HttpUrl` (not a plain `str`) for `source_url`, ensuring protocol-level validation.
- [ ] Confirm `ResearchReport` uses a Pydantic `field_validator` (not a simple `if` check) for the `claims` length constraint.
- [ ] Ensure `CitationEnforcer` is a pure function-style class with no side effects (no file I/O, no network calls).
- [ ] Confirm that `CitationViolationError` is a custom exception class defined in `src/devs/research/exceptions.py` and is not a bare `ValueError`.
- [ ] Check that all new modules have corresponding `__init__.py` exports and type hints throughout.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/unit/research/test_citation_schema.py tests/unit/research/test_research_report_schema.py tests/unit/research/test_citation_enforcer.py -v` and confirm all tests pass with exit code 0.
- [ ] Run `mypy src/devs/research/schemas/ src/devs/research/citation_enforcer.py` and confirm no type errors.

## 5. Update Documentation
- [ ] Add a section to `docs/research/data_models.md` documenting the `CitedClaim` and `ResearchReport` schemas, including field descriptions and validation rules.
- [ ] Add a section to `docs/research/citation_enforcement.md` describing the `CitationEnforcer`, its violation vs. warning distinction, and how it integrates with `ResearchManager`.
- [ ] Update `docs/architecture/agent_memory.md` to note that all research data flowing through the system must conform to the `ResearchReport` schema before being persisted.

## 6. Automated Verification
- [ ] Add a CI step in `.github/workflows/ci.yml` (or equivalent) that runs `pytest tests/unit/research/ --tb=short` and fails the build if any test fails.
- [ ] Run `python -c "from devs.research import CitedClaim, ResearchReport, CitationEnforcer; print('Imports OK')"` to confirm the module is importable without errors.
- [ ] Run `pytest tests/unit/research/ --co -q` to list collected tests and confirm all three test modules appear in the output.

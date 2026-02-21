# Task: Integrate Hallucination Mitigation Pipeline into ResearchManager (Sub-Epic: 09_Source Verification & Fact-Checking)

## Covered Requirements
- [8_RISKS-REQ-126], [8_RISKS-REQ-050], [8_RISKS-REQ-051], [8_RISKS-REQ-052]

## 1. Initial Test Written
- [ ] Create `tests/unit/research/test_research_manager_verification_pipeline.py`. Write unit tests for the `ResearchManager`'s end-to-end verification pipeline using `AsyncMock` to mock `CitationEnforcer`, `BatchLinkValidator`, and `FactCheckerAgent`. Test cases:
  - When all pipeline steps succeed (no violations, all links reachable, no discrepancies), `ResearchManager.run_verification_pipeline(report, raw_data)` returns a `VerificationResult` with `passed=True`.
  - When `CitationEnforcer` returns violations, the pipeline raises `CitationViolationError` immediately without calling `BatchLinkValidator` or `FactCheckerAgent`.
  - When `BatchLinkValidator` returns one unreachable link, the pipeline still proceeds (warning only) and `VerificationResult.link_warnings` has length 1.
  - When `FactCheckerAgent` returns a `FactCheckReport` with one high-severity discrepancy, `VerificationResult.passed` is `False` and `VerificationResult.fact_check_report.discrepancies` has length 1.
  - When `FactCheckError` is raised by the agent, the pipeline catches it, logs the error, and re-raises it.
- [ ] Create `tests/unit/research/test_verification_result_schema.py`. Write unit tests for the `VerificationResult` Pydantic model:
  - `VerificationResult` with `discrepancies=[]` and `link_warnings=[]` and `citation_violations=[]` has `passed=True`.
  - `VerificationResult` with any non-empty field has `passed=False`.
- [ ] Create `tests/integration/research/test_verification_pipeline_integration.py` (skippable with `@pytest.mark.integration`) with a test that runs the full `ResearchManager.run_verification_pipeline()` against a small fixture `ResearchReport` and `list[ScrapedPage]` using a real (but cheap) LLM call. Assert `VerificationResult` is returned without exception.

## 2. Task Implementation
- [ ] Create `src/devs/research/schemas/verification_result.py`. Implement `VerificationResult`:
  ```python
  from pydantic import BaseModel, computed_field
  from typing import List, Optional
  from .fact_check import FactCheckReport
  from ..link_validator import LinkValidationResult

  class VerificationResult(BaseModel):
      citation_violations: List[str] = []
      link_warnings: List[LinkValidationResult] = []
      fact_check_report: Optional[FactCheckReport] = None

      @computed_field
      @property
      def passed(self) -> bool:
          no_citations = not self.citation_violations
          no_discrepancies = (
              self.fact_check_report is None or self.fact_check_report.passed
          )
          return no_citations and no_discrepancies
  ```
- [ ] Add method `run_verification_pipeline(self, report: ResearchReport, raw_data: list[ScrapedPage]) -> VerificationResult` to the `ResearchManager` class in `src/devs/research/research_manager.py`:
  1. **Step 1 — Citation Enforcement:** Call `CitationEnforcer().enforce(report)`. If `violations` list is non-empty, raise `CitationViolationError` with the list of violations (do not proceed).
  2. **Step 2 — Link Validation:** Call `await BatchLinkValidator().validate_all([str(c.source_url) for c in report.claims])`. Collect results; store unreachable results in `link_warnings`.
  3. **Step 3 — Fact Checking:** Call `await self._fact_checker.check(report, raw_data)`. Store result as `fact_check_report`.
  4. Build and return `VerificationResult(citation_violations=[], link_warnings=link_warnings, fact_check_report=fact_check_report)`.
  5. Wrap any `FactCheckError` with a structured log entry at `ERROR` level including `report.title`, `error` details, then re-raise.
- [ ] Wire `FactCheckerAgent` into `ResearchManager.__init__()` via constructor injection:
  ```python
  def __init__(self, llm_client, fact_checker: FactCheckerAgent | None = None):
      self._llm_client = llm_client
      self._fact_checker = fact_checker or FactCheckerAgent(llm_client=llm_client)
  ```
- [ ] Update the `ResearchManager`'s main `run()` method to call `run_verification_pipeline()` after report assembly and before calling the HITL gate. The result must be stored in the agent's execution context/state.
- [ ] Add a `confidence_score: float` field to `VerificationResult` computed as: `1.0 - (0.3 * len(citation_violations)/max(len(report.claims),1)) - (0.2 * len(link_warnings)/max(len(report.claims),1)) - (0.5 if fact_check_report and not fact_check_report.passed else 0.0)`. The HITL gate must only allow progression to Phase 6 if `confidence_score >= 0.85`.

## 3. Code Review
- [ ] Verify `run_verification_pipeline` follows the exact three-step order: Citation → Link → Fact-Check. Any deviation breaks the short-circuit logic for citation violations.
- [ ] Confirm `CitationViolationError` is raised (not returned) so that the calling code in `run()` can catch it and surface it in the UI without proceeding.
- [ ] Verify link validation warnings are not fatal — the pipeline must continue after unreachable links are logged.
- [ ] Confirm `confidence_score` is a deterministic, pure computation — no randomness, no LLM calls.
- [ ] Confirm `FactCheckerAgent` is injected (not instantiated inside the method) so it can be mocked in unit tests.
- [ ] Verify the HITL gate check uses `>= 0.85` (not `> 0.85`) to match the phase requirements exactly.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/unit/research/test_research_manager_verification_pipeline.py tests/unit/research/test_verification_result_schema.py -v --asyncio-mode=auto` and confirm all tests pass with exit code 0.
- [ ] Run `pytest tests/integration/research/test_verification_pipeline_integration.py -v -m integration` and confirm it passes against real LLM.
- [ ] Run `mypy src/devs/research/research_manager.py src/devs/research/schemas/verification_result.py` and confirm no type errors.

## 5. Update Documentation
- [ ] Add `docs/research/verification_pipeline.md` documenting the three-stage pipeline (Citation → Link → Fact-Check), the `confidence_score` formula, and the `>= 0.85` threshold gate.
- [ ] Update `docs/research/data_models.md` with `VerificationResult` schema table including the `confidence_score` computed field.
- [ ] Update `docs/architecture/agent_memory.md` to note that `VerificationResult` and `confidence_score` are stored in the phase execution context and are accessible to the HITL gate and to Phase 6 agents.
- [ ] Update `docs/phases/phase_5.md` to describe the verification pipeline as the final step before the Research Gate, replacing any placeholder text with the actual implementation details.

## 6. Automated Verification
- [ ] Run `pytest tests/unit/research/ --tb=short -q` and confirm output shows all relevant tests `passed` with no `failed` or `error`.
- [ ] Run `python -c "from devs.research.schemas.verification_result import VerificationResult; r = VerificationResult(); print('passed:', r.passed)"` and confirm output is `passed: True`.
- [ ] Run `grep -n "confidence_score" src/devs/research/schemas/verification_result.py` and verify the field is defined.
- [ ] Run `grep -n "run_verification_pipeline" src/devs/research/research_manager.py` and verify the method is present.
- [ ] Run `grep -n ">= 0.85" src/devs/research/research_manager.py` and verify the HITL gate threshold is enforced.

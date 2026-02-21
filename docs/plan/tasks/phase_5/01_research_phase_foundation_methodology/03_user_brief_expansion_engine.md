# Task: User Brief Expansion Engine (Sub-Epic: 01_Research Phase Foundation & Methodology)

## Covered Requirements
- [2_TAS-REQ-001], [TAS-049]

## 1. Initial Test Written
- [ ] Create `tests/phase_5/test_brief_expansion_engine.py`.
- [ ] Write `test_brief_expander_instantiation` — import `BriefExpander` from `devs.agents.research.brief_expander` and assert it can be instantiated with a mock LLM client and a `ResearchConfig`.
- [ ] Write `test_expand_brief_returns_research_queries` — call `BriefExpander.expand(brief="A task management app for remote teams")` and assert it returns a non-empty `list[ResearchQuery]` with at least 8 items.
- [ ] Write `test_expand_brief_covers_all_domains` — call `expand()` on a sample brief and assert the returned `list[ResearchQuery]` contains at least one query per domain: `"market"`, `"tech"`, `"competitive"`, `"user"`.
- [ ] Write `test_expand_brief_token_floor` — call `expand()` and assert the total character length of all `query_text` values combined is ≥ 4000 characters (proxy for "thousands of tokens of context").
- [ ] Write `test_expand_brief_query_uniqueness` — assert no two queries in the returned list have identical `query_text` values.
- [ ] Write `test_expand_brief_query_ids_unique` — assert all `id` values in the returned list are unique strings.
- [ ] Write `test_expand_brief_empty_input_raises` — call `expand("")` and assert a `ValueError` is raised with message containing `"Brief cannot be empty"`.
- [ ] Write `test_expand_brief_whitespace_only_raises` — call `expand("   ")` and assert `ValueError` is raised.
- [ ] Write `test_expand_brief_priority_ordering` — assert the returned list is sorted by `priority` in descending order (highest priority queries first).
- [ ] Write `test_expand_brief_llm_called` — using a mock LLM client, assert the LLM is called at least once during `expand()` (verifying that the expansion is LLM-driven, not template-only).
- [ ] Confirm all tests fail (red) before implementation.

## 2. Task Implementation
- [ ] Create `devs/agents/research/brief_expander.py`:
  - Define class `BriefExpander`:
    - Constructor `__init__(self, llm_client: LLMClient, config: ResearchConfig)`.
    - Implement `expand(self, brief: str) -> list[ResearchQuery]`:
      1. Validate `brief` is non-empty (strip whitespace); raise `ValueError("Brief cannot be empty")` if not.
      2. Construct a structured LLM prompt instructing the model to decompose the brief into at minimum 8–12 distinct research queries across the four domains: `market`, `tech`, `competitive`, `user`.
      3. The prompt must explicitly instruct the LLM to be exhaustive — generating queries covering primary use cases, edge cases, adjacent markets, competitive dynamics, technology options, and user persona segments.
      4. Parse the LLM response into a `list[ResearchQuery]`, assigning a unique `id` (UUID4) to each.
      5. Sort queries by `priority` descending before returning.
      6. Validate the output: if fewer than 4 queries are returned or any domain is missing, log a warning and retry the LLM call once with an explicit "be more thorough" instruction.
- [ ] Create `devs/agents/research/prompts/brief_expansion_prompt.py`:
  - Define `BRIEF_EXPANSION_SYSTEM_PROMPT: str` and `build_brief_expansion_user_prompt(brief: str) -> str`. Keeping prompt logic in a dedicated module makes it independently testable and editable.
- [ ] Update `ResearchManager.decompose_brief()` stub to delegate to `BriefExpander.expand()`:
  ```python
  def decompose_brief(self, brief: str) -> list[ResearchQuery]:
      return self._brief_expander.expand(brief)
  ```
- [ ] Wire `BriefExpander` into `ResearchManager.__init__()`, constructing it with the shared `LLMClient` from config.
- [ ] Ensure `BriefExpander` is exported from `devs/agents/research/__init__.py`.

## 3. Code Review
- [ ] Confirm `BriefExpander.expand()` is a pure function in terms of side effects: no file I/O, no direct HTTP calls (those are delegated to `LLMClient`). The only external interaction is via the injected `llm_client`.
- [ ] Confirm the LLM prompt is stored in `devs/agents/research/prompts/brief_expansion_prompt.py` — NOT hardcoded inline in `BriefExpander`.
- [ ] Confirm input validation happens BEFORE the LLM call to avoid wasting tokens on empty inputs.
- [ ] Confirm `ResearchQuery` objects are constructed with UUID4 `id` values (not sequential integers), preventing ID collisions across parallel execution.
- [ ] Confirm the retry logic is capped at exactly 1 retry — unbounded retries are prohibited.
- [ ] Verify the expansion directly implements [2_TAS-REQ-001]: the method converts a short user brief (typically 50–200 chars) into a list of queries that, when combined, represent thousands of tokens of rich research context.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/phase_5/test_brief_expansion_engine.py -v` and confirm all tests pass.
- [ ] Run `pytest --tb=short` (full suite) and confirm no regressions.
- [ ] Run coverage: `pytest --cov=devs.agents.research.brief_expander --cov=devs.agents.research.prompts --cov-report=term-missing` and confirm ≥ 90% coverage.
- [ ] Manually test with a real or mock LLM: `python -c "from devs.agents.research.brief_expander import BriefExpander; print('OK')"`.

## 5. Update Documentation
- [ ] Add `BriefExpander` to `docs/agents.md` with description: "Converts a short user brief into a structured list of `ResearchQuery` objects spanning market, technology, competitive, and user research domains. Implements [2_TAS-REQ-001]."
- [ ] Add documentation of the expansion prompt strategy to `docs/prompts.md` (or create it): describe the decomposition approach, domain coverage requirements, and retry logic.
- [ ] Update agent memory file `docs/agent_memory/phase_5.md`: "BriefExpander implemented and wired into ResearchManager.decompose_brief(). Uses LLM-driven query decomposition across 4 domains. Min 8 queries per expansion. One retry if coverage is insufficient."

## 6. Automated Verification
- [ ] Run `pytest tests/phase_5/test_brief_expansion_engine.py -v --tb=short` and assert exit code `0`.
- [ ] Run `python -c "from devs.agents.research.brief_expander import BriefExpander; print('OK')"` and assert output is `OK`.
- [ ] Run `pytest --co -q tests/phase_5/test_brief_expansion_engine.py` and assert at least 10 test items are collected.
- [ ] Run `grep -r "decompose_brief" devs/agents/research/research_manager.py` and assert it delegates to `BriefExpander.expand`.

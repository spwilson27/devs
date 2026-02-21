# Task: Implement Brief Decomposition — Convert User Brief into Typed Search Queries (Sub-Epic: 02_ResearchManager Agent Core)

## Covered Requirements
- [9_ROADMAP-TAS-301], [1_PRD-REQ-RES-007]

## 1. Initial Test Written
- [ ] Create `tests/unit/agents/research/test_brief_decomposition.py`.
- [ ] Write a test that `BriefDecomposer.decompose(brief: str) -> list[SearchQuery]` returns a non-empty list for a well-formed brief.
- [ ] Write a test that the returned list contains at least one `SearchQuery` per `ResearchStreamType` (`MARKET`, `COMPETITIVE`, `TECH`, `USER_RESEARCH`) — i.e., at least 4 queries total.
- [ ] Write a test that each `SearchQuery.stream_type` is a valid `ResearchStreamType` member.
- [ ] Write a test that each `SearchQuery.query` is a non-empty string derived from the brief (not a hardcoded placeholder).
- [ ] Write a test that `BriefDecomposer` raises `ValueError` when given an empty string or a brief shorter than 10 characters.
- [ ] Write a test that `BriefDecomposer.decompose` is deterministic for the same input (two calls return equivalent query lists; this verifies no random hallucination per call without LLM variance being tested here — use a mock LLM client).
- [ ] Mock the LLM client (e.g., using `unittest.mock.AsyncMock`) so tests run without network calls.
- [ ] All tests must fail initially.

## 2. Task Implementation
- [ ] Create `src/agents/research/brief_decomposer.py`.
- [ ] Define `class BriefDecomposer`:
  - `__init__(self, llm_client: LLMClient)` — accept an injected LLM client for testability (depend on an abstract `LLMClient` protocol, not a concrete provider).
  - `async def decompose(self, brief: str) -> list[SearchQuery]`:
    - Validate that `brief` is non-empty and at least 10 characters; raise `ValueError` otherwise.
    - Build a structured prompt instructing the LLM to generate 2–4 search queries per `ResearchStreamType` based on the brief.
    - Parse the LLM JSON response into a `list[SearchQuery]` using `pydantic` or `dataclasses`.
    - Ensure every `ResearchStreamType` is represented in the returned list; if the LLM omits one, raise `ResearchDecompositionError`.
- [ ] Define `class ResearchDecompositionError(Exception)` in `src/agents/research/exceptions.py`.
- [ ] Create `src/agents/research/protocols.py` defining `class LLMClient(Protocol)` with `async def complete(self, prompt: str) -> str`.
- [ ] Export `BriefDecomposer` from `src/agents/research/__init__.py`.

## 3. Code Review
- [ ] Verify `BriefDecomposer` depends on the `LLMClient` protocol (not a concrete implementation) — confirming dependency inversion.
- [ ] Verify the LLM prompt is stored as a constant or loaded from a prompt template file, not inline as a magic string.
- [ ] Verify JSON parsing is wrapped in a try/except that raises `ResearchDecompositionError` on malformed LLM output.
- [ ] Verify the `decompose` method logs (at `DEBUG` level) the number of queries generated per `ResearchStreamType`.
- [ ] Verify no global state or singletons are used.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/unit/agents/research/test_brief_decomposition.py -v` and confirm all tests pass.
- [ ] Run `mypy src/agents/research/brief_decomposer.py src/agents/research/protocols.py src/agents/research/exceptions.py` and confirm zero type errors.

## 5. Update Documentation
- [ ] Add a `### BriefDecomposer` subsection under `## ResearchManager` in `docs/architecture/agents.md` describing the decomposition strategy and prompt design.
- [ ] Document the `LLMClient` protocol in `docs/architecture/protocols.md` (create if absent) so future agent implementations know the expected interface.

## 6. Automated Verification
- [ ] Run `pytest tests/unit/agents/research/test_brief_decomposition.py --tb=short` and confirm exit code `0`.
- [ ] Run `python -c "from src.agents.research.brief_decomposer import BriefDecomposer; print('Import OK')"` and confirm exit code `0`.

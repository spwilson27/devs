# Task: Implement Automated Link Validation Tool (Sub-Epic: 09_Source Verification & Fact-Checking)

## Covered Requirements
- [8_RISKS-REQ-051], [8_RISKS-REQ-050], [8_RISKS-REQ-126]

## 1. Initial Test Written
- [ ] Create `tests/unit/research/test_link_validator.py`. Write unit tests for a `LinkValidator` class with an async method `validate(url: str) -> LinkValidationResult`. Use `pytest-asyncio` and `unittest.mock.AsyncMock` to mock HTTP calls. Test cases:
  - A URL returning HTTP 200 produces a `LinkValidationResult` with `is_reachable=True` and `status_code=200`.
  - A URL returning HTTP 404 produces `is_reachable=False` and `status_code=404`.
  - A URL that raises a `httpx.ConnectTimeout` produces `is_reachable=False`, `error="timeout"`.
  - A URL that raises `httpx.ConnectError` (DNS failure) produces `is_reachable=False`, `error="connection_error"`.
  - A non-HTTP URL (e.g., `"ftp://example.com"`) raises a `ValueError` before any network call.
- [ ] Create `tests/unit/research/test_batch_link_validator.py`. Write unit tests for a `BatchLinkValidator` class with method `validate_all(urls: list[str]) -> list[LinkValidationResult]`. Use `AsyncMock` to mock the underlying `LinkValidator.validate`. Test cases:
  - An empty list input returns an empty list immediately.
  - A list of 5 URLs all returning 200 returns 5 results with `is_reachable=True`.
  - A list with one 404 and four 200s returns exactly one result with `is_reachable=False`.
  - Calls are made concurrently (assert `asyncio.gather` is used, not sequential `await` in a loop).
- [ ] Create `tests/integration/research/test_link_validator_integration.py` with a single integration test (skippable via `@pytest.mark.integration`) that calls `LinkValidator().validate("https://example.com")` against the real network and asserts `is_reachable=True`.

## 2. Task Implementation
- [ ] Create `src/devs/research/link_validator.py`. Implement:
  ```python
  import asyncio
  import httpx
  from dataclasses import dataclass
  from typing import Optional

  @dataclass
  class LinkValidationResult:
      url: str
      is_reachable: bool
      status_code: Optional[int] = None
      error: Optional[str] = None

  class LinkValidator:
      TIMEOUT_SECONDS = 10

      async def validate(self, url: str) -> LinkValidationResult:
          if not url.startswith(("http://", "https://")):
              raise ValueError(f"Unsupported URL scheme: {url}")
          try:
              async with httpx.AsyncClient(timeout=self.TIMEOUT_SECONDS, follow_redirects=True) as client:
                  resp = await client.head(url)
                  return LinkValidationResult(url=url, is_reachable=resp.status_code < 400, status_code=resp.status_code)
          except httpx.TimeoutException:
              return LinkValidationResult(url=url, is_reachable=False, error="timeout")
          except httpx.ConnectError:
              return LinkValidationResult(url=url, is_reachable=False, error="connection_error")

  class BatchLinkValidator:
      def __init__(self, validator: LinkValidator | None = None):
          self._validator = validator or LinkValidator()

      async def validate_all(self, urls: list[str]) -> list[LinkValidationResult]:
          if not urls:
              return []
          return await asyncio.gather(*[self._validator.validate(u) for u in urls])
  ```
- [ ] Add `httpx` to `pyproject.toml` (or `requirements.txt`) under runtime dependencies if not already present.
- [ ] Add `pytest-asyncio` to `pyproject.toml` dev dependencies if not already present.
- [ ] Integrate `BatchLinkValidator.validate_all()` into the `ResearchManager` agent's post-assembly step: after `CitationEnforcer.enforce()` passes, extract all `source_url` values from the report's claims and call `validate_all()`. Collect results and attach them to the report as `link_validation_results: list[LinkValidationResult]`.
- [ ] If any `LinkValidationResult.is_reachable` is `False`, log a structured warning via the project's logger (do not raise an exception — broken links are a warning, not a fatal error). The warning must include the `url`, `status_code`, and `error` fields.

## 3. Code Review
- [ ] Verify `LinkValidator.validate()` uses `client.head()` (not `GET`) as a performance optimization, falling back to `GET` only if `HEAD` returns 405.
- [ ] Confirm `BatchLinkValidator.validate_all()` uses `asyncio.gather()` for true concurrency, not a sequential `for` loop with `await`.
- [ ] Verify timeout is enforced via `httpx.AsyncClient(timeout=...)` and not via a manual `asyncio.wait_for` wrapper.
- [ ] Ensure `LinkValidationResult` is a `dataclass` (or Pydantic model), not a plain `dict`, for type safety.
- [ ] Confirm no secrets, API keys, or credentials are embedded in the `LinkValidator` implementation.
- [ ] Verify the `HEAD` → `GET` fallback on 405 is implemented and tested.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/unit/research/test_link_validator.py tests/unit/research/test_batch_link_validator.py -v --asyncio-mode=auto` and confirm all tests pass with exit code 0.
- [ ] Run `pytest tests/integration/research/test_link_validator_integration.py -v -m integration` (requires network) and confirm the real `example.com` test passes.
- [ ] Run `mypy src/devs/research/link_validator.py` and confirm no type errors.

## 5. Update Documentation
- [ ] Add a section to `docs/research/link_validation.md` documenting `LinkValidator` and `BatchLinkValidator`, including the `HEAD`→`GET` fallback behavior, timeout configuration, and the list of error strings (`"timeout"`, `"connection_error"`).
- [ ] Update `docs/research/citation_enforcement.md` to describe how link validation results are attached to `ResearchReport` and logged as warnings.
- [ ] Note in `docs/architecture/agent_memory.md` that broken-link warnings are persisted in the report metadata so future agents can deprioritize claims with unreachable sources.

## 6. Automated Verification
- [ ] Run `pytest tests/unit/research/test_link_validator.py tests/unit/research/test_batch_link_validator.py --tb=short -q` and confirm output contains `passed` with no `failed` or `error`.
- [ ] Run `python -c "from devs.research.link_validator import LinkValidator, BatchLinkValidator, LinkValidationResult; print('Imports OK')"` and confirm no `ImportError`.
- [ ] Confirm `asyncio.gather` is used by running `grep -n "asyncio.gather" src/devs/research/link_validator.py` and verifying it appears in `BatchLinkValidator.validate_all`.

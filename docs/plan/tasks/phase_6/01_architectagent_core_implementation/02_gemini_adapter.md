# Task: Gemini 3 Pro adapter implementation (Sub-Epic: 01_ArchitectAgent Core Implementation)

## Covered Requirements
- [9_ROADMAP-TAS-401]

## 1. Initial Test Written
- [ ] Create `tests/test_gemini_adapter.py` with tests that verify the adapter behavior using monkeypatch or requests-mock:
  - test_send_prompt_returns_structure:
    - Monkeypatch the HTTP client / SDK call used by the adapter to return a predictable JSON payload.
    - Instantiate the GeminiAdapter with a test config (API_URL, API_KEY read from a dict, not env) and call `send_prompt(prompt, system_prompt=None, max_tokens=512)`.
    - Assert the returned object is a dict with keys: `text` (string), `raw` (original response), and `meta` (dict containing `model` and `tokens_used`).
  - test_adapter_handles_timeouts_and_errors:
    - Simulate a timeout/HTTP 5xx and assert the adapter raises a well-documented custom exception (e.g., GeminiAdapterError) or returns a clearly documented error object.

## 2. Task Implementation
- [ ] Implement `src/agents/gemini_adapter.py` with a `GeminiAdapter` class:
  - __init__(self, config): accept `api_key`, `api_url`, `timeout`, `retries` via config dict.
  - send_prompt(self, prompt: str, system_prompt: Optional[str]=None, max_tokens: int=2048) -> dict:
    - Build the request payload expected by Gemini 3 Pro.
    - Use `requests` with `timeout` and simple exponential backoff retries (configurable) to call the API.
    - Parse the response and return a normalized dict: `{"text": <generated_text>, "raw": <raw_response>, "meta": {"model": <model>, "tokens_used": <int>}}`.
  - Provide clear exception handling and document errors.
- [ ] Add a small factory helper `create_gemini_adapter_from_env()` that reads API_KEY/API_URL from environment variables for integration tests (but tests must use injected config to avoid leaking secrets).

## 3. Code Review
- [ ] Verify adapter does not hardcode credentials, uses configurable timeouts and retries, sanitizes logs (no full responses including personal data), and uses dependency injection so network calls can be mocked in tests.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_gemini_adapter.py -q` with network disabled; tests must use monkeypatch to simulate network responses.

## 5. Update Documentation
- [ ] Add `docs/integration/gemini_adapter.md` documenting configuration keys, environment variables needed, expected response schema, and a sample usage snippet for ArchitectAgent.

## 6. Automated Verification
- [ ] Add an integration test under `tests/integration/test_gemini_adapter_recorded.py` that runs only when a special env var `GEMINI_TEST_RECORD` is set; this test should be skipped in CI by default. Include a script `tools/run_gemini_adapter_integration.sh` to run it locally with developer credentials.
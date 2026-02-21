# Task: Implement secret redaction for LLM inputs (Sub-Epic: 21_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-CRY-005]

## 1. Initial Test Written
- [ ] Create unit tests at tests/security/test_redaction.py using pytest. Required tests:
  - test_redact_replaces_exact_secret:
    - Arrange: prompt = "Use MASTER_KEY=SECRETVALUE to decrypt"; secrets = [b"SECRETVALUE"]
    - Act: sanitized, mapping = redact_secrets_from_prompt(prompt, secrets)
    - Assert: assert "SECRETVALUE" not in sanitized; assert any("<REDACTED_SECRET_" in token for token in sanitized.split())
  - test_redact_detects_base64_and_hex_patterns:
    - Arrange: embed a base64-encoded 32-byte value and a long hex string into prompt
    - Act: sanitized, mapping = redact_secrets_from_prompt(prompt, [])
    - Assert: raw candidate patterns no longer present in sanitized; mapping contains placeholders for each detected secret
  - test_llm_wrapper_uses_redaction:
    - Arrange: monkeypatch llm_client.send to capture sent payload
    - Act: call send_prompt_via_wrapper(prompt_with_secret)
    - Assert: captured payload does not contain raw secret and wrapper stored mapping in ephemeral context

Notes for tests:
- Tests should avoid sending real data to external LLMs; use a mocked llm client.
- Provide deterministic examples for base64/hex candidates so assertions are stable.

## 2. Task Implementation
- [ ] Implement `src/security/redaction.py` with the following API and behavior:
  - def find_secrets_in_text(text: str) -> List[Tuple[str, str]]:
    - Heuristics: detect consecutive hex strings >= 64 chars, base64-like tokens >= 43 chars (32 bytes -> 44 base64 chars), and explicit key patterns (e.g., MASTER_KEY=...).
    - Return list of (match_text, reason)
  - def redact_secrets_from_prompt(prompt: str, known_secrets: Optional[List[bytes]] = None) -> Tuple[str, Dict[str, bytes]]:
    - Replace each detected secret with a stable placeholder `<REDACTED_SECRET_n>` where n is incremented per-call.
    - Return (sanitized_prompt, {"<REDACTED_SECRET_1": original_bytes, ...}) and DO NOT persist this mapping to disk or logs.
  - Integration: Add a small wrapper around the LLM client (e.g., src/llm/wrapper.py) to call redact_secrets_from_prompt before sending messages and to pass the mapping only to local post-processing steps (never to other agents or persisted storage).

Implementation notes:
- Use compiled regexes with conservative thresholds to reduce false positives. Add unit tests for edge cases to reduce accidental redaction of non-secret data.
- Keep the mapping ephemeral and store it only in memory scoped to the current process/task.

## 3. Code Review
- [ ] Verify:
  - Redaction heuristics are conservative and documented.
  - Mapping is kept in memory only and never logged or persisted.
  - LLM wrapper invokes redaction for every message before the message is serialized/sent.
  - Redaction is reversible only within the task scope and requires explicit developer intent to restore values locally.

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/security/test_redaction.py` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add `docs/security/llm-redaction.md` describing:
  - Patterns used for detection and the rationale for thresholds.
  - How the LLM wrapper calls redaction and how mapping is stored and used.
  - Developer guidance on how to temporarily un-redact for local debugging (never in production or logged).

## 6. Automated Verification
- [ ] After tests pass, run the integration test that exercises the LLM wrapper and assert the network-bound payload does not contain raw secret material (use the mocked client in CI).
- [ ] Run `git --no-pager grep -n "SECRETVALUE" || true` to ensure no real secrets were committed.

# Task: Implement input redaction protection and redacting logger (Sub-Epic: 18_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-053]

## 1. Initial Test Written
- [ ] Write unit tests at tests/test_security/test_redactor.py that must be authored before implementation:
  - Test names & targets:
    - TestRedactor::test_redact_known_keys (unit): nested dicts containing keys ['password','token','api_key','secret'] are redacted to a constant marker (e.g., '‹REDACTED›').
    - TestRedactor::test_redact_regex_patterns (unit): strings containing patterns that look like long hex/base64 tokens are redacted.
    - TestRedactor::test_logging_formatter_redacts (integration): integrate RedactingFormatter with Python logging, produce a LogRecord containing a secret and assert the formatted message contains no secret and shows the placeholder.
    - TestRedactor::test_prompt_redaction_for_llm (unit): when given a JSON-like prompt object with secret fields, ensure redact_for_prompt returns a sanitized string safe for LLM context.
  - Example command (run first): python -m pytest tests/test_security/test_redactor.py -q

## 2. Task Implementation
- [ ] Implement redaction utilities and a logging formatter at src/security/redactor.py and register in logging config:
  - Public API:
    - def redact(obj: Any, redact_keys: Optional[List[str]] = None) -> Any  # returns deep-copied, redacted structure
    - class RedactingFormatter(logging.Formatter): formats LogRecord and redacts message/args prior to formatting
    - def redact_for_prompt(text: str) -> str  # applies conservative regex-based redaction for token-like strings
  - Implementation details:
    - Redaction rules:
      - Always redact keys that match case-insensitive names: password, pass, pwd, token, api_key, secret, private_key.
      - For string values, redact long base64/hex-like sequences: regex e.g. (?:[A-Za-z0-9+/]{32,}|[a-f0-9]{32,}) and replace with '‹REDACTED›'.
      - Redaction must operate on nested structures (dicts/lists/tuples) without mutating the original object.
      - Provide a small allowlist mechanism to permit non-sensitive keys such as 'id' or 'identifier'.
    - Logging integration:
      - Provide example logging config snippet to use RedactingFormatter for default handlers and for library logs that may include structured data.

## 3. Code Review
- [ ] Verify in PR review:
  - Redaction is deep, deterministic and does not leak partial secrets.
  - Performance characteristics: avoid scanning very large binary blobs; set a maximum string length threshold to scan.
  - The formatter does not change logging levels, and does not swallow exceptions from handlers.
  - Tests include edge cases (binary data, very long strings, non-string scalars).

## 4. Run Automated Tests to Verify
- [ ] Run the redaction tests and ensure they pass:
  - python -m pytest tests/test_security/test_redactor.py -q

## 5. Update Documentation
- [ ] Add docs/security/redaction.md describing:
  - The redaction rules, recommended patterns for developers writing prompts for LLMs, and examples integrating RedactingFormatter in application logging.
  - A brief performance note and guidance on tuning regex thresholds for very large payloads.

## 6. Automated Verification
- [ ] Add a CI check scripts/verify_redaction.sh that:
  - Runs unit tests for redactor and then runs a sample prompt-generation script which is scanned to ensure there are no raw secret patterns in the final prompt sent to the LLM emulation buffer.
  - Example CI step: python -m pytest tests/test_security/test_redactor.py && python scripts/verify_redaction.sh

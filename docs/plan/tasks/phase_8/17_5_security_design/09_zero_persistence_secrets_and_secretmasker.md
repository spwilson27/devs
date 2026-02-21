# Task: Implement Zero-Persistence Secret Policy & SecretMasker (Sub-Epic: 17_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-020]

## 1. Initial Test Written
- [ ] Write tests at tests/test_secret_ephemeral_env.py before implementation:
  - test_ephemeral_env_context_manager_clears_env(): use EphemeralEnv({'API_KEY':'SENSITIVE'}) to run a subprocess; after exit assert os.environ does not contain API_KEY.
  - test_secretmasker_redacts_stdout_and_db(): produce stdout/stderr containing a fake API key pattern and assert that persisted logs and DB saop_json contain `[REDACTED_...]` placeholder instead of the raw string.
  - test_secret_injection_uses_references_not_raw_keys(): API that accepts secret references returns only a KeyReference object and never stores raw secret in SAOP.

## 2. Task Implementation
- [ ] Implement in src/security/secrets.py:
  - EphemeralEnv context manager that sets environment variables only for child process runs and ensures they are unset and not persisted after execution.
  - SecretMasker class that applies regex-based patterns (100+ supplied patterns) and Shannon entropy threshold (>4.5) to detect secrets in streams; replaces matches with `[REDACTED_<TYPE>_<SHORT_HASH>]` before any persistence.
  - Integrate SecretMasker into logging and SAOP persistence pipeline so that stdout/stderr and any captured command output is sanitized before writing to sqlite or logs.
  - Ensure secrets provided to sandbox commands are passed via ephemeral env and not via command-line args or files.

## 3. Code Review
- [ ] Verify:
  - No code path persists raw environment variables or command-line arguments that could include secrets.
  - SecretMasker patterns are configurable but default to a conservative set; unit tests cover known patterns.
  - Integration points (logging, SAOP persistence) always call SecretMasker before write.

## 4. Run Automated Tests to Verify
- [ ] Run pytest tests/test_secret_ephemeral_env.py and the redaction suite; run integration scenario that executes a command printing a secret and assert the DB/logs contain redacted placeholder.

## 5. Update Documentation
- [ ] Add docs/security/secrets_policy.md documenting ephemeral env usage, SecretMasker rules, placeholders format `[REDACTED_<TYPE>_<SHORT_HASH>]`, and how to supply secrets in CI.

## 6. Automated Verification
- [ ] Add scripts/check_redaction_coverage.py that runs a set of secret-looking inputs through the SecretMasker and verifies they are all redacted, and a CI job that scans DB and logs for high-entropy strings.

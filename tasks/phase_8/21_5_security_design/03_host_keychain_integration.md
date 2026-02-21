# Task: Integrate OS-native keychain for secret storage (Sub-Epic: 21_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-CRY-003]

## 1. Initial Test Written
- [ ] Create unit tests at tests/security/test_keychain.py using pytest and monkeypatch. Required tests:
  - test_store_and_retrieve_uses_keyring:
    - Arrange: monkeypatch `keyring.set_password` and `keyring.get_password` to capture calls
    - Act: call store_secret(service="devs", name="master_key", secret=b"dummy") and then retrieve_secret(service="devs", name="master_key")
    - Assert: set_password called with service/name and bytes decoded or base64-string; get_password called and returned value matches stored value
  - test_no_plaintext_fallback_on_error:
    - Arrange: monkeypatch keyring.set_password to raise RuntimeError
    - Act/Assert: store_secret raises a KeychainError and DOES NOT write a plaintext file to disk (mock open and assert not called)

Notes for tests:
- Use monkeypatch to avoid talking to the real OS keychain in CI; tests must not depend on platform keychain availability.
- Confirm that the API encodes bytes to a safe string (e.g., base64) for storage via keyring when needed and decodes on retrieval.

## 2. Task Implementation
- [ ] Implement `src/security/keychain.py` with the following API:
  - def store_secret(service: str, name: str, secret: bytes) -> None:
    - Use `keyring.set_password(service, name, base64.b64encode(secret).decode('ascii'))` to store secrets safely in the OS keychain.
    - Catch keyring exceptions and raise a domain-specific KeychainError.
    - Do not fall back to writing plaintext files; if keyring is unavailable surface a clear error and fail.
  - def retrieve_secret(service: str, name: str) -> bytes:
    - Use `keyring.get_password(service, name)` and base64-decode the returned value to bytes.
    - If the returned value is None raise KeyNotFoundError.

Implementation notes:
- Add `keyring` to dev/runtime dependencies where appropriate.
- Provide a small adapter to allow tests to inject a mock backend (dependency injection) without touching system keyrings.
- Document service and name conventions used by the system (e.g., service="devs.master_key").

## 3. Code Review
- [ ] Verify:
  - No code writes secret material to disk or to logs.
  - Key material is encoded safely (base64) for transport through keyring APIs when storing bytes.
  - Errors are explicit and do not leak secrets.
  - There is a clear testing seam (injection/mocking of keyring) to allow unit tests to run in CI.

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/security/test_keychain.py` and confirm tests pass.

## 5. Update Documentation
- [ ] Add `docs/security/key-storage.md` describing:
  - Which secrets are stored in the OS keychain and the expected service/name conventions.
  - Platform notes (macOS keychain, Windows Credential Vault, Linux Secret Service) and CI testing guidance.

## 6. Automated Verification
- [ ] After tests pass, run `git --no-pager grep -n "keyring.set_password"` to confirm only the adapter uses keyring and no other code writes plaintext secrets.
- [ ] Ensure CI uses the adapter/mocking approach so the real OS keychain is not required in CI.

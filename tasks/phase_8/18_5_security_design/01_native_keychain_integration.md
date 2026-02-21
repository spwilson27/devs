# Task: Implement native keychain integration module (Sub-Epic: 18_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-034]

## 1. Initial Test Written
- [ ] Create unit tests at tests/test_security/test_keychain.py that assert the public Keychain API behavior BEFORE implementing the module:
  - Test names & targets:
    - TestKeychainBackend::test_set_and_get_secret_using_keyring (unit, monkeypatch keyring.set_password/get_password)
    - TestKeychainBackend::test_delete_secret_returns_keyerror_when_missing (unit)
    - TestKeychainBackend::test_fallback_file_store_used_when_keyring_unavailable (unit)
    - TestKeychainIntegration::test_macos_security_cli_integration (integration; mark skip on non-darwin)
  - Test specifics: mock the underlying OS/backends (use pytest monkeypatch to patch keyring.* or subprocess calls), assert that set_secret does not return secrets to stdout, assert exceptions on missing keys, assert correct service namespace prefix is used (e.g., service="devs.master").
  - Test execution command examples (developer agent must run these first and see them fail):
    - python -m pytest tests/test_security/test_keychain.py::TestKeychainBackend -q

## 2. Task Implementation
- [ ] Implement a Keychain abstraction and OS backends at src/security/keychain.py with the following API and behavior:
  - Public API:
    - class Keychain:
      - def set_secret(self, service: str, key: str, value: bytes) -> None
      - def get_secret(self, service: str, key: str) -> bytes
      - def delete_secret(self, service: str, key: str) -> None
  - Implementation guidance:
    - Prefer the well-supported Python keyring library (keyring.set_password/get_password) for macOS/Windows/Linux.
    - Provide a backend factory that selects backend by sys.platform: macOS (Keychain), windows (Credential Manager), linux (Secret Service or keyring fallback).
    - Provide a secure on-disk encrypted fallback only when native keychain is unavailable; fallback must use master key wrapping (see task 02) and store wrapped blobs at ~/.devs/keystore with file permissions 0o600 and atomic write (write temp then rename).
    - Do NOT log raw secret values anywhere; any logging must replace values with ‹REDACTED›.
    - Add clear exceptions: raise KeyError on missing keys, raise RuntimeError on backend failures.
  - Infrastructure changes:
    - Add dependency: python package 'keyring' to dev requirements (requirements/dev.txt or equivalent) and update CI to install it for tests.
    - Add tests fixtures for platform mocking.

## 3. Code Review
- [ ] During self-review and PR: verify the following
  - The Keychain API is small and stable and documented with docstrings and type hints.
  - No code prints or logs secret values; search for string formatting that may include secret variables and ensure replacements.
  - Proper backend isolation (no macOS-specific commands run on Linux/Windows) and clear fallbacks.
  - Atomic file operations for fallback keystore, correct file permissions (600), and no plaintext artifacts left in temp directories.
  - Tests cover happy paths and failure modes (missing keys, backend unavailable).

## 4. Run Automated Tests to Verify
- [ ] Run the unit tests created in step 1 and ensure they pass after implementation:
  - python -m pytest tests/test_security/test_keychain.py -q
  - For integration on macOS (optional): pytest tests/test_security/test_keychain.py::TestKeychainIntegration -q (skip on CI runners that are not macOS)

## 5. Update Documentation
- [ ] Add docs/security/key_management.md documenting:
  - The Keychain API (examples for set/get/delete), supported platforms, fallback behavior, and migration steps for existing plaintext secrets (link to task 03).
  - How the CI should configure access to host keychain when running integration tests (e.g., using secrets in CI runner or marking integration tests as platform-specific).

## 6. Automated Verification
- [ ] Add a verification script scripts/verify_keychain_no_plaintext.sh and a CI job step that:
  - Runs pytest tests/test_security/test_keychain.py and fails on non-zero exit.
  - Scans recent commits and test output for accidental secret disclosure patterns (use a conservative regex for long base64/hex strings and fail if any match appears in plaintext outputs), e.g.:
    - pytest -q tests/test_security/test_keychain.py || exit 1
    - git --no-pager show --name-only HEAD
    - (grep -R --line-number -I -E "[A-Za-z0-9+/]{32,}" | grep -v tests || true) and fail only if matches are in non-test files.
  - The PR must include this script and CI change before merge.
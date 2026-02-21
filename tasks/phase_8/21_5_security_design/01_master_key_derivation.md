# Task: Implement PBKDF2-based Master Key Derivation (Sub-Epic: 21_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-CRY-001]

## 1. Initial Test Written
- [ ] Create unit tests at tests/security/test_kdf.py using pytest. Add the following tests (exact names and assertions required):
  - test_derive_master_key_deterministic:
    - Arrange: passphrase = b"test-passphrase"; salt = bytes.fromhex("00112233445566778899aabbccddeeff") (16 bytes)
    - Act: key1 = derive_master_key(passphrase, salt, iterations=100000, dklen=32)
           key2 = derive_master_key(passphrase, salt, iterations=100000, dklen=32)
    - Assert: assert key1 == key2
              assert isinstance(key1, (bytes, bytearray))
              assert len(key1) == 32
  - test_derive_master_key_salt_changes_output:
    - Arrange: same passphrase, salt2 = os.urandom(16)
    - Act: key3 = derive_master_key(passphrase, salt2, iterations=100000, dklen=32)
    - Assert: assert key3 != key1
  - test_generate_salt_length_and_randomness:
    - Act: s1 = generate_salt(); s2 = generate_salt()
    - Assert: assert len(s1) == 16; assert s1 != s2

Notes for tests:
- Import paths: prefer `from src.security.kdf import derive_master_key, generate_salt`. If the project does not use `src/` layout adjust imports to match project layout. Keep tests deterministic where a fixed salt is used and avoid embedding any real secret values beyond test-only strings.
- Use pytest fixtures where useful and avoid relying on external OS keyrings in these unit tests.

## 2. Task Implementation
- [ ] Implement `src/security/kdf.py` with the following public API and behavior:
  - def derive_master_key(passphrase: Union[str, bytes], salt: bytes, iterations: int = 200_000, dklen: int = 32) -> bytes
    - Use hashlib.pbkdf2_hmac('sha256', passphrase_bytes, salt, iterations, dklen)
    - Ensure function accepts str or bytes for passphrase and always returns bytes.
    - Default iterations should be at least 200000 (configurable constant DEFAULT_KDF_ITERATIONS).
  - def generate_salt(length: int = 16) -> bytes
    - Use secrets.token_bytes(length) to provide cryptographically secure random salt.
  - Add constants: DEFAULT_KDF_ITERATIONS = 200_000, DEFAULT_SALT_LENGTH = 16.
  - Add type hints and docstrings explaining security rationale (HMAC-SHA256, iterations and salt length choices) and link to tests.
  - Do not log or print keying material; if logging is necessary log only parameter metadata (e.g., iterations, salt length) but never the salt or derived key.

## 3. Code Review
- [ ] Verify the implementation meets these criteria:
  - Uses HMAC-SHA256 (hashlib.pbkdf2_hmac with 'sha256').
  - Default iterations >= 100000 (prefer 200_000).
  - Salt length >= 16 bytes and generated with secrets.token_bytes.
  - Functions return raw bytes (no automatic hex/base64 conversion).
  - No secret material is written to logs, files, or LLM contexts.
  - Clear docstrings, type hints, and small focused functions suitable for unit testing.

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/security/test_kdf.py` and ensure all tests pass.
- [ ] If the repository uses a different test runner, adapt the commands accordingly (the tests must still run under CI).

## 5. Update Documentation
- [ ] Add `docs/security/key-management.md` (or update existing security docs) with:
  - Description of the master key derivation strategy (algorithm, iterations, salt length, output length).
  - Migration/rotation guidance and how to change the DEFAULT_KDF_ITERATIONS safely.
  - A note stating master keys must be stored only in the OS keychain (referencing the keychain integration task).

## 6. Automated Verification
- [ ] After tests pass, run `pytest -q` to ensure the new test file succeeds in the full test suite.
- [ ] Run a quick grep to ensure no test-only secrets accidentally left in committed files: `git --no-pager grep -n "test-passphrase" || true` and remove or replace any accidental real secrets before commit.

# Task: Implement KEK derivation and AES Key Wrap APIs (Sub-Epic: 21_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-CRY-002]

## 1. Initial Test Written
- [ ] Create unit tests at tests/security/test_keywrap.py using pytest. Required tests:
  - test_wrap_unwrap_returns_original:
    - Arrange: generate a random content-encryption-key (cek) = secrets.token_bytes(32); derive kek using derive_kek(master_key, info=b"devs:KEK") or use a fixed kek for determinism in one test.
    - Act: wrapped = wrap_key(kek, cek); unwrapped = unwrap_key(kek, wrapped)
    - Assert: assert unwrapped == cek
  - test_unwrap_with_wrong_kek_fails:
    - Arrange: wrapped = wrap_key(kek, cek); wrong_kek = os.urandom(len(kek))
    - Act/Assert: calling unwrap_key(wrong_kek, wrapped) raises a defined UnwrapError (or ValueError / InvalidUnwrap)
  - test_kek_derivation_consistent:
    - Arrange: master = b"master-key-bytes-for-test"; kek1 = derive_kek(master, info=b"devs:KEK"); kek2 = derive_kek(master, info=b"devs:KEK")
    - Assert: assert kek1 == kek2

Notes for tests:
- Import with `from src.security.keywrap import wrap_key, unwrap_key, derive_kek` or adjust to project layout.
- Mocking: where cryptography primitives raise low-level exceptions, assert the public API raises domain-specific errors.

## 2. Task Implementation
- [ ] Implement `src/security/keywrap.py` with the following API and behavior:
  - def derive_kek(master_key: bytes, info: bytes = b"devs:KEK", length: int = 32) -> bytes
    - Use HKDF (cryptography.hazmat.primitives.kdf.hkdf.HKDF) with SHA256 to derive a KEK from the master key.
  - def wrap_key(kek: bytes, cek: bytes) -> bytes
    - Use cryptography.hazmat.primitives.keywrap.aes_key_wrap to wrap the CEK with the KEK.
    - Validate kek length and raise a clear exception if invalid.
  - def unwrap_key(kek: bytes, wrapped_key: bytes) -> bytes
    - Use aes_key_unwrap and map low-level exceptions to a domain-specific UnwrapError.

Implementation notes:
- Add `cryptography` to the project's test/dev dependencies (pyproject.toml or requirements-dev.txt) if not present.
- Use 256-bit KEK (length=32) by default.
- Document expected CEK lengths or support arbitrary CEK lengths that meet AES-KW requirements.
- Never persist unwrapped CEKs to disk; only keep them in memory for the minimal scope required and then zero-out if possible.

## 3. Code Review
- [ ] Verify:
  - KEK is derived with HKDF-SHA256 and includes an `info` context string to bind it to a purpose.
  - Use of AES Key Wrap (RFC 3394) or an authenticated envelope construction.
  - Errors from low-level libs are translated to domain-specific exceptions.
  - No logs or telemetry leak key material.
  - Reasonable validation of key lengths and clear error messages.

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/security/test_keywrap.py` and ensure tests pass.
- [ ] If running full suite, run `pytest -q`.

## 5. Update Documentation
- [ ] Add `docs/security/key-wrap.md` describing:
  - KEK derivation strategy (HKDF parameters: hash, length, info).
  - Wrap/unwrap API examples and error handling guidance.
  - Security notes: never store unwrapped CEKs persistently and rotate KEKs following documented rotation policy.

## 6. Automated Verification
- [ ] After tests pass, run the specific test command to verify: `pytest -q tests/security/test_keywrap.py::test_wrap_unwrap_returns_original`.
- [ ] Verify the project has `cryptography` available in dev deps and CI installs it.

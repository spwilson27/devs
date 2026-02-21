# Task: Implement PBKDF2 master key derivation and key-wrapping utilities (Sub-Epic: 18_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-042]

## 1. Initial Test Written
- [ ] Write unit tests in tests/test_security/test_key_derivation.py to be authored BEFORE implementation. Tests must fail first:
  - Test names & targets:
    - TestKDF::test_derive_master_key_deterministic (unit): given password b"pass" and explicit salt bytes, derive_master_key returns the exact expected 32-byte value (use a fixed vector).
    - TestKDF::test_derive_master_key_differs_with_salt (unit): different salt => different key.
    - TestKDF::test_salt_length_and_iterations (unit): derived key length == 32, salt length >= 16, default iterations >= 200000.
    - TestKDF::test_constant_time_compare_for_verification (unit): verify constant time compare used for key checks.
  - Test execution commands (should fail initially): python -m pytest tests/test_security/test_key_derivation.py -q

## 2. Task Implementation
- [ ] Implement PBKDF2 master key derivation utilities at src/security/key_derivation.py with clear API:
  - def derive_master_key(password: bytes, salt: bytes, iterations: int = 200_000, dklen: int = 32) -> bytes
  - def generate_salt(length: int = 16) -> bytes
  - def wrap_key(master_key: bytes, plaintext: bytes) -> bytes  # AES-GCM or AES-KW using a derived KEK; store nonce and tag with ciphertext
  - def unwrap_key(master_key: bytes, wrapped: bytes) -> bytes
  - Implementation guidance:
    - Use hashlib.pbkdf2_hmac('sha256', password, salt, iterations, dklen).
    - Default iterations must be >= 200_000; document selection rationale in docs.
    - Use cryptography library (cryptography.hazmat.primitives.ciphers.aead.AESGCM) for authenticated encryption (or AES-KW if preferred); add dependency to dev requirements.
    - Do not store raw master keys to disk; only store wrapped keys (wrapped by keychain or stored encrypted using the KEK derived via PBKDF2 and then wrapped by platform keyring).
    - Ensure salts are unique per wrapped item and stored in metadata next to wrapped blob.
    - Ensure any derived keys used in memory are zeroed if possible (document best-effort in Python).

## 3. Code Review
- [ ] In PR self-review, verify:
  - PBKDF2 parameters used meet the minimum required iteration count and salt length.
  - Use of AES-GCM or equivalent AEAD with correct nonce handling and tag preservation.
  - No persistence of raw master key; any persisted values must be wrapped by platform keychain.
  - Proper error handling for corrupted wrapped blobs and explicit tests for malformed inputs.

## 4. Run Automated Tests to Verify
- [ ] Run the new unit tests after implementation:
  - python -m pytest tests/test_security/test_key_derivation.py -q
  - Confirm deterministic vectors pass and negative tests fail when expected.

## 5. Update Documentation
- [ ] Add docs/security/crypto_pbkdf2.md documenting:
  - derive_master_key API, default parameters (iterations, salt length), security rationale and test vectors used in unit tests.
  - Key wrapping format (nonce|tag|ciphertext), storage location conventions, and recovery steps.

## 6. Automated Verification
- [ ] Add a CI check script scripts/verify_kdf.py that:
  - Runs the unit tests and verifies they succeed.
  - Validates that the code contains the configured minimum iterations (e.g., grep for the iteration constant or import and assert value at runtime).
  - Fails the build if someone reduces the iteration constant below the approved minimum.
  - Example verification steps in CI: python -m pytest tests/test_security/test_key_derivation.py && python scripts/verify_kdf.py --assert-min-iterations 200000
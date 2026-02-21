# Task: Provide secure defaults for generated cryptographic material (Sub-Epic: 21_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-CRY-007]

## 1. Initial Test Written
- [ ] Create unit tests at tests/security/test_generate_crypto.py using pytest. Required tests:
  - test_generate_symmetric_key_default_length_and_uniqueness:
    - Act: k1 = generate_symmetric_key(); k2 = generate_symmetric_key()
    - Assert: assert len(k1) == 32; assert k1 != k2
  - test_generate_asymmetric_keypair_default_algorithm:
    - Act: priv, pub = generate_asymmetric_keypair()
    - Assert: verify the public key is of the expected type (e.g., Ed25519PublicKey) and that serializing the public key succeeds

Notes for tests:
- Use the cryptography library to validate key objects and serialization. If the repo does not yet declare `cryptography` as a dependency add it to dev dependencies.

## 2. Task Implementation
- [ ] Implement `src/security/generate.py` with the following API and behavior:
  - def generate_symmetric_key(length: int = 32) -> bytes:
    - Use `secrets.token_bytes(length)` and default to 32 bytes (256 bits) for symmetric keys.
  - def generate_asymmetric_keypair(algorithm: str = "ed25519") -> Tuple[PrivateKey, PublicKey]:
    - Default to modern, secure algorithms: use Ed25519 for signatures and X25519 for key exchange where applicable.
    - Example implementation for Ed25519 using cryptography.hazmat.primitives.asymmetric.ed25519.Ed25519PrivateKey.generate()
    - Return objects that can be serialized to bytes via the cryptography `private_bytes`/`public_bytes` APIs.
  - Provide helper serialization utilities to serialize to PEM/DER for storage/transfer.

Implementation notes:
- Favor modern algorithms (Ed25519/X25519) over legacy RSA unless explicitly required by compatibility.
- Document defaults and reasons in docstrings.
- Ensure key generation uses cryptographically secure RNG (secrets or cryptography primitives) and does not rely on predictable seeds.

## 3. Code Review
- [ ] Verify:
  - Defaults use 256-bit symmetric keys and Ed25519/X25519 for asymmetric where appropriate.
  - Uses secure RNG (secrets.token_bytes or cryptography generators).
  - Generated keys are not logged, persisted, or exposed to LLM contexts by default.
  - Provide explicit guidance for callers who need different algorithms or key sizes.

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/security/test_generate_crypto.py` and ensure tests pass.

## 5. Update Documentation
- [ ] Add `docs/security/crypto-defaults.md` describing:
  - The chosen default algorithms and key sizes and the rationale for those defaults.
  - Examples of how to generate and serialize keys using the new APIs.

## 6. Automated Verification
- [ ] After tests pass, run full test suite `pytest -q` to ensure no regressions.
- [ ] Add a CI check (if CI exists) that asserts `generate_symmetric_key()` returns 32 bytes and `generate_asymmetric_keypair()` returns serializable keys; this can be a small smoke test executed in CI.

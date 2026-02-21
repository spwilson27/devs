# Task: Implement Agent Signature and Verification Module (Sub-Epic: 17_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-001], [5_SECURITY_DESIGN-REQ-SEC-STR-003]

## 1. Initial Test Written
- [ ] Create tests at tests/test_agent_signature.py that MUST be written first:
  - test_sign_and_verify_roundtrip(): generate a small message, call signature.sign(agent_id, message) and assert signature.verify(agent_id, message, sig) is True.
  - test_signature_attaches_to_saop_trace(): simulate a SAOP trace JSON, call sign_saop_trace(agent_id, saop_json, commit_hash) and assert the stored trace in sqlite includes fields: saop_hash, commit_hash, agent_id, signature, pubkey reference.
  - test_signature_invalid_when_signed_by_author_for_signoff(): ensure that if an agent signs its own implementation signoff (where policy forbids), verifier rejects or the orchestrator denies.

## 2. Task Implementation
- [ ] Implement src/security/signature.py with:
  - canonicalize(saop_json) -> bytes using deterministic JSON (e.g., canonical JSON or sorted keys) to ensure consistent signing input.
  - sign_payload(agent_id, payload_bytes) -> signature: fetch private key from KeyStore and sign payload_bytes, return base64 signature.
  - verify_payload(agent_id, payload_bytes, signature) -> bool: fetch public key from DB or key registry and verify signature.
  - sign_saop_trace(agent_id, saop_json, commit_hash) -> record: compute saop_hash=sha256(canonicalized_saop), sign (saop_hash||commit_hash) and persist saop_trace record with signature and agent_id.
  - Ensure signing operations do not expose private key material in exceptions or logs.

## 3. Code Review
- [ ] Verify:
  - Deterministic canonicalization is used before signing.
  - Signatures are verifiable from persisted public keys and stored saop_hash/commit_hash pairs.
  - Sensitive operations are in try/except blocks that do not print key material.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for signature and saop persistence: pytest tests/test_agent_signature.py or equivalent.
- [ ] Run integration test that commits to a temporary git repo and asserts trace linkage.

## 5. Update Documentation
- [ ] Add docs/security/signatures.md explaining signing format, canonicalization, storage schema and how to verify traces offline.

## 6. Automated Verification
- [ ] Create scripts/verify_signatures.py that iterates SAOP traces and verifies each signature against stored public keys, returning non-zero on any mismatch; wire this into CI.

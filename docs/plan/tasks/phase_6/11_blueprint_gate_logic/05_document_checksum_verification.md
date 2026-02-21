# Task: Implement DocumentChecksum utility and integrate with approval flow (Sub-Epic: 11_Blueprint Gate Logic)

## Covered Requirements
- [8_RISKS-REQ-062], [9_ROADMAP-REQ-008]

## 1. Initial Test Written
- [ ] Write unit tests for checksum utilities at tests/unit/test_document_checksum.py. Tests to write first:
  - test_compute_checksum_consistency: create a temporary file with known bytes and assert compute_checksum(path) == hashlib.sha256(contents).hexdigest().
  - test_verify_document_matches_checksum: compute checksum, then call verify_document(path, expected_checksum) and assert True; modify file and assert False.
  - test_checksum_edge_cases: binary files, large files (streaming), and path traversal prevention.

## 2. Task Implementation
- [ ] Implement utility at src/utils/document_checksum.py with functions:
  - compute_checksum(path: str, chunk_size: int = 65536) -> str  # streaming SHA-256
  - verify_document(path: str, expected_checksum: str) -> bool
  - compute_checksum_from_bytes(b: bytes) -> str
  - Add integration points:
    - When creating an ApprovalToken, compute and store the document checksum into approval_tokens.checksum
    - When the Architecture Freeze guard evaluates a write request, call verify_document against the stored checksum; reject writes when checksum mismatch unless a new approval is requested and approved.
  - Add a small CLI helper scripts/compute_checksum.py for maintainers: `python scripts/compute_checksum.py path/to/doc.md` prints SHA256.

## 3. Code Review
- [ ] Ensure:
  - Uses streaming read to support large files and avoid memory spikes
  - Handles binary files correctly
  - Verifies that path resolution forbids paths outside repo root (canonicalize path)
  - Uses hashlib.sha256 from stdlib; avoid custom crypto
  - Tests cover edge conditions and error handling

## 4. Run Automated Tests to Verify
- [ ] Run pytest -q tests/unit/test_document_checksum.py and the integration tests that validate checksum storage and verification when creating/approving tokens.

## 5. Update Documentation
- [ ] Add docs/blueprint-gate/checksum.md describing the checksum algorithm, usage examples, and how checksums are used in approval lifecycle and architecture freeze enforcement.

## 6. Automated Verification
- [ ] Add tests/e2e/test_checksum_enforcement.py that:
  - creates a blueprint file, computes checksum and creates an approval token
  - attempts an unauthorized modification and asserts the guard rejects it
  - then approves a new token for the modified document and asserts the change is allowed
  - return non-zero on any mismatch. CI should run this as an automated verification step for the gate.

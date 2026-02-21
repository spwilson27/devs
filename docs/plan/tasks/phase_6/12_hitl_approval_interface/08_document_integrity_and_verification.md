# Task: Implement Document Checksums & Automated Verification (Sub-Epic: 12_HITL Approval Interface)

## Covered Requirements
- [1_PRD-REQ-UI-002], [1_PRD-REQ-HITL-002]

## 1. Initial Test Written
- [ ] Create `tests/unit/test_document_checksum.py` and `tests/integration/test_freeze_enforcement.py`:
  - `test_compute_and_store_checksum`: Compute sha256 of a sample document string using the project's checksum utility and assert the stored checksum equals the computed value.
  - `test_approval_blocked_if_checksum_mismatch`: Persist an ApprovalRequest with a checksum, mutate the underlying document content, and assert that attempting to create or apply an approval fails with a `checksum_mismatch` error (HTTP 409 or custom exception).
  - `test_recompute_on_manual_edit`: When a manual edit is detected the system should create a new pending ApprovalRequest (or mark existing as stale); test this behavior.

## 2. Task Implementation
- [ ] Implement `src/utils/checksum.py` providing:
  - `compute_sha256(content: str) -> str` returning lowercase hex string.
  - `verify_checksum(content: str, checksum: str) -> bool`.
- [ ] Wire checksum computation into the approval creation flow so that the ApprovalRequest stores the checksum at creation time.
- [ ] Implement `SpecSynchronization` logic (minimal proof-of-concept) in `src/sync/spec_sync.py` that:
  - Detects manual edits to PRD/TAS (e.g., file hash changes),
  - Marks existing approvals as `stale` when checksum no longer matches,
  - Emits an `approval_invalidated` event and creates a new pending ApprovalRequest for the updated document.

## 3. Code Review
- [ ] Verify cryptographic correctness (use standard sha256 lib), avoid truncation, ensure stable encoding (UTF-8 normalized), and ensure checksums are compared in constant-time where applicable when used with secrets.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/unit/test_document_checksum.py tests/integration/test_freeze_enforcement.py` and ensure tests pass and that stale approval behavior is covered.

## 5. Update Documentation
- [ ] Add `docs/approval_integrity.md` describing checksum algorithm, when approvals become stale, and how the system detects and recovers from manual edits.

## 6. Automated Verification
- [ ] Add `scripts/ci_verify_checksum.sh` that runs the checksum unit tests and a smoke integration verifying that an approval is invalidated when the underlying document content changes.

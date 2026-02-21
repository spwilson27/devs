# Task: Implement DocumentChecksum utility (Sub-Epic: 02_Architecture-Driven Development Setup)

## Covered Requirements
- [1_PRD-REQ-PIL-002], [3_MCP-REQ-GOAL-002]

## 1. Initial Test Written
- [ ] Create `tests/phase_6/test_document_checksum.py` with tests:
  - `test_compute_checksum()` computes SHA-256 for PRD and TAS files and asserts output matches a known canonical value when run against a committed canonical fixture.
  - `test_store_and_verify_checksums()` exercises `DocumentChecksum.save(checksums_path)` and `DocumentChecksum.verify(path)` and asserts verification returns `True` for unchanged docs and `False` after simulated modification.

## 2. Task Implementation
- [ ] Implement `src/blueprint/checksum.py` with APIs:
  - `def compute_sha256(path: pathlib.Path) -> str` — read file in binary and compute canonical SHA-256.
  - `def save_checksums(mapping: Dict[str,str], out_path: pathlib.Path)` — write JSON mapping relative-path -> checksum.
  - `def verify_checksum(path: pathlib.Path, checksums_path: pathlib.Path) -> bool` — load the JSON and compare.
  - Use canonical read (`rb`) and normalize line endings to ensure cross-platform deterministic checksums.

## 3. Code Review
- [ ] Verify: deterministic canonicalization, tests for symlink behavior, clear error messages when checksums missing, and that storage format is JSON with timestamp and source commit id if available.

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/phase_6/test_document_checksum.py` and confirm green.

## 5. Update Documentation
- [ ] Document the checksum format and usage in `docs/architecture_add.md` under a subsection "Document Integrity & Checksums" and show example commands to compute/verify.

## 6. Automated Verification
- [ ] CI step: `pytest -q tests/phase_6/test_document_checksum.py && jq . blueprints/checksums.json | grep -q '"/specs/1_prd.md"'` (fail if grep non-zero).
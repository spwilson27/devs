# Task: Document checksum and validator utilities (Sub-Epic: 01_ArchitectAgent Core Implementation)

## Covered Requirements
- [TAS-050]

## 1. Initial Test Written
- [ ] Create `tests/test_doc_checksum_validator.py` with tests:
  - test_checksum_changes_when_file_mutated:
    - Write a sample markdown file to tmp_path, compute checksum via `compute_sha256(path)`, mutate the file, recompute and assert checksums differ.
  - test_validator_accepts_valid_markdown_and_mermaid:
    - Create a small markdown file containing a mermaid fence with `graph TD; A-->B;` and assert `DocumentValidator.validate_markdown(path)` returns `(True, [])` (valid, no errors).
  - test_validator_rejects_missing_mermaid_closure:
    - Create malformed mermaid fence and assert validator returns `(False, [<error message>])`.

## 2. Task Implementation
- [ ] Implement `src/utils/doc_utils.py` with two functions/classes:
  - compute_sha256(file_path: str) -> str:
    - Read the file in binary mode and return the hex digest of SHA-256.
  - DocumentValidator.validate_markdown(file_path: str) -> Tuple[bool, List[str]]:
    - Perform lightweight validations:
      - Ensure file is non-empty.
      - Ensure balanced fenced code blocks for ```mermaid fences (count of ```mermaid opening vs closing).
      - Ensure at least one mermaid block contains a known mermaid keyword: `graph`, `sequenceDiagram`, `erDiagram`, or `classDiagram`.
    - Return a tuple (is_valid, list_of_error_messages).
  - Keep implementations dependency-free (use stdlib only) so tests run in CI without extra installs.

## 3. Code Review
- [ ] Verify correct binary reads for checksum, no use of insecure hash functions, and that validator returns machine-readable error messages suitable for agent consumption.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_doc_checksum_validator.py -q` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `docs/tools/document_tools.md` documenting the checksum format (sha256 hex), validator return schema, and example CLI usage for verifying a document file.

## 6. Automated Verification
- [ ] Add `tools/verify_document_integrity.py` that iterates over `docs/` and `docs/blueprints/` and prints any files where the saved checksum (if present as YAML frontmatter `checksum:`) does not match `compute_sha256` output; exit non-zero if mismatches are found.
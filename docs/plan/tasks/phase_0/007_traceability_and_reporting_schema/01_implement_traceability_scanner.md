# Task: Implement Traceability Annotation Scanner (Sub-Epic: 007_Traceability and Reporting Schema)

## Covered Requirements
- [2_TAS-REQ-080]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Coverage Infrastructure (consumer)]

## 1. Initial Test Written
- [ ] Create `tests/test_traceability_scanner.py` with the following test cases:
  - **test_detects_comment_annotation**: Create a temp `.rs` file containing `// Covers: 1_PRD-REQ-001` above a `#[test] fn ...`. Assert the scanner returns `[("1_PRD-REQ-001", "test_name", "file.rs", line_number)]`.
  - **test_detects_doc_attribute_annotation**: Create a temp `.rs` file containing `#[doc = "Covers: 1_PRD-REQ-002"]` on a test function. Assert it is detected identically.
  - **test_multiple_annotations_single_file**: A file with 3 different `// Covers:` lines. Assert all 3 are returned.
  - **test_multiple_ids_single_annotation**: `// Covers: 1_PRD-REQ-001, 1_PRD-REQ-002` on one line. Assert both IDs extracted.
  - **test_ignores_non_covers_mentions**: A file containing `// This relates to 1_PRD-REQ-099` (no "Covers:" prefix). Assert it is NOT detected.
  - **test_walks_src_and_tests_dirs**: Create a temp project tree with `src/lib.rs` and `tests/integration.rs` both containing annotations. Assert both are found.
  - **test_returns_empty_for_no_annotations**: A `.rs` file with no annotations returns an empty list.
  - **test_handles_whitespace_variations**: `//  Covers:  1_PRD-REQ-001` (extra spaces) is still detected.

## 2. Task Implementation
- [ ] Create `.tools/traceability_scanner.py` as a standalone Python module.
- [ ] Implement a `scan_annotations(root_dir: str) -> list[dict]` function:
  - Walk all `.rs` files under `root_dir/src/` and `root_dir/tests/` and any workspace member crate directories.
  - For each file, scan lines matching regex: `(?://\s*Covers:\s*|#\[doc\s*=\s*"Covers:\s*)([^"}\]]+)`.
  - Split matched group on `,` to handle multiple IDs per annotation.
  - Strip whitespace from each ID. Validate format matches `\d+_[A-Z]+-REQ-\d+`.
  - Return list of dicts: `{"req_id": str, "file": str, "line": int, "test_fn": str|None}`.
  - To find `test_fn`: scan backwards from annotation line for `fn ` pattern within 5 lines.
- [ ] Add a `if __name__ == "__main__"` block that accepts a root directory argument and prints JSON to stdout.

## 3. Code Review
- [ ] Regex must NOT match requirement IDs appearing in regular comments without the `Covers:` prefix.
- [ ] File walking must respect workspace member directories listed in root `Cargo.toml` `[workspace] members`.
- [ ] No external dependencies beyond Python 3.8+ stdlib.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 -m pytest tests/test_traceability_scanner.py -v` and confirm all 8 tests pass.

## 5. Update Documentation
- [ ] Add a docstring to `scan_annotations` documenting the two supported annotation formats and return schema.

## 6. Automated Verification
- [ ] Run `python3 .tools/traceability_scanner.py .` from repo root and verify JSON output is valid (pipe through `python3 -m json.tool`).

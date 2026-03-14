# Task: Authoritative Requirement Tag Extraction from PRD (Sub-Epic: 038_Detailed Domain Specifications (Part 3))

## Covered Requirements
- [1_PRD-KPI-BR-013]

## Dependencies
- depends_on: []
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a unit test in `.tools/tests/test_traceability_scanner.py` that:
    - Mocks a PRD markdown file with several `1_PRD-REQ-NNN` tags in various contexts (headers, list items, narrative text).
    - Verifies that the scanner's extraction logic correctly identifies all tags and ignores malformed ones.
    - Ensures no tags are hardcoded in the scanner itself.

## 2. Task Implementation
- [ ] Implement a parser in `.tools/verify_requirements.py` (or a dedicated module) that reads `docs/plan/specs/1_prd.md`.
- [ ] Use a robust regex to find all occurrences of the pattern `1_PRD-REQ-\d+`.
- [ ] Ensure the parser handles the entire file and deduplicates the found tags.
- [ ] Expose this authoritative list for use by the coverage check and the stale reference check.

## 3. Code Review
- [ ] Verify the regex is not too greedy and correctly handles boundaries (e.g., doesn't match `1_PRD-REQ-0012` if only `1_PRD-REQ-001` is valid, though usually they are fixed length or delimited).
- [ ] Ensure the path to the PRD is configurable or correctly resolved relative to the repo root.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 -m pytest .tools/tests/test_traceability_scanner.py`.

## 5. Update Documentation
- [ ] Update `.tools/README.md` to explain how requirements are discovered from the PRD source.

## 6. Automated Verification
- [ ] Run the scanner against the actual `docs/plan/specs/1_prd.md` and verify it prints the correct count of discovered requirements.

# Task: Implement Markdown and PRD Parsers (Sub-Epic: 01_Distiller_Core_Extraction)

## Covered Requirements
- [9_ROADMAP-TAS-501]

## 1. Initial Test Written
- [ ] Add tests/distiller/test_markdown_prd_parsers.py with the following exact tests:
  - test_parse_markdown_extracts_reqids()
  - test_parse_prd_extracts_reqids()
  - test_parser_records_provenance_line_numbers()
- [ ] Provide fixtures tests/fixtures/sample_prd.md and tests/fixtures/sample_markdown.md that include representative REQ-ID formats including "1_PRD-REQ-PLAN-001" and "TAS-051" on separate lines with surrounding description.
- [ ] Tests must assert:
  - parser.parse(content, filename) returns a list of Requirement objects
  - each Requirement.id matches the textual ID found in the fixture
  - provenance.source_doc equals the passed filename
  - provenance.line_start equals the line number where the ID appears (1-indexed)
- [ ] Run: pytest -q tests/distiller/test_markdown_prd_parsers.py and confirm failures before implementation.

## 2. Task Implementation
- [ ] Implement src/distiller/parsers/markdown_parser.py:
  - Function: parse_markdown_requirements(content: str, filename: Optional[str] = None) -> List[Requirement]
  - Regex for ID extraction MUST be robust to both "TAS-051" and long IDs like "1_PRD-REQ-PLAN-001". Suggested regex: r"\b[0-9A-Za-z_]+(?:-[0-9A-Za-z_]+)+\b" compiled once at module level.
  - Record surrounding context: capture the line text and line numbers where matches occur and return Requirement objects with raw_text set to the matched line.
- [ ] Implement src/distiller/parsers/prd_parser.py which reuses the same regex but handles any PRD-specific header/footer noise.
- [ ] Ensure both parsers return objects typed as distiller.models.Requirement.

## 3. Code Review
- [ ] Verify regex is compiled once, documented, and unit tested for edge cases (IDs with underscores, multiple hyphens).
- [ ] Ensure parsers do not perform normalization/deduplication here (separation of concerns).

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/distiller/test_markdown_prd_parsers.py and verify all tests pass.

## 5. Update Documentation
- [ ] Document parser behavior and the exact regex used in docs/distiller.md, include example input and the expected Requirement object produced.

## 6. Automated Verification
- [ ] After tests pass, run an end-to-end quick check: python -c "from distiller.parsers.markdown_parser import parse_markdown_requirements; print(parse_markdown_requirements(open('tests/fixtures/sample_markdown.md').read(), 'tests/fixtures/sample_markdown.md'))" and confirm at least two Requirement objects are printed for the fixture.

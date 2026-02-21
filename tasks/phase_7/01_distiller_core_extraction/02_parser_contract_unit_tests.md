# Task: Create Parser Contract Unit Tests and Mock Fixtures (Sub-Epic: 01_Distiller_Core_Extraction)

## Covered Requirements
- [9_ROADMAP-TAS-501], [1_PRD-REQ-PLAN-001]

## 1. Initial Test Written
- [ ] Create tests/distiller/test_parser_contract.py with pytest and the exact tests:
  - test_parser_interface_exists()
  - test_parser_returns_requirement_objects()
  - test_parser_extracts_known_ids_from_fixture()
  - test_parser_preserves_provenance()
- [ ] Add fixtures under tests/fixtures/: sample_prd.md and sample_tas.md containing example lines with "1_PRD-REQ-PLAN-001" and "TAS-051" respectively. Use short 10-line documents with the requirement IDs on distinct lines to assert line numbers.
- [ ] Tests must import ParserInterface from distiller.interfaces and assert any parser implementation (a stub) conforms to the contract: parse(source: str, filename: Optional[str]) -> List[Requirement].
- [ ] Run tests initially to confirm they fail: pytest -q tests/distiller/test_parser_contract.py

## 2. Task Implementation
- [ ] Implement a minimal parser stub at src/distiller/parsers/stub_parser.py that implements ParserInterface and returns parsed Requirement objects from fixtures to make tests pass.
- [ ] Ensure the stub uses the Requirement model from distiller.models for return types.

## 3. Code Review
- [ ] Confirm tests assert types not concrete classes (i.e., duck-type against ParserInterface) and that fixtures are small and deterministic.
- [ ] Ensure test names and file paths follow repository conventions.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/distiller/test_parser_contract.py and verify passing.

## 5. Update Documentation
- [ ] Add test fixture descriptions to docs/distiller.md under a "Testing" subsection describing the fixture files and how tests emulate real PRD/TAS documents.

## 6. Automated Verification
- [ ] Execute pytest and then run a short script to instantiate stub_parser.parse(open(fixtures).read()) and assert list length matches expected fixture counts.

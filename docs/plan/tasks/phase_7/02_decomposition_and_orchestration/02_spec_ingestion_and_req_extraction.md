# Task: Spec Ingestion and Requirement Extraction (Sub-Epic: 02_Decomposition_And_Orchestration)

## Covered Requirements
- [2_TAS-REQ-003]

## 1. Initial Test Written
- [ ] Create tests at `tests/unit/test_spec_ingest.py` that fail initially:
  - [ ] Provide `tests/fixtures/sample_prd.md` and `tests/fixtures/sample_tas.md` containing representative sections and embedded REQ IDs.
  - [ ] Write `test_extracts_req_ids_and_text()` which imports `src/distiller/spec_ingest.parse_documents` and asserts the output is a list of requirement objects: `{ "req_id": "1_PRD-REQ-PLAN-002", "source_file": "tests/fixtures/sample_prd.md", "text": "...", "start_line": N, "end_line": M }`.
  - [ ] Write `test_normalizes_whitespace_and_markup()` to assert markdown is normalized and markup stripped where appropriate for downstream processing.
  - [ ] Write `test_handles_multiple_formats()` to feed both Markdown and plain text fixtures and verify consistent extraction.

## 2. Task Implementation
- [ ] Implement `src/distiller/spec_ingest.py` exposing `parse_documents(paths: List[Path]) -> List[Dict]`:
  - [ ] Use a deterministic Markdown parser (e.g., Python-markdown or markdown-it) to traverse headings and paragraphs.
  - [ ] Identify REQ-IDs using a strict regex: `r"\b[0-9A-Z_]+-REQ-[A-Z0-9-]+\b"` and normalize IDs to canonical form.
  - [ ] For each detected REQ-ID block, produce a requirement object containing: `req_id`, `source_file`, `text` (cleaned), `metadata` (heading path, anchors), `start_line`, `end_line`.
  - [ ] Expose a small CLI `scripts/extract_reqs.py --input specs/ --output extracted_reqs.json` to produce a JSON file of extracted requirements.

## 3. Code Review
- [ ] Ensure the parser is deterministic and unit-testable with fixtures; avoid fuzzy heuristics that may hallucinate requirements.
- [ ] Validate strict unit test coverage for edge cases (IDs embedded inside lists, tables, or code blocks should be handled appropriately).

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/unit/test_spec_ingest.py` and ensure tests pass.

## 5. Update Documentation
- [ ] Add `docs/spec_ingest.md` describing the extraction rules, the regex for REQ-IDs, JSON output schema, and usage examples for `scripts/extract_reqs.py`.

## 6. Automated Verification
- [ ] Add `tests/scripts/verify_spec_ingest.sh` that runs the extractor against `specs/` and compares `extracted_reqs.json` to a golden `tests/fixtures/extracted_reqs_golden.json` using a deterministic diff (order-insensitive for arrays keyed by `req_id`).

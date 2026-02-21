# Task: Implement DocumentValidator (Markdown + Mermaid) (Sub-Epic: 02_Architecture-Driven Development Setup)

## Covered Requirements
- [1_PRD-REQ-PIL-002], [3_MCP-REQ-GOAL-002]

## 1. Initial Test Written
- [ ] Create unit tests at `tests/phase_6/test_document_validator.py` (pytest):
  - `test_markdown_lint_prd_tas()` loads the PRD and TAS files discovered by `blueprint.locator` and asserts `DocumentValidator.validate_markdown(path)` returns no blocking lint errors (empty list or status OK).
  - `test_mermaid_blocks_valid()` extracts all fenced code blocks with language `mermaid` and asserts `DocumentValidator.validate_mermaid(block_text)` returns no syntax errors for each block. If a full mermaid CLI is not available, assert the blocks start with one of the known mermaid chart types (`graph`, `sequenceDiagram`, `erDiagram`, `classDiagram`).
  - Tests should write any validator output to `build/validation/document_validator.json` for later inspection.

## 2. Task Implementation
- [ ] Implement `src/blueprint/document_validator.py` with the following functions:
  - `def validate_markdown(path: pathlib.Path) -> dict` — run a markdown linter (use the repo's linter if available; otherwise use a small Python-based check) and return a structured dict {"ok": bool, "errors": [...]}.
  - `def extract_mermaid_blocks(path: pathlib.Path) -> List[str]` — return raw mermaid block strings.
  - `def validate_mermaid(block_text: str) -> dict` — validate mermaid block using an external CLI (`mmdc` / `npx @mermaid-js/mermaid-cli`) if available; fall back to a lightweight syntax sanity check (see tests).
  - The validator must be deterministic, have no network calls, and write structured JSON output to `build/validation/document_validator.json`.

## 3. Code Review
- [ ] Verify:
  - External tool usage is optional and gracefully degrades to pure-Python checks.
  - Validation returns machine-readable JSON with `ok` and `errors` keys.
  - Performance: document files are streamed (not loaded entirely into memory if very large).

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/phase_6/test_document_validator.py` and ensure the created `build/validation/document_validator.json` shows `ok: true` for both PRD and TAS in the happy path.

## 5. Update Documentation
- [ ] Update `docs/architecture_add.md` with a subsection "Document Validation" describing the validator, where outputs are written, and how to invoke the optional external mermaid CLI.

## 6. Automated Verification
- [ ] CI check: `pytest -q tests/phase_6/test_document_validator.py && jq . build/validation/document_validator.json | grep -q '"ok": true'` (fail if grep non-zero).
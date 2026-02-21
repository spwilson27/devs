# Task: Update Documentation and Agent Memory for ADD (Sub-Epic: 02_Architecture-Driven Development Setup)

## Covered Requirements
- [1_PRD-REQ-PIL-002], [3_MCP-REQ-GOAL-002]

## 1. Initial Test Written
- [ ] Create `tests/phase_6/test_docs_and_memory.md` (note: this is a verification test, not a unit test) or a lightweight `tests/phase_6/test_docs_updated.py` that asserts `docs/architecture_add.md` exists and contains the keys/sections: "Blueprint Locator", "Document Validation", "Document Integrity & Checksums", "Approval Tokens & Persistence", "Blueprint Gate (Gate 1)", and "MCP Blueprint API".

## 2. Task Implementation
- [ ] Update or create `docs/architecture_add.md` with authoritative, unambiguous sections matching the items above. Use mermaid where appropriate for process diagrams (e.g., approval flow) and ensure the document is machine-lintable.
  - Add a short example `curl`/HTTP snippet showing how an agent queries `/mcp/blueprint-status`.
  - Add a short snippet showing how to compute and store checksums and how to create an approval token.

## 3. Code Review
- [ ] Verify docs:
  - Follow the docs directory layout requirement and Markdown lint.
  - Ensure mermaid blocks are valid and renderable.
  - Ensure examples are copy-paste runnable (or explicitly marked as pseudo-code).

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/phase_6/test_docs_updated.py` (or run a script that validates presence of required sections) and confirm green.

## 5. Update Documentation
- [ ] This task is itself documentation: ensure the new `docs/architecture_add.md` is committed and referenced from `README.md` or `docs/index.md` so agents and maintainers can find it.

## 6. Automated Verification
- [ ] CI: `pytest -q tests/phase_6/test_docs_updated.py && markdownlint docs/architecture_add.md` (if `markdownlint` unavailable, run `grep -E` checks for required sections).
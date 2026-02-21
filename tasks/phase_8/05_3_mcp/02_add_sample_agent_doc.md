# Task: Add sample .agent.md template to core modules (Sub-Epic: 05_3_MCP)

## Covered Requirements
- [3_MCP-MCP-001]

## 1. Initial Test Written
- [ ] Create `tests/tasks/test_agent_doc_template.py` using pytest. The test should:
  - Use `tmp_path` to create a temporary module directory, e.g. `tmp_path / "src" / "core"`.
  - Call `generate_agent_doc_template(module_path: Path)` and assert the file `<module>/.agent.md` exists.
  - Parse the file and assert it contains YAML frontmatter keys: `name`, `intent`, `introspection_points` (list), and `hooks` (list).
  - Assert the template contains example introspection point identifiers: `state_snapshot`, `capture_trace`, `run_tests`.

## 2. Task Implementation
- [ ] Implement `generate_agent_doc_template(module_path: Path)` in `mcp/tools/agent_docs.py`:
  - Create parent directory `<module>/.agent` if missing and write `template.agent.md` with YAML frontmatter plus a short markdown body explaining fields.
  - Ensure the template is machine-parseable (YAML frontmatter) so agents can append structured metadata.

## 3. Code Review
- [ ] Verify:
  - Template uses YAML frontmatter followed by a minimal human-readable description.
  - The file is intentionally small (< 2KB) and contains placeholders that instruct agents how to append `introspection_points`.
  - File creation uses safe path resolution and avoids overwriting an existing `.agent.md` unless `force=True` is explicitly passed.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest tests/tasks/test_agent_doc_template.py -q` and confirm the test creates and parses the template.

## 5. Update Documentation
- [ ] Add `docs/mcp/agent-doc-template.md` showing the canonical template and quick instructions for maintainers.

## 6. Automated Verification
- [ ] Include a small parser in the test that loads the YAML frontmatter and asserts the required keys are present.
# Task: Implement UIUXAgent that generates the UI/UX Design System document (Sub-Epic: 05_Security and UX Document Generation)

## Covered Requirements
- [9_ROADMAP-TAS-403], [1_PRD-REQ-DOC-004]

## 1. Initial Test Written
- [ ] Create a test at `tests/agents/test_uiux_agent.py` named `test_uiux_agent_generates_valid_design_system` that:
  - Mocks the LLM/agent interface so no external calls are performed.
  - Instantiates `agents.uiux_agent.UIUXAgent` with the mocked LLM and a tmp_path output directory.
  - Calls `agent.generate(project_brief)` using `tests/fixtures/sample_brief.json` and asserts the returned result contains `{'path': 'docs/uiux_design_system.md', 'schema_valid': True}`.
  - Loads the generated file and validates frontmatter against `specs/uiux_design_system.schema.json` and asserts the presence of at least one `mermaid` fenced block in the body.

## 2. Task Implementation
- [ ] Implement `agents/uiux_agent.py` with a class `UIUXAgent` that:
  - Accepts an injectable LLM client and a schema path in `__init__`.
  - Exposes `generate(self, project_brief: dict, out_dir: Path = Path('docs')) -> dict` that:
    - Uses `specs/prompts/uiux_design_system_prompt.txt` (create this under specs/prompts) to instruct the LLM to output Markdown with YAML frontmatter matching `specs/uiux_design_system.schema.json`.
    - Writes output to `out_dir / 'uiux_design_system.md'` using atomic write semantics.
    - Validates frontmatter against the schema and returns `{'path': str(out_path), 'schema_valid': True}`.
  - Ensures any mermaid diagrams are emitted in fenced code blocks labeled `mermaid` and that the code block content matches the `diagrams` objects in the schema.

## 3. Code Review
- [ ] During review ensure:
  - The agent uses dependency injection for LLM and filesystem operations for testability.
  - Prompts live in `specs/prompts` and are immutable resources; they only describe required schema fields and example mermaid blocks.
  - The agent validates output and provides clear error messages for invalid schema or missing mermaid blocks.
  - Type annotations and docstrings exist and logging includes generation timing and output path.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/agents/test_uiux_agent.py` after installing dev deps: `pip install pytest pytest-mock jsonschema pyyaml --quiet`.

## 5. Update Documentation
- [ ] Register `UIUXAgent` in `specs/agents.md` with usage examples and point to `specs/uiux_design_system.schema.json` and `specs/prompts/uiux_design_system_prompt.txt`.

## 6. Automated Verification
- [ ] CI smoke script should execute the UIUXAgent with the sample brief and then execute the schema validation command from Task 03 to confirm validity and mermaid presence. The pipeline should record the generated file checksum and fail on mismatch.

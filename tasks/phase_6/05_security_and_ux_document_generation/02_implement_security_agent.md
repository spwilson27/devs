# Task: Implement SecuritySpecAgent that generates the mandatory security spec (Sub-Epic: 05_Security and UX Document Generation)

## Covered Requirements
- [9_ROADMAP-TAS-403], [1_PRD-REQ-DOC-005], [9_ROADMAP-REQ-DOC-003]

## 1. Initial Test Written
- [ ] Create a unit test at `tests/agents/test_security_agent.py` named `test_security_agent_generates_valid_spec` that:
  - Mocks the LLM/agent interface so no network or real LLM is invoked (use pytest-mock or unittest.mock.patch to replace the LLM client with a deterministic stub returning a prepared markdown body and frontmatter).
  - Instantiates `agents.security_agent.SecuritySpecAgent` with a mock LLM and a temporary output directory (use tmp_path fixture).
  - Calls `agent.generate(project_brief)` where `project_brief` is a small dict fixture (tests/fixtures/sample_brief.json) and asserts the agent returns a dict containing `{"path": "docs/5_security_design.md", "schema_valid": True}`.
  - The test must also open the written file and validate it against `specs/security_spec.schema.json` using jsonschema.validate to ensure the agent's output conforms to the canonical schema created in Task 01.

## 2. Task Implementation
- [ ] Implement `agents/security_agent.py` with a class `SecuritySpecAgent` implementing at minimum:
  - `__init__(self, llm_client, schema_path='specs/security_spec.schema.json')` accepting an injectable LLM client for easy mocking.
  - `generate(self, project_brief: dict, out_dir: Path = Path('docs')) -> dict` which:
    - Calls the LLM client with a deterministic prompt template (store the prompt template under `specs/prompts/security_spec_prompt.txt`).
    - Receives Markdown with YAML frontmatter from the LLM client (or generates it via deterministic templating for offline runs).
    - Writes the generated markdown to `out_dir / '5_security_design.md'` safely (write to a temp file then atomically rename).
    - Validates the YAML frontmatter against `specs/security_spec.schema.json` using jsonschema; if invalid, raise a ValidationError.
    - Returns a dict with at least `{'path': str(out_path), 'schema_valid': True}` on success.
  - Add a small helper `parse_frontmatter(markdown_text) -> dict` internal function.
- [ ] Create `specs/prompts/security_spec_prompt.txt` that enumerates required schema keys and instructs the LLM to output Markdown with YAML frontmatter strictly matching the schema.

## 3. Code Review
- [ ] Verify the implementation:
  - Has dependency injection for LLM client and filesystem (Path), enabling unit tests to mock behavior.
  - Validates strictly against JSON Schema and fails fast with clear error messages including schema path and validation errors.
  - Uses atomic writes (write temp -> fsync -> rename) to avoid partial files.
  - Includes docstrings, type annotations, and logging at INFO level for generation steps.
  - No plaintext credentials or secrets are embedded in prompts or code.

## 4. Run Automated Tests to Verify
- [ ] Install test deps if needed: `pip install pytest pytest-mock jsonschema pyyaml --quiet`
- [ ] Run `pytest -q tests/agents/test_security_agent.py` and ensure the mocked agent test passes and the generated file validates against the schema.

## 5. Update Documentation
- [ ] Update `specs/agents.md` (or create it if missing) to register `SecuritySpecAgent` with description, API surface (`generate`), expected outputs, and the prompt template file path `specs/prompts/security_spec_prompt.txt`.
- [ ] Add example usage in `docs/README.md`: how to run the agent locally with a sample brief and how to validate the output.

## 6. Automated Verification
- [ ] Add an automated smoke test script entry `scripts/ci_generate_security_spec.sh` (script content as a one-liner is fine) that runs the agent against `tests/fixtures/sample_brief.json`, validates the output against `specs/security_spec.schema.json`, and prints the SHA256 checksum of the generated file; CI will call this script as a final automated verification step.

# Task: Create machine-readable UI/UX Design System schema and canonical template (Sub-Epic: 05_Security and UX Document Generation)

## Covered Requirements
- [1_PRD-REQ-DOC-004], [9_ROADMAP-TAS-403]

## 1. Initial Test Written
- [ ] Create a test at `tests/spec/test_uiux_schema.py` named `test_uiux_design_system_conforms_to_schema` that:
  - Loads the UI/UX JSON Schema from `specs/uiux_design_system.schema.json`.
  - Loads the candidate doc `docs/uiux_design_system.md` and parses YAML frontmatter and the Markdown body.
  - Validates the frontmatter+metadata against the JSON Schema using `jsonschema` and asserts no ValidationError for `tests/fixtures/uiux_example_valid.md` and that `tests/fixtures/uiux_example_invalid.md` fails validation with expected error paths.
  - Additionally assert the Markdown body contains at least one fenced mermaid code block labeled `mermaid` and that the `mermaid` block contains the token `erDiagram` or `sequenceDiagram` as required by the schema's `diagrams` array expectations.

## 2. Task Implementation
- [ ] Implement `specs/uiux_design_system.schema.json` with required fields:
  - `title` (string)
  - `version` (string)
  - `design_tokens` (object) containing `colors`, `spacing`, `typography` sub-objects; color tokens should be hex strings.
  - `components` (array) where each item includes `name`, `purpose`, `props` (array of prop definitions), `accessibility_considerations`.
  - `patterns` (array of pattern names)
  - `diagrams` (array) each element must be an object `{"type": "erDiagram"|"sequenceDiagram"|"flowChart", "code_sample": string}`
- [ ] Create `docs/uiux_design_system.md` with YAML frontmatter matching the schema and a canonical Markdown body including a sample `erDiagram` mermaid block demonstrating data relationships for the UI (simple example to illustrate structure).
- [ ] Add fixtures `tests/fixtures/uiux_example_valid.md` and `tests/fixtures/uiux_example_invalid.md` to drive the tests.

## 3. Code Review
- [ ] Reviewers should ensure:
  - The schema enforces accessible defaults (e.g., recommended contrast tokens documented) but allows project overrides.
  - Mermaid blocks are present and clearly labeled; diagrams are documented so the UI agent knows expected diagram types.
  - The schema is extensible and versioned similarly to the security schema.

## 4. Run Automated Tests to Verify
- [ ] Install deps: `pip install pytest jsonschema pyyaml --quiet`.
- [ ] Run `pytest -q tests/spec/test_uiux_schema.py` to verify both valid and invalid fixtures behave as expected.

## 5. Update Documentation
- [ ] Add a section to `docs/README.md` titled "UI/UX Design System (machine-readable)" documenting `specs/uiux_design_system.schema.json`, sample usage for the UI agent, and how mermaid diagrams should be embedded.

## 6. Automated Verification
- [ ] Provide a command to programmatically assert mermaid presence and schema validity: `python -c "import yaml,json,re;from jsonschema import validate;md=open('docs/uiux_design_system.md').read();fm=md.split('---',2)[1];d=yaml.safe_load(fm);validate(d,json.load(open('specs/uiux_design_system.schema.json')));assert re.search(r'```\s*mermaid', md)"`.
- [ ] Ensure CI includes this verification to prevent accidental removal of required mermaid blocks or schema fields.

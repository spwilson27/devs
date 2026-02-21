# Task: Define machine-readable Security Specification schema and template (Sub-Epic: 05_Security and UX Document Generation)

## Covered Requirements
- [1_PRD-REQ-DOC-005], [8_RISKS-REQ-025], [9_ROADMAP-REQ-DOC-003]

## 1. Initial Test Written
- [ ] Create a unit test at tests/spec/test_security_schema.py using pytest named `test_security_spec_conforms_to_schema` that does the following exactly:
  - Load the JSON Schema from specs/security_spec.schema.json.
  - Load the candidate security document from docs/5_security_design.md. Parse optional YAML frontmatter (---) and the Markdown body; the test must validate the frontmatter+body metadata object against the JSON Schema using the `jsonschema` Python package (jsonschema.validate()).
  - Assert that valid example fixture `tests/fixtures/security_example_valid.md` passes validation with no exceptions.
  - Assert that an invalid example `tests/fixtures/security_example_invalid.md` raises jsonschema.ValidationError and that the error path matches a missing required field.
  - The test must be deterministic and must not call any external network or LLM; it should only operate on local files and the schema.

## 2. Task Implementation
- [ ] Implement the machine-readable JSON Schema at `specs/security_spec.schema.json` and a canonical Markdown template at `docs/5_security_design.md` with YAML frontmatter. Required schema fields (must be enforced):
  - `title` (string)
  - `version` (string, semver)
  - `last_reviewed` (string, date ISO8601)
  - `author` (string)
  - `threat_model` (array of objects) where each object has `id` (string), `description` (string), `severity` (enum: low/medium/high/critical), `mitigations` (array of strings)
  - `mitigations_overview` (string)
  - `responsible_team` (string)
  - `status` (enum: draft/reviewed/approved)

  Implementation steps:
  - Create `specs/security_spec.schema.json` using JSON Schema draft-07 (include `$schema` and clear `description` fields for each property).
  - Create `docs/5_security_design.md` with YAML frontmatter matching the schema keys and include a Markdown body with sections: Overview, Threat Model (rendering expected entries), Mitigation Strategy, Acceptance Criteria.
  - Add two fixtures under `tests/fixtures/`: `security_example_valid.md` (valid frontmatter + body) and `security_example_invalid.md` (missing `threat_model` or wrong type) to support the tests.

## 3. Code Review
- [ ] During review verify:
  - The schema is precise and uses explicit types, enums, and `required` lists; descriptions present for each field.
  - No secrets or credentials are included in the template or fixtures.
  - The template markdown uses clear section headings and examples for expected content (so agents can be trained to populate fields).
  - JSON Schema is stored under `specs/` and versioned with `"$id"` and `"version"` keys for future migrations.

## 4. Run Automated Tests to Verify
- [ ] Install runtime deps for tests (if Python): `pip install pytest jsonschema pyyaml --upgrade --quiet` or add to `requirements-dev.txt`.
- [ ] Run `pytest -q tests/spec/test_security_schema.py` and ensure both the valid fixture passes and the invalid fixture fails as asserted in the tests.

## 5. Update Documentation
- [ ] Add a short section in `docs/README.md` (append) called "Security Spec: machine-readable schema" that links to `specs/security_spec.schema.json` and `docs/5_security_design.md` and documents the required fields and where agent output should be written.
- [ ] Update the agent memory/manifest (if a manifest file is used, e.g., `specs/agents_manifest.json`) to reference the new `specs/security_spec.schema.json` and `docs/5_security_design.md` paths.

## 6. Automated Verification
- [ ] Provide a one-line verification script (not required to commit now, but the test should run it) example command to validate the markdown file against the schema: `python -c "import yaml,json,sys;from jsonschema import validate;d=yaml.safe_load(open('docs/5_security_design.md').read().split('---',2)[1]);validate(d, json.load(open('specs/security_spec.schema.json')));print('OK')"`.
- [ ] The CI job should fail if the verification command exits non-zero, ensuring the mandatory security spec requirement (`8_RISKS-REQ-025`) is enforced automatically.

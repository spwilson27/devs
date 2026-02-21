# Task: Implement machine-readable document schema and validator (Sub-Epic: 04_MCP and System Structure Documents)

## Covered Requirements
- [1_PRD-REQ-DOC-011]

## 1. Initial Test Written
- [ ] Add a pytest at `tests/test_document_schema.py` that loads `docs/schemas/document.schema.json` and validates a JSON example document (`docs/schemas/examples/mcp_example.json`) using the `jsonschema` Python package. The test must fail before the schema and example exist.

Example test body:

```python
import subprocess
import json
from pathlib import Path
from jsonschema import validate, ValidationError


def repo_root():
    return Path(subprocess.check_output(["git","rev-parse","--show-toplevel"]).decode().strip())


def test_document_schema_validates_example():
    root = repo_root()
    schema_path = root / 'docs' / 'schemas' / 'document.schema.json'
    example_path = root / 'docs' / 'schemas' / 'examples' / 'mcp_example.json'
    assert schema_path.exists(), 'Schema file missing'
    assert example_path.exists(), 'Example document missing'
    schema = json.loads(schema_path.read_text())
    example = json.loads(example_path.read_text())
    validate(instance=example, schema=schema)
```

- The test must be runnable with `pytest -q tests/test_document_schema.py` and fail initially.

## 2. Task Implementation
- [ ] Implement a strict JSON Schema at `docs/schemas/document.schema.json` that models the canonical structure for PRD, TAS, MCP, and similar docs. Minimum schema requirements:
  - Root object with required fields: `title`, `doc_type`, `version`, `sections`.
  - `version` uses semantic versioning (regex pattern `^\d+\.\d+\.\d+$`).
  - `sections` is an array of objects with required keys: `id` (string), `title` (string), `content` (string).
  - Optional `mermaid_blocks`: array of strings.
  - Optional `approvals`: array of objects with required keys: `approver` (string), `status` (enum: `pending|approved|rejected`), `timestamp` (date-time string).
  - `additionalProperties`: false at the root to prevent unvalidated fields.

- Place a small example valid document at `docs/schemas/examples/mcp_example.json` that adheres to the schema (used by the test above).

- Provide a lightweight validator script `scripts/validate_document_schema.py` that:
  - Accepts a markdown file path, extracts YAML front-matter (if present) into JSON, or accepts a JSON file, and validates against `docs/schemas/document.schema.json` using `jsonschema`.
  - Returns exit code 0 when valid; non-zero and prints errors when invalid.

Example minimal schema (author the full JSON Schema in the PR):

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Document Schema",
  "type": "object",
  "required": ["title", "doc_type", "version", "sections"],
  "additionalProperties": false,
  "properties": {
    "title": {"type": "string"},
    "doc_type": {"type": "string"},
    "version": {"type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$"},
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id","title","content"],
        "properties": {
          "id": {"type": "string"},
          "title": {"type": "string"},
          "content": {"type": "string"}
        }
      }
    },
    "mermaid_blocks": {"type": "array", "items": {"type": "string"}},
    "approvals": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["approver","status"],
        "properties": {
          "approver": {"type": "string"},
          "status": {"type": "string", "enum": ["pending","approved","rejected"]},
          "timestamp": {"type": "string", "format": "date-time"}
        }
      }
    }
  }
}
```

## 3. Code Review
- [ ] PR review checklist:
  - Schema uses draft-07 and is as strict as practical (no additionalProperties at root).
  - Example document(s) are minimal but full-featured enough to exercise the schema (sections, mermaid_blocks, approvals).
  - Validator script uses `jsonschema` and produces readable error messages mapping to schema paths.

## 4. Run Automated Tests to Verify
- [ ] Run the test and validator locally:

```bash
pip install jsonschema --quiet
python -m pytest -q tests/test_document_schema.py
python scripts/validate_document_schema.py docs/mcp/generated_spec.md || true
```

- Expected: pytest passes and the validator exits 0 for valid documents.

## 5. Update Documentation
- [ ] Add `docs/schemas/README.md` describing how to author documents that conform to the schema, how to run `scripts/validate_document_schema.py`, and how to include YAML front-matter in generated markdown.

## 6. Automated Verification
- [ ] CI should run the schema validation step for any merged document edits that change `docs/` or `docs/mcp`:

```bash
python scripts/validate_document_schema.py docs/mcp/generated_spec.md
```

- Validation failures should block merges until the document is corrected.

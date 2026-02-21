# Task: Implement API/Interface Contracts -> Mermaid generator (Sub-Epic: 06_Diagram Auto-Generation)

## Covered Requirements
- [1_PRD-REQ-DOC-008], [9_ROADMAP-TAS-402]

## 1. Initial Test Written
- [ ] Create pytest tests at `tests/phase_6/diagram_auto_generation/test_api_contract_generator.py` with a fixture `tests/phase_6/diagram_auto_generation/fixtures/simple_openapi.json` containing a minimal OpenAPI-like dict for a single path.

Example fixture (JSON):
```json
{
  "paths": {
    "/users": {
      "post": {
        "summary": "Create user",
        "requestBody": {"content": {"application/json": {"schema": {"$ref":"#/components/schemas/UserCreate"}}}},
        "responses": {"201": {"description": "Created"}}
      }
    }
  },
  "components": {"schemas": {"UserCreate": {"type":"object","properties":{"name":{"type":"string"}}}}}
}
```

- [ ] Test must import `generate_api_sequence_from_openapi` from `devs.diagram_generator.api` and assert:
  - The returned mermaid string starts with `sequenceDiagram` (or `classDiagram` if you choose class-style contracts but be explicit in documentation).
  - Contains participants (`Client`, `Server`) and a message corresponding to the POST `/users` call (e.g., `Client->>Server: POST /users`).

- Exact test body to place in `tests/phase_6/diagram_auto_generation/test_api_contract_generator.py`:

```python
import json
from pathlib import Path
from devs.diagram_generator.api import generate_api_sequence_from_openapi

def test_generate_api_sequence_from_openapi():
    fixture = Path(__file__).parent / "fixtures" / "simple_openapi.json"
    openapi = json.loads(fixture.read_text())
    mermaid = generate_api_sequence_from_openapi(openapi)
    assert mermaid.strip().startswith("sequenceDiagram")
    assert "POST /users" in mermaid or "Client->>Server" in mermaid
```

- Run: `python -m pytest -q tests/phase_6/diagram_auto_generation/test_api_contract_generator.py`

## 2. Task Implementation
- [ ] Implement `src/devs/diagram_generator/api.py` with function `generate_api_sequence_from_openapi(openapi: dict) -> str` that:
  - Accepts a minimal OpenAPI-like dict (paths, components) and produces a deterministic mermaid `sequenceDiagram` representing request flows for each path+operation.
  - For each operation emit a participant exchange: `Client->>Server: VERB path` and optionally include request/response model names as separate participant boxes or comments.
  - Provide a configuration option to output `classDiagram` for data contract structures instead of sequence diagrams.

## 3. Code Review
- [ ] Verify:
  - Deterministic ordering of paths and operations.
  - Proper handling of path parameters and query params in the message label.
  - Clear docstring explaining supported subset of OpenAPI.

## 4. Run Automated Tests to Verify
- [ ] Command: `python -m pytest -q tests/phase_6/diagram_auto_generation/test_api_contract_generator.py`

## 5. Update Documentation
- [ ] Add examples to `docs/architecture/diagrams.md` showing how an OpenAPI snippet maps to the produced mermaid sequence diagram and how to toggle classDiagram output for contract inspection.

## 6. Automated Verification
- [ ] CI: run unit test and then run a smoke convert to produce `build/diagrams/api_sequence.mmd` and assert it starts with `sequenceDiagram` and contains `POST /users`:

```
python -m pytest -q tests/phase_6/diagram_auto_generation/test_api_contract_generator.py && 
python -c "from devs.diagram_generator.api import generate_api_sequence_from_openapi; import json; print(generate_api_sequence_from_openapi(json.load(open('tests/phase_6/diagram_auto_generation/fixtures/simple_openapi.json'))))" > build/diagrams/api_sequence.mmd && 
head -n 1 build/diagrams/api_sequence.mmd | grep -q '^sequenceDiagram'
```

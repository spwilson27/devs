# Task: Implement ERD Mermaid generator (Sub-Epic: 06_Diagram Auto-Generation)

## Covered Requirements
- [1_PRD-REQ-DOC-007], [9_ROADMAP-TAS-402]

## 1. Initial Test Written
- [ ] Create pytest unit tests at `tests/phase_6/diagram_auto_generation/test_erd_generator.py` and a fixture at `tests/phase_6/diagram_auto_generation/fixtures/simple_schema.json` containing the following JSON exactly:

```json
{
  "entities": [
    {"name":"User", "fields": [{"name":"id","type":"uuid","pk":true}, {"name":"name","type":"string"}]},
    {"name":"Order", "fields": [{"name":"id","type":"uuid","pk":true}, {"name":"user_id","type":"uuid"}]}
  ],
  "relations": [
    {"from":"User","to":"Order","type":"one-to-many","label":"places"}
  ]
}
```

- [ ] The test must import `generate_erd_from_schema` from `devs.diagram_generator.erd` and assert all of the following:
  - The returned string starts with `erDiagram`.
  - Both entity names `User` and `Order` appear in the output.
  - The relation is rendered as: `User ||--o{ Order : places` (or the equivalent mermaid ERD notation you implement).

- Exact test body to place in `tests/phase_6/diagram_auto_generation/test_erd_generator.py`:

```python
import json
from pathlib import Path
from devs.diagram_generator.erd import generate_erd_from_schema

def test_generate_erd_from_simple_schema():
    fixture = Path(__file__).parent / "fixtures" / "simple_schema.json"
    schema = json.loads(fixture.read_text())
    mermaid = generate_erd_from_schema(schema)
    assert mermaid.strip().startswith("erDiagram")
    assert "User" in mermaid and "Order" in mermaid
    assert "User ||--o{ Order : places" in mermaid
```

- Run: `python -m pytest -q tests/phase_6/diagram_auto_generation/test_erd_generator.py`

## 2. Task Implementation
- [ ] Implement `src/devs/diagram_generator/erd.py` with a public function:

```python
from typing import Dict

def generate_erd_from_schema(schema: Dict) -> str:
    """Convert a normalized schema dict to a deterministic mermaid ERD string.

    Requirements:
    - Validate required keys: `entities` (list) and `relations` (list).
    - Escape identifiers to be mermaid-safe.
    - Deterministically order entities and relations (sort by name) to keep diffs stable.
    - Emit `erDiagram` header then entity blocks then relation lines.
    """
    # implementation here
```

- [ ] Implementation details:
  - Entities: render fields as `fieldName type` inside the entity block.
  - Relations: map relation types to mermaid symbols (one-to-one, one-to-many, many-to-many).
  - Raise ValueError for malformed schemas with a helpful message.
  - Include unit tests for edge cases: empty relations, composite PK, invalid schema types.

## 3. Code Review
- [ ] Verify:
  - Deterministic ordering of output.
  - Proper escaping of identifiers and enforcement of mermaid-compatible tokens.
  - Clear error handling with explanatory messages for invalid fixtures.
  - Tests cover positive and negative cases; ensure at least one unit test per code path.

## 4. Run Automated Tests to Verify
- [ ] Command:
  - `python -m pytest -q tests/phase_6/diagram_auto_generation/test_erd_generator.py`
  - Expected: failing before implementation, green after implementation.

## 5. Update Documentation
- [ ] Add an example section in `docs/architecture/diagrams.md` showing the input schema JSON and the exact mermaid output produced by the generator.

## 6. Automated Verification
- [ ] CI step: run the test and then run a smoke generator to write `build/diagrams/erd.mmd` and assert its first line is `erDiagram`:

```
python -m pytest -q tests/phase_6/diagram_auto_generation/test_erd_generator.py && 
python -c "from devs.diagram_generator.erd import generate_erd_from_schema; import json; print(generate_erd_from_schema(json.load(open('tests/phase_6/diagram_auto_generation/fixtures/simple_schema.json'))))" > build/diagrams/erd.mmd && 
head -n 1 build/diagrams/erd.mmd | grep -q '^erDiagram'
```

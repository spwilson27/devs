# Task: Implement Site Map Mermaid generator (Sub-Epic: 06_Diagram Auto-Generation)

## Covered Requirements
- [1_PRD-REQ-DOC-009], [9_ROADMAP-TAS-402]

## 1. Initial Test Written
- [ ] Create pytest tests at `tests/phase_6/diagram_auto_generation/test_sitemap_generator.py` and fixture `tests/phase_6/diagram_auto_generation/fixtures/simple_site.json` with the following content:

```json
{
  "pages": [
    {"id":"home","path":"/","children":["about","docs"]},
    {"id":"about","path":"/about"},
    {"id":"docs","path":"/docs","children":["docs-guide"]},
    {"id":"docs-guide","path":"/docs/guide"}
  ]
}
```

- [ ] Test requirements:
  - Import `generate_sitemap_from_spec` from `devs.diagram_generator.sitemap`.
  - Assert returned string starts with `graph LR` or `graph TD` and contains nodes for `home`, `about`, `docs`, `docs-guide` and edges `home --> about`, `home --> docs`, `docs --> docs-guide`.

- Exact test body to place in `tests/phase_6/diagram_auto_generation/test_sitemap_generator.py`:

```python
import json
from pathlib import Path
from devs.diagram_generator.sitemap import generate_sitemap_from_spec

def test_generate_sitemap_from_simple_spec():
    fixture = Path(__file__).parent / "fixtures" / "simple_site.json"
    spec = json.loads(fixture.read_text())
    mermaid = generate_sitemap_from_spec(spec)
    assert mermaid.strip().startswith("graph")
    assert "home" in mermaid and "docs-guide" in mermaid
    assert "home --> about" in mermaid
    assert "docs --> docs-guide" in mermaid
```

- Run: `python -m pytest -q tests/phase_6/diagram_auto_generation/test_sitemap_generator.py`

## 2. Task Implementation
- [ ] Implement `src/devs/diagram_generator/sitemap.py` with a function `generate_sitemap_from_spec(spec: dict) -> str` that:
  - Accepts a navigation spec with `pages` entries (id, path, children).
  - Produces deterministic mermaid `graph` output (`graph LR` or `graph TD`) with nodes and edges.
  - Escapes node labels for mermaid compatibility and includes the page path as a node subtitle if requested.
  - Supports optional parameters: orientation (`LR`/`TD`) and `show_paths` boolean.

## 3. Code Review
- [ ] Verify:
  - Deterministic ordering of nodes and edges.
  - Proper escaping and sanitization of node ids to valid mermaid identifiers.
  - Unit tests include cases for deep nesting and cycles (cycles should be reported or broken).

## 4. Run Automated Tests to Verify
- [ ] Command:
  - `python -m pytest -q tests/phase_6/diagram_auto_generation/test_sitemap_generator.py`

## 5. Update Documentation
- [ ] Add examples to `docs/architecture/diagrams.md` illustrating the input site spec and produced mermaid `graph` output, including orientation and show_paths examples.

## 6. Automated Verification
- [ ] CI: run the unit test and then a smoke generation to write `build/diagrams/sitemap.mmd`, then assert the file begins with `graph` and contains expected edges:

```
python -m pytest -q tests/phase_6/diagram_auto_generation/test_sitemap_generator.py && 
python -c "from devs.diagram_generator.sitemap import generate_sitemap_from_spec; import json; print(generate_sitemap_from_spec(json.load(open('tests/phase_6/diagram_auto_generation/fixtures/simple_site.json'))))" > build/diagrams/sitemap.mmd && 
head -n 1 build/diagrams/sitemap.mmd | grep -E '^graph'
```

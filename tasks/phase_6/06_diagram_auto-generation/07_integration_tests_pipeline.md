# Task: Integration tests for diagram generation -> rendering pipeline (Sub-Epic: 06_Diagram Auto-Generation)

## Covered Requirements
- [9_ROADMAP-TAS-402], [TAS-031]

## 1. Initial Test Written
- [ ] Create an integration pytest at `tests/phase_6/diagram_auto_generation/test_full_pipeline.py` that performs a full, mocked pipeline run and asserts an SVG is produced.
  - Use fixtures created in earlier tasks (ERD fixture, site fixture, simple_openapi fixture).
  - Monkeypatch `subprocess.run` used by the renderer to avoid requiring `mmdc` during CI; the stub should write a small valid SVG into the expected output path.
  - The test must:
    1. Load the ERD fixture JSON and call the ERD generator to obtain mermaid text.
    2. Call the renderer to produce SVG bytes (mocked) and assert the returned bytes contain `<svg`.
    3. Run the DocumentValidator over the generated markdown/mermaid and assert `ok: True` when validator is monkeypatched to accept valid mermaid.

- Exact test to place in `tests/phase_6/diagram_auto_generation/test_full_pipeline.py`:

```python
import json
from pathlib import Path
from devs.diagram_generator.erd import generate_erd_from_schema
from devs.diagram_generator.renderer import render_mermaid_to_svg
from devs.diagram_generator.validator import DocumentValidator

def fake_run(cmd, check, stdout, stderr, timeout):
    out = Path('build/diagrams/full_pipeline_stub.svg')
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text('<svg><!-- full pipeline stub --></svg>')
    class R: pass
    return R()

def test_full_pipeline(monkeypatch):
    monkeypatch.setattr('subprocess.run', fake_run)
    fixture = Path(__file__).parent / 'fixtures' / 'simple_schema.json'
    schema = json.loads(fixture.read_text())
    mermaid = generate_erd_from_schema(schema)
    svg = render_mermaid_to_svg(mermaid)
    assert b'<svg' in svg
    # validator monkeypatched earlier in its unit tests; here assume it returns ok
    validator = DocumentValidator()
    monkeypatch.setattr('devs.diagram_generator.validator._check_mermaid_syntax', lambda s: (True, []))
    res = validator.validate(mermaid)
    assert res['ok'] is True
```

- Run: `python -m pytest -q tests/phase_6/diagram_auto_generation/test_full_pipeline.py`

## 2. Task Implementation
- [ ] Ensure the generators (ERD, sitemap, api) expose functions that return mermaid text (not only write files) so the pipeline can be composed in memory.
- [ ] Provide a thin CLI shim (optional) `devs diagram generate --type erd --input path --output path` that the integration test can also exercise (mock renderer in the same way).

## 3. Code Review
- [ ] Verify:
  - Pipeline composes in-memory (no implicit file I/O required).
  - Renderer is injectable/mocked for tests.
  - Integration test covers happy-path smoke flow and validates artifacts are produced.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest -q tests/phase_6/diagram_auto_generation/test_full_pipeline.py`

## 5. Update Documentation
- [ ] Add a subsection to `docs/architecture/diagrams.md` titled "Pipeline: generate -> validate -> render" with a sample command-line invocation and CI snippet.

## 6. Automated Verification
- [ ] CI job: run the integration test with renderer mocked, then fail the job if the produced `build/diagrams/full_pipeline_stub.svg` does not contain `<svg` or validator output `ok: true`.

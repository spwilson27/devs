# Task: Integrate Mermaid renderer and produce interactive SVG output (Sub-Epic: 06_Diagram Auto-Generation)

## Covered Requirements
- [TAS-031], [9_ROADMAP-TAS-402]

## 1. Initial Test Written
- [ ] Create pytest tests at `tests/phase_6/diagram_auto_generation/test_mermaid_renderer.py` that verify the renderer interface and command invocation without requiring a real mermaid binary. The test must:
  - Import `render_mermaid_to_svg` from `devs.diagram_generator.renderer`.
  - Use `monkeypatch` to stub `subprocess.run` (or the internal helper) to return a successful completed process and write a small SVG stub to the output path.
  - Assert that `render_mermaid_to_svg("graph LR\na-->b")` returns bytes containing `<svg`.

- Exact test body to place in `tests/phase_6/diagram_auto_generation/test_mermaid_renderer.py`:

```python
from pathlib import Path
from devs.diagram_generator.renderer import render_mermaid_to_svg

def fake_run(cmd, check, stdout, stderr, timeout):
    # Create expected output file path passed as args
    out = Path(cmd[-1]) if isinstance(cmd, (list, tuple)) else Path('build/diagrams/renderer_stub.svg')
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text('<svg><!--stub--></svg>')
    class R: pass
    return R()

def test_render_mermaid_to_svg(monkeypatch):
    monkeypatch.setattr('subprocess.run', fake_run)
    svg_bytes = render_mermaid_to_svg('graph LR\na-->b')
    assert b'<svg' in svg_bytes
```

- Run: `python -m pytest -q tests/phase_6/diagram_auto_generation/test_mermaid_renderer.py`

## 2. Task Implementation
- [ ] Implement `src/devs/diagram_generator/renderer.py` with a function:

```python
from typing import Optional

def render_mermaid_to_svg(mermaid_source: str, output_path: Optional[str] = None, orientation: str = 'LR') -> bytes:
    """Render mermaid source to SVG bytes.

    Implementation notes:
    - Prefer calling the native `mmdc` (mermaid-cli) binary via subprocess if available: `mmdc -i in.mmd -o out.svg`.
    - Use tempfile for input if output_path is None and read back the output bytes.
    - Use subprocess.run with a timeout, no shell, and capture errors.
    - Provide clear errors if `mmdc` is not installed; fall back to a no-op renderer that returns a minimal `<svg>` wrapper when running in an offline CI-mock mode.
    """
```

- [ ] Ensure implementation:
  - Uses `subprocess.run` safely (no shell=True), a reasonable timeout (e.g., 30s), and cleans up temp files.
  - Returns `bytes` containing the rendered SVG.
  - Logs stderr to the test logger when rendering fails.

## 3. Code Review
- [ ] Verify:
  - subprocess usage uses a list of args, timeout, and check=True.
  - No sensitive data is passed to the renderer.
  - Functions are unit-testable by allowing `subprocess.run` to be monkeypatched.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest -q tests/phase_6/diagram_auto_generation/test_mermaid_renderer.py`

## 5. Update Documentation
- [ ] Document installation instructions for `@mermaid-js/mermaid-cli` in `docs/architecture/diagrams.md` and provide a fallback note for CI (how to mock the renderer during unit tests).

## 6. Automated Verification
- [ ] CI steps:
  - Run the unit test.
  - If `mmdc` is available in the environment, run a smoke render: generate a small mermaid file and verify produced `build/diagrams/*.svg` contains `<svg` and a `<g` element.
  - Example smoke command (guarded):

```
if command -v mmdc >/dev/null 2>&1; then
  python -c "from devs.diagram_generator.renderer import render_mermaid_to_svg; print(len(render_mermaid_to_svg('graph LR\na-->b')))" > /dev/null
fi
```

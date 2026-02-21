# Task: Scaffold docs/ directory and baseline artifacts (Sub-Epic: 04_MCP and System Structure Documents)

## Covered Requirements
- [TAS-044]

## 1. Initial Test Written
- [ ] Write a pytest unit test at tests/test_docs_scaffold.py that verifies the repository contains a "docs/" directory with the minimal baseline artifacts. Use git to determine the repository root so the test is robust across CI and local runs. Example test body to place in tests/test_docs_scaffold.py:

```python
import subprocess
from pathlib import Path

def repo_root():
    return Path(subprocess.check_output(["git","rev-parse","--show-toplevel"]).decode().strip())


def test_docs_scaffold_exists():
    root = repo_root()
    docs = root / "docs"
    assert docs.exists() and docs.is_dir(), "Missing docs/ directory"
    expected = ["README.md", "schemas", "mcp", "templates", "system_layout.yml"]
    for name in expected:
        assert (docs / name).exists(), f"Expected {name} inside docs/"
```

- The test must be runnable with `pytest -q tests/test_docs_scaffold.py` and fail initially (red) before implementation.

## 2. Task Implementation
- [ ] Implement the scaffold to make the test pass by creating the following files and directories under `docs/`:
  - docs/README.md (describes purpose and structure of docs/; see sample content below)
  - docs/schemas/ (directory for JSON/YAML schemas)
  - docs/mcp/ (directory for MCP and glass-box architecture specs and templates)
  - docs/templates/ (reusable markdown templates)
  - docs/system_layout.yml (placeholder YAML listing the required repo layout)

- Sample README.md content (exact text may be used):

```
# Project Documentation

This directory contains authoritative architecture and specification artifacts for the project used by ArchitectAgent and other automation.

- schemas/: JSON/YAML machine-readable schemas for document validation.
- mcp/: MCP and Glass-Box Architecture specs and templates.
- templates/: Reusable markdown templates.
- system_layout.yml: machine-readable spec for required repository layout.
```

- Implementation checklist to perform in the PR:
  - Create directories: `docs/schemas`, `docs/mcp`, `docs/templates`.
  - Add docs/README.md with the sample content above.
  - Add an initial `docs/system_layout.yml` with a minimal required_paths list for the repository.

## 3. Code Review
- [ ] Verify the following in PR review:
  - docs/ README contains a short description and links to schemas and mcp/.
  - Directory names are lowercase and hyphenated where applicable.
  - No large binary files are committed to docs/.
  - The `docs/system_layout.yml` is a well-formed YAML file and documents the minimal expected layout.

## 4. Run Automated Tests to Verify
- [ ] Run the test added in section 1 to ensure success:

```bash
pip install -r requirements.txt --quiet || true
python -m pytest -q tests/test_docs_scaffold.py
```

- Expected result: the test should pass (green) after implementing the scaffold files.

## 5. Update Documentation
- [ ] Update the project top-level README.md to include a short line pointing to `docs/` (e.g., "See docs/ for authoritative architecture and spec artifacts.").
- [ ] Add a short entry in the ArchitectAgent memory (if applicable) indicating that doc scaffolding exists at `docs/` and where schemas and MCP templates are located.

## 6. Automated Verification
- [ ] As an automated verification step, run the pytest test and a small shell check to enumerate docs contents:

```bash
python - <<'PY'
from pathlib import Path
import subprocess
root = Path(subprocess.check_output(["git","rev-parse","--show-toplevel"]).decode().strip())
assert (root/"docs").is_dir(), "docs/ missing"
print('docs/ present with entries:', list((root/'docs').iterdir()))
PY
```

- The test and this quick script must both exit 0 to confirm the scaffold is present.

# Task: Define and enforce repository system layout (Sub-Epic: 04_MCP and System Structure Documents)

## Covered Requirements
- [1_PRD-REQ-DOC-006]

## 1. Initial Test Written
- [ ] Write a pytest unit test at `tests/test_system_layout.py` that reads a machine-readable layout spec `docs/system_layout.yml` and asserts every `required_paths` entry exists in the repository. Use git to discover the repository root so the test is deterministic in CI.

Example test (tests/test_system_layout.py):

```python
import subprocess
from pathlib import Path
import yaml


def repo_root():
    return Path(subprocess.check_output(["git","rev-parse","--show-toplevel"]).decode().strip())


def test_layout_matches_spec():
    root = repo_root()
    spec_path = root / 'docs' / 'system_layout.yml'
    assert spec_path.exists(), 'docs/system_layout.yml must exist'
    spec = yaml.safe_load(spec_path.read_text())
    for rel in spec.get('required_paths', []):
        p = root / rel
        assert p.exists(), f'Missing required path: {rel}'
```

- The test must be runnable with `pytest -q tests/test_system_layout.py` and fail before implementation.

## 2. Task Implementation
- [ ] Implement the system layout spec and a validator script:
  - Create `docs/system_layout.yml` with a `required_paths:` top-level key listing the minimum required directories and files (relative to repo root). Example entries:

```yaml
required_paths:
  - src
  - docs
  - docs/schemas
  - docs/mcp
  - scripts
  - tests
  - tasks
  - specs
```

  - Add `scripts/validate_layout.py` which:
    - Reads `docs/system_layout.yml`.
    - Prints human-readable list of missing paths (if any).
    - Exits with non-zero status when any required path is missing and zero when all are present.

- Example validator implementation (to be placed at scripts/validate_layout.py):

```python
#!/usr/bin/env python3
import sys
import subprocess
from pathlib import Path
import yaml


def repo_root():
    return Path(subprocess.check_output(["git","rev-parse","--show-toplevel"]).decode().strip())


def main():
    root = repo_root()
    spec = root / 'docs' / 'system_layout.yml'
    if not spec.exists():
        print('Missing docs/system_layout.yml', file=sys.stderr)
        return 2
    required = yaml.safe_load(spec.read_text()).get('required_paths', [])
    missing = [p for p in required if not (root / p).exists()]
    if missing:
        print('Missing required paths:')
        for m in missing:
            print(' -', m)
        return 3
    print('All required paths present')
    return 0

if __name__ == '__main__':
    sys.exit(main())
```

## 3. Code Review
- [ ] Review checklist for the PR:
  - `docs/system_layout.yml` must be YAML-compliant and documented (comments or README reference).
  - `scripts/validate_layout.py` must use pathlib, return clear messages, and use proper exit codes (>0 for failures).
  - Validator must be idempotent and side-effect free (read-only).
  - Ensure tests do not mutate the repository.

## 4. Run Automated Tests to Verify
- [ ] Run the unit test and the validator script:

```bash
pip install pyyaml --quiet
python -m pytest -q tests/test_system_layout.py
python scripts/validate_layout.py || true
```

- Expected: pytest passes; validator exits 0 when layout is satisfied.

## 5. Update Documentation
- [ ] Document `docs/system_layout.yml` in `docs/README.md` with a short explanation of each required path and the purpose for each directory (e.g., `docs/mcp` stores MCP architecture specs).

## 6. Automated Verification
- [ ] Use the validator as a CI check. Example CI command to run in pipeline:

```bash
python scripts/validate_layout.py
```

- The CI job should fail if the script returns non-zero.

# Task: Traceability Stale File Handling (Sub-Epic: 02_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-AC-5.15]

## Dependencies
- depends_on: [01_traceability_hardening.md]
- shared_components: [Traceability & Coverage Infrastructure, ./do Entrypoint Script]

## 1. Initial Test Written

### Test: Stale Traceability File Detection (3_MCP_DESIGN-REQ-AC-5.15)
- [ ] Create a Python test file `.tools/tests/test_traceability_staleness.py`:

```python
"""
Tests for stale traceability file detection.

Covers: [3_MCP_DESIGN-REQ-AC-5.15]

An agent MUST NOT use a target/traceability.json file that is more than 1 hour old.
It must submit a ./do test workflow run and wait for completion before performing
any implementation work.
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path


def test_stale_traceability_file_detection(tmp_path, monkeypatch):
    """
    Verify that a traceability file older than 1 hour is detected as stale.
    """
    # Setup: Create a target/traceability.json with old timestamp
    target_dir = tmp_path / "target"
    target_dir.mkdir()
    
    old_timestamp = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    traceability_data = {
        "schema_version": 1,
        "generated_at": old_timestamp,
        "overall_passed": True,
        "traceability_pct": 100.0,
        "requirements": []
    }
    
    traceability_file = target_dir / "traceability.json"
    traceability_file.write_text(json.dumps(traceability_data))
    
    # Create a helper script to check staleness
    check_script = tmp_path / "check_stale.py"
    check_script.write_text(f"""
import json
import sys
from datetime import datetime, timezone, timedelta

with open('target/traceability.json') as f:
    data = json.load(f)

generated_at = datetime.fromisoformat(data['generated_at'].replace('Z', '+00:00'))
now = datetime.now(timezone.utc)
age = now - generated_at

if age > timedelta(hours=1):
    print("STALE: traceability.json is older than 1 hour", file=sys.stderr)
    sys.exit(2)  # Special exit code for stale file
else:
    print("OK: traceability.json is fresh")
    sys.exit(0)
""")
    
    # Run the staleness check
    monkeypatch.chdir(tmp_path)
    result = subprocess.run(
        [sys.executable, "check_stale.py"],
        capture_output=True,
        text=True
    )
    
    # Assertions per [3_MCP_DESIGN-REQ-AC-5.15]
    assert result.returncode == 2, f"Expected exit code 2 for stale file, got {result.returncode}"
    assert "STALE" in result.stderr, "stderr should mention staleness"


def test_fresh_traceability_file_not_flagged_as_stale(tmp_path, monkeypatch):
    """
    Verify that a fresh traceability file (< 1 hour old) is NOT flagged as stale.
    """
    # Setup: Create a target/traceability.json with recent timestamp
    target_dir = tmp_path / "target"
    target_dir.mkdir()
    
    fresh_timestamp = datetime.now(timezone.utc).isoformat()
    traceability_data = {
        "schema_version": 1,
        "generated_at": fresh_timestamp,
        "overall_passed": True,
        "traceability_pct": 100.0,
        "requirements": []
    }
    
    traceability_file = target_dir / "traceability.json"
    traceability_file.write_text(json.dumps(traceability_data))
    
    # Create the same check script
    check_script = tmp_path / "check_stale.py"
    check_script.write_text(f"""
import json
import sys
from datetime import datetime, timezone, timedelta

with open('target/traceability.json') as f:
    data = json.load(f)

generated_at = datetime.fromisoformat(data['generated_at'].replace('Z', '+00:00'))
now = datetime.now(timezone.utc)
age = now - generated_at

if age > timedelta(hours=1):
    print("STALE: traceability.json is older than 1 hour", file=sys.stderr)
    sys.exit(2)
else:
    print("OK: traceability.json is fresh")
    sys.exit(0)
""")
    
    # Run the staleness check
    monkeypatch.chdir(tmp_path)
    result = subprocess.run(
        [sys.executable, "check_stale.py"],
        capture_output=True,
        text=True
    )
    
    # Assertions
    assert result.returncode == 0, f"Expected exit code 0 for fresh file, got {result.returncode}"
    assert "OK" in result.stdout, "stdout should indicate file is fresh"


def test_agent_workflow_for_stale_traceability(tmp_path, monkeypatch):
    """
    E2E test: When traceability is stale, agent must run ./do test before work.
    
    This test simulates the agent's decision flow per [3_MCP_DESIGN-REQ-AC-5.15].
    """
    # Setup: Create stale traceability file
    target_dir = tmp_path / "target"
    target_dir.mkdir()
    
    old_timestamp = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    traceability_data = {
        "schema_version": 1,
        "generated_at": old_timestamp,
        "overall_passed": True,
        "traceability_pct": 100.0,
        "requirements": []
    }
    
    (target_dir / "traceability.json").write_text(json.dumps(traceability_data))
    
    # Create a mock ./do script that tracks if test was run
    do_script = tmp_path / "do"
    do_script.write_text("""#!/bin/bash
if [ "$1" = "test" ]; then
    echo "Running tests..."
    # Update traceability timestamp
    cat > target/traceability.json << 'EOF'
{"schema_version": 1, "generated_at": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'", "overall_passed": true, "traceability_pct": 100.0}
EOF
    exit 0
fi
""")
    do_script.chmod(0o755)
    
    # Create agent workflow script
    agent_script = tmp_path / "agent_workflow.py"
    agent_script.write_text("""
import json
import subprocess
import sys
from datetime import datetime, timezone, timedelta

# Step 1: Check traceability staleness
with open('target/traceability.json') as f:
    data = json.load(f)

generated_at = datetime.fromisoformat(data['generated_at'].replace('Z', '+00:00'))
now = datetime.now(timezone.utc)
age = now - generated_at

if age > timedelta(hours=1):
    print("Traceability is stale, running ./do test...", file=sys.stderr)
    # Step 2: Run ./do test before any implementation work
    result = subprocess.run(["./do", "test"])
    if result.returncode != 0:
        print("Tests failed, aborting", file=sys.stderr)
        sys.exit(1)
    print("Tests passed, proceeding with implementation")
else:
    print("Traceability is fresh, proceeding directly")

# Step 3: Implementation work would happen here
print("Implementation work...")
""")
    
    # Run the agent workflow
    monkeypatch.chdir(tmp_path)
    result = subprocess.run(
        [sys.executable, "agent_workflow.py"],
        capture_output=True,
        text=True
    )
    
    # Assertions per [3_MCP_DESIGN-REQ-AC-5.15]
    assert result.returncode == 0
    assert "Traceability is stale, running ./do test..." in result.stderr
    assert "Running tests..." in result.stdout
    assert "Implementation work..." in result.stdout
```

- [ ] Run the tests to confirm they **fail** (red) before implementation:
```bash
cd /home/mrwilson/software/devs
python -m pytest .tools/tests/test_traceability_staleness.py -v --tb=short
```

## 2. Task Implementation

### Step 1: Ensure generated_at Field is in target/traceability.json
- [ ] Read `.tools/verify_requirements.py` and verify the `generated_at` field is present:

```python
# In the traceability report generation:

from datetime import datetime, timezone

traceability_report = {
    "schema_version": 1,
    "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
    "overall_passed": overall_passed,
    "traceability_pct": round(traceability_pct, 1),
    "stale_annotations": stale_annotations,
    "uncovered_requirements": uncovered_requirements,
    "requirements": requirements_list
}
```

- [ ] Add `// Covers: [3_MCP_DESIGN-REQ-AC-5.15]` comment to the timestamp generation code

### Step 2: Create Staleness Check Utility
- [ ] Create `.tools/check_traceability_staleness.py`:

```python
#!/usr/bin/env python3
"""
Check if target/traceability.json is stale (older than 1 hour).

Exit codes:
  0 - File is fresh (< 1 hour old)
  1 - File does not exist or is invalid
  2 - File is stale (> 1 hour old)

Covers: [3_MCP_DESIGN-REQ-AC-5.15]
"""

import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path


def check_staleness(traceability_path: str = "target/traceability.json") -> int:
    """Check if traceability file is stale."""
    path = Path(traceability_path)
    
    if not path.exists():
        print("ERROR: target/traceability.json does not exist", file=sys.stderr)
        return 1
    
    try:
        with open(path) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in target/traceability.json: {e}", file=sys.stderr)
        return 1
    
    # Validate required fields
    if "generated_at" not in data:
        print("ERROR: generated_at field missing from target/traceability.json", file=sys.stderr)
        return 1
    
    # Parse timestamp
    try:
        generated_at = datetime.fromisoformat(
            data["generated_at"].replace("Z", "+00:00")
        )
    except ValueError as e:
        print(f"ERROR: Invalid timestamp format: {e}", file=sys.stderr)
        return 1
    
    # Calculate age
    now = datetime.now(timezone.utc)
    age = now - generated_at
    
    # Check staleness threshold (1 hour)
    if age > timedelta(hours=1):
        print(
            f"STALE: target/traceability.json is {age.total_seconds() / 3600:.2f} hours old "
            f"(threshold: 1 hour)",
            file=sys.stderr
        )
        print(
            f"  generated_at: {data['generated_at']}",
            file=sys.stderr
        )
        print(
            f"  current_time: {now.isoformat()}",
            file=sys.stderr
        )
        print(
            "  Action required: Run './do test' to refresh traceability data",
            file=sys.stderr
        )
        return 2
    
    print(f"OK: target/traceability.json is fresh ({age.total_seconds() / 60:.1f} minutes old)")
    return 0


if __name__ == "__main__":
    sys.exit(check_staleness())
```

### Step 3: Integrate Staleness Check into ./do test
- [ ] Read the `./do` script and add staleness validation to the `test` command:

```bash
# In ./do test command, after running tests:

# Verify traceability file was written
if [ ! -f "target/traceability.json" ]; then
    echo "ERROR: ./do test did not generate target/traceability.json" >&2
    exit 1
fi

# Validate generated_at timestamp format
python3 -c "
import json, sys
from datetime import datetime, timezone

with open('target/traceability.json') as f:
    data = json.load(f)

if 'generated_at' not in data:
    print('ERROR: generated_at field missing', file=sys.stderr)
    sys.exit(1)

try:
    datetime.fromisoformat(data['generated_at'].replace('Z', '+00:00'))
except ValueError as e:
    print(f'ERROR: Invalid timestamp format: {e}', file=sys.stderr)
    sys.exit(1)

print(f'Traceability timestamp: {data[\"generated_at\"]}')
" || exit 1
```

### Step 4: Document Agent Workflow for Stale Traceability
- [ ] Create `.tools/prompts/stale_traceability_handling.md`:

```markdown
# Agent Protocol: Stale Traceability Handling

**Covers: [3_MCP_DESIGN-REQ-AC-5.15]**

When starting a new development session, agents MUST follow this protocol:

## Step 1: Check Traceability Staleness

```bash
python .tools/check_traceability_staleness.py
```

## Step 2: Interpret Result

| Exit Code | Meaning | Action |
|---|---|---|
| 0 | File is fresh (< 1 hour) | Proceed to Step 3 |
| 1 | File missing/invalid | Run `./do test` immediately |
| 2 | File is stale (> 1 hour) | Run `./do test` immediately |

## Step 3: Read Fresh Traceability Data

```bash
cat target/traceability.json | jq '.uncovered_requirements, .stale_annotations'
```

## Step 4: Begin Implementation Work

Only after confirming fresh traceability data should the agent:
1. Review uncovered requirements
2. Select a requirement to implement
3. Begin TDD workflow (write test → implement → verify)

## Rationale

Per [3_MCP_DESIGN-REQ-AC-5.15], agents MUST NOT rely on stale traceability data
because:
- Requirement coverage may have changed
- Test implementations may have been modified
- The codebase state may not match the traceability report

The 1-hour threshold ensures agents work with reasonably current data while
avoiding unnecessary re-test runs for rapid iteration.
```

## 3. Code Review

- [ ] Verify that `generated_at` uses ISO 8601 format with UTC timezone (`Z` suffix)
- [ ] Verify that the 1-hour threshold is strictly enforced (not approximate)
- [ ] Verify that exit code `2` is used specifically for stale files (distinct from general errors)
- [ ] Verify that error messages are actionable and include:
  - Current age of the file
  - Threshold value
  - Recommended action
- [ ] Verify that the staleness check handles edge cases:
  - Missing file
  - Invalid JSON
  - Missing `generated_at` field
  - Malformed timestamp
- [ ] Verify that `./do test` always updates `generated_at` on completion (even if tests fail)

## 4. Run Automated Tests to Verify

- [ ] Run the staleness tests:
```bash
cd /home/mrwilson/software/devs
python -m pytest .tools/tests/test_traceability_staleness.py -v
```

- [ ] Test the staleness check utility manually:
```bash
# Test with fresh file
./do test
python .tools/check_traceability_staleness.py
echo "Exit code: $?"  # Should be 0

# Test with stale file (manually modify timestamp)
python -c "
import json
from datetime import datetime, timedelta, timezone
with open('target/traceability.json') as f:
    data = json.load(f)
data['generated_at'] = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
with open('target/traceability.json', 'w') as f:
    json.dump(data, f)
"
python .tools/check_traceability_staleness.py
echo "Exit code: $?"  # Should be 2
```

- [ ] Verify the agent workflow:
```bash
# Simulate agent starting with stale traceability
# Run the agent workflow script from the test
# Verify it runs ./do test before proceeding
```

## 5. Update Documentation

- [ ] Update `docs/plan/shared_components.md` under "Traceability & Coverage Infrastructure":
  - Document the `generated_at` field and its format
  - Document the 1-hour staleness threshold
  - Document the staleness check utility

- [ ] Update `.tools/README.md`:
  - Add usage instructions for `check_traceability_staleness.py`
  - Document exit codes and their meanings

- [ ] Update or create `GEMINI.md` (or equivalent agent protocol doc):
  - Add the stale traceability handling protocol
  - Emphasize that agents MUST NOT use stale data for task planning

## 6. Automated Verification

- [ ] Verify that `generated_at` is always present after `./do test`:
```bash
./do test || true
python -c "
import json
with open('target/traceability.json') as f:
    data = json.load(f)
assert 'generated_at' in data, 'generated_at missing'
print(f'generated_at: {data[\"generated_at\"]}')
"
```

- [ ] Verify that `generated_at` is in valid ISO 8601 format:
```bash
python -c "
import json
from datetime import datetime
with open('target/traceability.json') as f:
    data = json.load(f)
datetime.fromisoformat(data['generated_at'].replace('Z', '+00:00'))
print('Timestamp format: VALID')
"
```

- [ ] Verify that staleness detection works correctly:
```bash
# Create stale file, verify exit code 2
# Create fresh file, verify exit code 0
# Verify error messages are actionable
```

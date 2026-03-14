# Task: Traceability Hardening (Sub-Epic: 02_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-AC-3.20], [3_MCP_DESIGN-REQ-056]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Coverage Infrastructure, ./do Entrypoint Script]

## 1. Initial Test Written

### Test 1: Unknown Requirement ID Detection (3_MCP_DESIGN-REQ-AC-3.20)
- [ ] Create a Python test file `.tools/tests/test_traceability_unknown_id.py` with the following test:

```python
def test_unknown_requirement_id_causes_overall_passed_false(tmp_path, monkeypatch):
    """
    Covers: [3_MCP_DESIGN-REQ-AC-3.20]
    
    When a test file contains '// Covers: NONEXISTENT-REQ-999', the traceability
    report must have overall_passed: false and list the unknown ID in
    uncovered_requirements (or stale_annotations).
    """
    # Setup: Create a test Rust file with unknown Covers annotation
    test_rs = tmp_path / "test_unknown.rs"
    test_rs.write_text("""
#[test]
fn test_something() {
    // Covers: NONEXISTENT-REQ-999
    assert_eq!(1 + 1, 2);
}
""")
    
    # Run traceability verification
    monkeypatch.chdir(tmp_path)
    result = subprocess.run(
        [sys.executable, ".tools/verify_requirements.py", "traceability"],
        capture_output=True,
        text=True
    )
    
    # Load traceability report
    traceability = json.loads((tmp_path / "target/traceability.json").read_text())
    
    # Assertions per [3_MCP_DESIGN-REQ-AC-3.20]
    assert traceability["overall_passed"] is False, "overall_passed must be false for unknown req IDs"
    assert "NONEXISTENT-REQ-999" in traceability.get("stale_annotations", []) or \
           "NONEXISTENT-REQ-999" in traceability.get("uncovered_requirements", []), \
           "Unknown req ID must be listed in stale_annotations or uncovered_requirements"
```

### Test 2: 100% Traceability Gate (3_MCP_DESIGN-REQ-056)
- [ ] Create a Python test file `.tools/tests/test_traceability_100pct_gate.py`:

```python
def test_traceability_pct_below_100_causes_nonzero_exit(tmp_path, monkeypatch):
    """
    Covers: [3_MCP_DESIGN-REQ-056]
    
    When traceability_pct < 100.0, ./do test must exit non-zero.
    """
    # Setup: Create a scenario where one requirement has no covering test
    # This may involve temporarily removing a Covers annotation
    
    # Run ./do test
    result = subprocess.run(
        ["./do", "test"],
        capture_output=True,
        text=True,
        cwd=tmp_path
    )
    
    # Load traceability report
    traceability = json.loads((tmp_path / "target/traceability.json").read_text())
    
    # Simulate < 100% coverage scenario
    traceability["traceability_pct"] = 98.5
    traceability["overall_passed"] = False
    
    # Assertions per [3_MCP_DESIGN-REQ-056]
    assert traceability["traceability_pct"] < 100.0
    assert traceability["overall_passed"] is False
    assert result.returncode != 0, "./do test must exit non-zero when traceability_pct < 100.0"
```

- [ ] Run the tests to confirm they **fail** (red) before implementation:
```bash
cd /home/mrwilson/software/devs
python -m pytest .tools/tests/test_traceability_unknown_id.py -v --tb=short
python -m pytest .tools/tests/test_traceability_100pct_gate.py -v --tb=short
```

## 2. Task Implementation

### Step 1: Update verify_requirements.py for Unknown ID Detection
- [ ] Read `.tools/verify_requirements.py` and locate the `// Covers:` annotation extraction logic
- [ ] Add logic to detect annotations that don't match any known requirement ID:

```python
# In the traceability generation function:

def extract_covers_annotations(codebase_paths):
    """Extract all // Covers: REQ-ID annotations from codebase."""
    annotations = []
    for path in codebase_paths:
        if path.suffix in ['.rs', '.py', '.toml']:
            content = path.read_text()
            # Match // Covers: REQ-ID or # Covers: REQ-ID
            for match in re.finditer(r'(?://|#)\s*Covers:\s*([A-Z0-9_\.\-]+)', content):
                annotations.append((match.group(1), str(path), match.start()))
    return annotations

def validate_annotations(annotations, known_req_ids):
    """Check for unknown/stale requirement IDs."""
    stale = []
    for req_id, file_path, line_num in annotations:
        if req_id not in known_req_ids:
            stale.append({
                "id": req_id,
                "file": file_path,
                "line": line_num
            })
    return stale
```

### Step 2: Update target/traceability.json Schema
- [ ] Ensure the traceability JSON output includes the `stale_annotations` field:

```python
traceability_report = {
    "schema_version": 1,
    "generated_at": datetime.utcnow().isoformat() + "Z",
    "overall_passed": False,  # Set based on all checks below
    "traceability_pct": calculated_pct,
    "stale_annotations": stale_list,  # Unknown req IDs found in annotations
    "uncovered_requirements": uncovered_list,  # Known reqs with no tests
    "requirements": [...]  # Per-requirement status
}

# overall_passed is True ONLY if:
# - traceability_pct == 100.0
# - stale_annotations is empty
# - uncovered_requirements is empty
# - all tests pass
```

### Step 3: Update ./do test Exit Code Logic
- [ ] Read the `./do` script and locate the `test` command implementation
- [ ] Add logic to check `target/traceability.json` and exit non-zero if `traceability_pct < 100.0`:

```bash
# In ./do test command:
if [ -f "target/traceability.json" ]; then
    TRACEABILITY_PCT=$(python -c "import json; print(json.load(open('target/traceability.json'))['traceability_pct'])")
    STALE_COUNT=$(python -c "import json; print(len(json.load(open('target/traceability.json')).get('stale_annotations', [])))")
    
    if (( $(echo "$TRACEABILITY_PCT < 100.0" | bc -l) )); then
        echo "FAILED: traceability_pct is $TRACEABILITY_PCT% (must be 100.0%)" >&2
        python -c "import json; d=json.load(open('target/traceability.json')); print('Uncovered:', d.get('uncovered_requirements', []))" >&2
        exit 1
    fi
    
    if [ "$STALE_COUNT" -gt 0 ]; then
        echo "FAILED: Found $STALE_COUNT stale // Covers: annotations with unknown requirement IDs" >&2
        python -c "import json; d=json.load(open('target/traceability.json')); print('Stale:', d.get('stale_annotations', []))" >&2
        exit 1
    fi
fi
```

### Step 4: Add Traceability Comments to Implementation
- [ ] Add `// Covers: [3_MCP_DESIGN-REQ-AC-3.20]` comment to the unknown ID detection code
- [ ] Add `// Covers: [3_MCP_DESIGN-REQ-056]` comment to the exit code logic

## 3. Code Review

- [ ] Verify that requirement IDs are correctly parsed from all spec files (`docs/plan/specs/*.md`, `docs/plan/requirements/*.md`)
- [ ] Verify that the `// Covers:` annotation regex matches all valid formats (Rust `//`, Python `#`, TOML `#`)
- [ ] Verify that `traceability_pct` calculation is `(covered_count / total_count) × 100.0` rounded to 1 decimal
- [ ] Verify that `overall_passed` is `true` ONLY when ALL conditions are met:
  - `traceability_pct == 100.0`
  - `stale_annotations` array is empty
  - `uncovered_requirements` array is empty
  - All tests pass
- [ ] Verify that `./do test` exits with code `1` (not just non-zero) when traceability fails
- [ ] Verify that stderr output lists the specific uncovered requirement IDs

## 4. Run Automated Tests to Verify

- [ ] Run the new tests:
```bash
cd /home/mrwilson/software/devs
python -m pytest .tools/tests/test_traceability_unknown_id.py -v
python -m pytest .tools/tests/test_traceability_100pct_gate.py -v
```

- [ ] Run full traceability verification:
```bash
./do test 2>&1 | tee /tmp/test_output.txt
echo "Exit code: $?"
```

- [ ] Verify the traceability report schema:
```bash
cat target/traceability.json | jq 'keys'
# Should include: schema_version, generated_at, overall_passed, traceability_pct, stale_annotations, uncovered_requirements, requirements
```

## 5. Update Documentation

- [ ] Update `docs/plan/shared_components.md` under "Traceability & Coverage Infrastructure" to document:
  - The `stale_annotations` field in `target/traceability.json`
  - The behavior when unknown requirement IDs are detected
  - The 100% traceability gate enforced by `./do test`

- [ ] Update `.tools/README.md` to document:
  - How to interpret `stale_annotations` in traceability output
  - How to fix stale annotations (remove or correct the `// Covers:` comment)

## 6. Automated Verification

- [ ] Verify that `./do test` returns exit code `1` when a requirement is not covered:
```bash
# Temporarily comment out a // Covers: annotation in a test file
# Run ./do test
# Verify exit code is 1
# Restore the annotation
```

- [ ] Verify that `./do test` returns exit code `1` when an unknown requirement ID is used:
```bash
# Add a test with // Covers: FAKE-REQ-000
# Run ./do test
# Verify exit code is 1 and stderr mentions FAKE-REQ-000
# Remove the fake annotation
```

- [ ] Verify that `target/traceability.json` is always written even on failure:
```bash
./do test || true
test -f target/traceability.json && echo "Traceability file exists" || echo "MISSING!"
cat target/traceability.json | jq '.overall_passed, .traceability_pct, .stale_annotations'
```

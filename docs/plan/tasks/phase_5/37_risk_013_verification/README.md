# Sub-Epic: 37_Risk 013 Verification

## Overview
This sub-epic implements the complete traceability verification system for RISK-013 (Requirement Traceability Maintenance Burden) and all associated business rules. The system ensures 100% requirement traceability through automated scanning, stale annotation detection, and commit-atomic verification.

## Covered Requirements

| Requirement ID | Description | Status |
|----------------|-------------|--------|
| [RISK-013] | 100% requirement traceability gate creates annotation maintenance burden | Mitigated |
| [RISK-013-BR-001] | `./do test` MUST exit non-zero when `traceability_pct < 100.0` | Implemented |
| [RISK-013-BR-002] | `./do test` MUST exit non-zero when `stale_annotations` is non-empty | Implemented |
| [RISK-013-BR-003] | New requirement IDs MUST have covering tests in same commit | Implemented |
| [RISK-013-BR-004] | Traceability scanner scans ALL `.rs` files (test and production) | Implemented |

## Task Breakdown

| Task | Description | Requirements Covered |
|------|-------------|---------------------|
| [01_enforce_traceability_gates.md](01_enforce_traceability_gates.md) | Implement core traceability gate enforcement | RISK-013-BR-001, RISK-013-BR-002, RISK-013-BR-004 |
| [02_commit_atomic_traceability_verification.md](02_commit_atomic_traceability_verification.md) | Implement commit-atomic verification | RISK-013, RISK-013-BR-003 |
| [03_implement_traceability_scanner.md](03_implement_traceability_scanner.md) | Implement universal file scanner | RISK-013-BR-004 |
| [04_implement_traceability_exit_logic.md](04_implement_traceability_exit_logic.md) | Implement exit logic for <100% coverage | RISK-013-BR-001 |
| [05_implement_stale_annotation_detection.md](05_implement_stale_annotation_detection.md) | Implement stale annotation detection | RISK-013-BR-002 |
| [06_implement_commit_atomic_check.md](06_implement_commit_atomic_check.md) | Implement git-based commit check | RISK-013, RISK-013-BR-003 |
| [07_integrate_and_verify_complete_system.md](07_integrate_and_verify_complete_system.md) | Integrate and verify complete system | All requirements |

## Dependencies

### Shared Components
- **./do Entrypoint Script**: The traceability checks are integrated into `./do test` and `./do presubmit`
- **Traceability & Coverage Infrastructure**: `target/traceability.json` generation and schema

### Task Dependencies
```
01_enforce_traceability_gates (no deps)
        │
        ├─► 03_implement_traceability_scanner (depends on 01)
        │         │
        │         ├─► 04_implement_traceability_exit_logic (depends on 03)
        │         │
        │         ├─► 05_implement_stale_annotation_detection (depends on 03)
        │         │
        │         └─► 06_implement_commit_atomic_check (depends on 03)
        │                   │
        │                   └─► 07_integrate_and_verify_complete_system (depends on all)
        │
        └─► 02_commit_atomic_traceability_verification (no deps, parallel track)
```

## Implementation Details

### Traceability Scanner
- Scans all `.rs` files in workspace (excluding `target/`, `.git/`, `devs-proto/src/gen/`)
- Extracts `// Covers: ID1, ID2, ...` annotations using regex
- Supports multiple IDs per line (comma-space separated)
- Case-sensitive ID matching

### Requirement Extraction
- Scans markdown files in `docs/plan/requirements/`, `docs/plan/specs/`, and `requirements.md`
- Extracts requirement IDs from header format: `### **[REQ-ID]**`
- Builds a set of all valid requirement IDs

### Coverage Calculation
```
traceability_pct = (covered_ids / total_ids) * 100
```
- Must be exactly 100.0% to pass (99.9% fails)
- Edge case: 0 requirements = 100% (nothing to cover)

### Stale Annotation Detection
- Compares found annotation IDs against valid requirement IDs
- Reports stale annotations with file path and line number
- Exits non-zero if any stale annotations found

### Commit-Atomic Check
- Uses `git diff HEAD^ HEAD` to find new requirements in current commit
- Verifies each new requirement has a covering `// Covers:` annotation
- Also checks that removed annotations correspond to removed requirements
- Skipped gracefully if git is not available

## Verification

### Automated Tests
All tests are in `.tools/tests/`:
- `test_traceability_scanner.py`: Scanner unit tests
- `test_traceability_gates.py`: Exit logic unit tests
- `test_stale_annotations.py`: Stale detection unit tests
- `test_commit_atomic.py`: Commit-atomic unit tests
- `test_traceability_e2e.py`: End-to-end integration tests

### Verification Scripts
- `.tools/tests/verify_scanner.sh`: Verifies scanner file exclusion
- `.tools/tests/verify_traceability_gate.sh`: Verifies 100% gate
- `.tools/tests/verify_stale_detection.sh`: Verifies stale detection
- `.tools/tests/verify_commit_atomic.sh`: Verifies commit-atomic check
- `.tools/tests/verify_risk_013_complete.sh`: Complete verification suite

### Manual Verification
```bash
# Run full test suite
./do test

# Run presubmit (includes all traceability checks)
./do presubmit

# Run coverage (verifies traceability annotations)
./do coverage

# Check traceability report
cat target/traceability.json
```

## Output Artifacts

### target/traceability.json
```json
{
  "generated_at": "2026-03-14T10:30:00Z",
  "traceability_pct": 100.0,
  "stale_annotations": [],
  "uncovered_ids": [],
  "total_ids": 1234,
  "covered_ids": 1234,
  "phase_gates": [
    {"phase": "phase_5", "gate": "RISK-013", "passed": true}
  ]
}
```

### Console Output
```
Traceability Check: PASSED
- Total requirements: 1234
- Covered: 1234 (100.0%)
- Stale annotations: 0
- Commit-atomic check: PASSED
```

## Error Messages

### Uncovered Requirement
```
ERROR: Traceability check failed: 1 uncovered requirement(s)
Traceability: 99.9% (must be 100.0%)
Uncovered requirements:
  - RISK-013-BR-005 (found in docs/plan/requirements/8_risks_mitigation.md:1463)
```

### Stale Annotation
```
ERROR: Stale annotations detected: 1 annotation(s) reference non-existent requirements
Stale annotations:
  - NONEXISTENT-ID at src/foo.rs:42
Action: Remove the annotation or update it to reference a valid requirement ID
```

### Commit-Atomic Failure
```
ERROR: Commit-atomic check failed: 1 new requirement(s) without covering test
New requirements without coverage:
  - NEW-REQ-001 (added in docs/plan/requirements/new.md)
Action: Add // Covers: NEW-REQ-001 annotation in a test file and amend commit
```

## Related Documentation
- [Phase 5 Plan](../../phases/phase_5.md)
- [Risks and Mitigation Spec](../../specs/8_risks_mitigation.md)
- [Traceability Infrastructure](../../../requirements.md)

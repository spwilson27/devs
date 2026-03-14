# Sub-Epic: 17_Risk_003_Verification

## Overview
This sub-epic verifies the mitigations for two critical risks:
1. **RISK-003** (continued from 16_Risk_003_Verification): Git checkpoint store corruption under crash conditions, specifically orphaned `.tmp` files and mid-write crash recovery.
2. **RISK-004**: Agent adapter CLI interface breakage from upstream changes, including rate limit detection false positives and inline string literal fragility.

The implementation ensures that the `devs` server gracefully handles checkpoint corruption scenarios and that adapter CLI flags are maintainable and version-audited.

## Covered Requirements
All requirements in this sub-epic are traced to the parent risk mitigation specification:

| Requirement ID | Type | Description |
|---|---|---|
| [AC-RISK-003-03] | Acceptance | Orphaned `checkpoint.json.tmp` file deleted with `WARN` log during `load_all_runs` |
| [AC-RISK-003-04] | Acceptance | Mid-write crash recovery: at most one `Unrecoverable` run, all others recover correctly |
| [RISK-004] | Technical | Agent Adapter CLI Interface Breakage mitigation verification |
| [RISK-004-BR-001] | Functional | `detect_rate_limit()` returns `false` when `exit_code == 0` |
| [RISK-004-BR-002] | Functional | All adapter CLI flags defined as `const &str`; inline literals prohibited |

## Task Breakdown

| Task # | Task Name | Requirements Covered | Dependencies |
|---|---|---|---|
| 01 | Verify Checkpoint Orphan Cleanup and Mid-Write Crash Recovery | [AC-RISK-003-03], [AC-RISK-003-04] | none |
| 02 | Verify Agent Adapter CLI Integrity and Rate Limit Detection | [RISK-004], [RISK-004-BR-001], [RISK-004-BR-002] | none |

## Shared Components

### devs-checkpoint (Owner)
This sub-epic **owns** the orphan cleanup logic in the `devs-checkpoint` crate:
- `CheckpointStore::load_all_runs()` scans for `*.tmp` files and deletes them with `WARN` logging
- Error handling for JSON parsing failures marks individual runs as `Unrecoverable`
- Integration tests verify crash recovery scenarios

### devs-adapters (Owner)
This sub-epic **owns** the rate limit detection and flag constant enforcement in `devs-adapters`:
- `AgentAdapter::detect_rate_limit()` early return for `exit_code == 0`
- Case-insensitive substring matching for rate-limit patterns (no regex dependency)
- All CLI flags defined as `pub const &str` in each adapter's `config.rs`
- Lint script (`.tools/lint_adapter_flags.py`) enforces flag constant usage

### devs-core (Consumer)
This sub-epic **consumes** from `devs-core`:
- `RunStatus::Unrecoverable` enum variant for marking corrupted runs
- Structured logging types and conventions

### ./do Entrypoint Script (Consumer)
This sub-epic **consumes** the lint infrastructure:
- Integration of `lint_adapter_flags.py` into `./do lint`
- Traceability report generation via `./do test`

## Verification Strategy

### Unit Tests
- Rate limit detection with zero exit code (Task 02)
- Rate limit detection with non-zero exit and matching patterns (Task 02)
- Adapter flag constant verification via compile-time and lint checks (Task 02)

### Integration Tests
- Orphaned `.tmp` file cleanup during `load_all_runs()` (Task 01)
- Mid-write crash recovery with multiple runs (Task 01)

### Lint Checks
- Adapter flag literal scan (`.tools/lint_adapter_flags.py`) (Task 02)

### Traceability
All tests must include `// Covers: REQ-ID` annotations mapping to the requirements listed above. The `./do test` command generates `target/traceability.json` which must show 100% coverage for all five requirements.

## Success Criteria
- [ ] All five requirements have passing tests with traceability annotations
- [ ] `./do test` exits 0 with `target/traceability.json` showing full coverage
- [ ] `./do lint` passes including the adapter flag literal check
- [ ] Manual verification: orphaned `.tmp` files are cleaned up with `WARN` log
- [ ] Manual verification: mid-write crash affects at most one run
- [ ] Manual verification: rate limit detection never triggers on zero exit code

## Related Sub-Epics
- **15_Risk_003_Verification**: Covers RISK-003-BR-001, RISK-003-BR-002 (atomic write protocol)
- **16_Risk_003_Verification**: Covers RISK-003-BR-003, RISK-003-BR-004, AC-RISK-003-01, AC-RISK-003-02 (disk-full and push failure handling)
- **18_Risk_004_Verification**: Covers RISK-004-BR-003, RISK-004-BR-004, MIT-004, AC-RISK-004-01, AC-RISK-004-02 (adapter versions JSON and rate limit pattern coverage)

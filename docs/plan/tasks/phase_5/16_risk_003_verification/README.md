# Sub-Epic: 16_Risk 003 Verification

## Overview
This sub-epic verifies the mitigation for **RISK-003**: Git checkpoint store corruption under disk-full or crash conditions. The implementation ensures that the `devs` server gracefully handles disk-full errors, git push failures, and corrupted checkpoint files without crashing or losing data.

## Covered Requirements
All requirements in this sub-epic are traced to the parent risk mitigation specification:

| Requirement ID | Type | Description |
|---|---|---|
| [RISK-003-BR-003] | Functional | Disk-full (`ENOSPC`) error handling with ERROR log and server continuation |
| [RISK-003-BR-004] | Functional | Non-fatal git2 push failure handling with WARN log and retry |
| [MIT-003] | Technical | Atomic checkpoint write protocol and validation implementation |
| [AC-RISK-003-01] | Acceptance | Test: Mock CheckpointStore returning StorageFull continues processing |
| [AC-RISK-003-02] | Acceptance | Test: Invalid JSON checkpoint detection and Unrecoverable run marking |

## Task Breakdown

| Task # | Task Name | Requirements Covered | Dependencies |
|---|---|---|---|
| 01 | Disk-Full Resilience and Push Failure Recovery | RISK-003-BR-003, RISK-003-BR-004, MIT-003, AC-RISK-003-01 | none |
| 02 | Checkpoint JSON Validation and Unrecoverable State | AC-RISK-003-02 | 01 |
| 03 | Mock CheckpointStore for StorageFull Simulation | AC-RISK-003-01 | none |
| 04 | Structured ERROR Logging for Write Failures | RISK-003-BR-003, AC-RISK-003-01 | 03 |
| 05 | Non-Fatal Git Push Failure Handling | RISK-003-BR-004 | 01 |
| 06 | Checkpoint JSON Validation Function | AC-RISK-003-02, MIT-003 | none |
| 07 | Server Startup with Corrupted Checkpoint Recovery | AC-RISK-003-02 | 06 |

## Shared Components

### devs-checkpoint (Owner)
This sub-epic **owns** the implementation of the checkpoint write failure handling and validation logic in the `devs-checkpoint` crate. Key implementations include:
- `CheckpointStore::write_checkpoint` with StorageFull error handling
- `CheckpointStore::validate_checkpoint` for JSON validation
- Structured logging for `checkpoint.write_failed` and `checkpoint.push_failed` events
- Mock checkpoint store for testing

### devs-core (Consumer)
This sub-epic **consumes** the following from `devs-core`:
- `RunStatus::Unrecoverable` enum variant for marking corrupted runs
- Error types for checkpoint validation failures

### devs-scheduler (Consumer)
This sub-epic **consumes** the scheduler's run management interface to ensure Unrecoverable runs are blocked from stage dispatch.

### devs-server (Consumer)
This sub-epic **consumes** the server's startup routine to integrate checkpoint validation during `load_all_runs`.

## Verification Strategy

### Unit Tests
- Mock checkpoint store behavior (Task 03)
- Checkpoint JSON validation function (Task 06)
- Structured logging assertions (Task 04)

### Integration Tests
- Disk-full error simulation and server continuation (Task 01)
- Git push failure and retry mechanism (Task 05)
- Server startup with corrupted checkpoint recovery (Task 07)

### Traceability
All tests must include `// Covers: REQ-ID` annotations mapping to the requirements listed above. The `./do test` command generates `target/traceability.json` which must show 100% coverage for all five requirements.

## Success Criteria
- [ ] All five requirements have passing tests with traceability annotations
- [ ] `./do test` exits 0 with `target/traceability.json` showing full coverage
- [ ] `./do lint` passes with no warnings
- [ ] Manual verification: server survives disk-full simulation without data loss
- [ ] Manual verification: server starts successfully with corrupted checkpoint (other runs unaffected)

## Related Sub-Epics
- **15_Risk_003_Verification**: Covers RISK-003-BR-001, RISK-003-BR-002, AC-RISK-003-03, AC-RISK-003-04 (atomic write protocol and orphan cleanup)
- **17_Risk_003_Verification**: Covers AC-RISK-003-03, AC-RISK-003-04, RISK-004 (orphan cleanup and agent adapter risks)

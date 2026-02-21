# Task: Implement AOD (.agent.md) checksum verification before agent ingestion (Sub-Epic: 08_Document Integrity and Security)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-002]

## 1. Initial Test Written
- [ ] Create unit and integration tests at `tests/agents/test_aod_checksum.(ts|js|py)`:
  - Unit test: for the agent ingestion helper `ingestAOD(filePath)`, create a temp `.agent.md` file and a `.devs/checksums.json` entry mapping that exact relative path to its checksum. When contents match, assert `ingestAOD` returns parsed AOD object. When contents are tampered (modify file), assert `ingestAOD` raises `TamperDetectedError` (or returns `{ok:false,reason:'tamper'}`) and does not return a parsed object.
  - Integration test: simulate a Developer Agent activity that tries to enqueue an AOD for processing where the checksum mismatches; assert the orchestrator rejects the ingestion, writes `.devs/aod_tamper.log` with details, and does not add tasks to the Agent Queue.
- [ ] Tests must use explicit file names and temp directories and must be offline.

## 2. Task Implementation
- [ ] Add a pre-ingestion verification in the Agent Ingest pipeline:
  - Before parsing any `.agent.md` or agent data blob, compute its SHA-256 with `DocumentChecksum.computeChecksum()` and compare to `.devs/checksums.json` (or dedicated `.devs/aod_checksums.json`).
  - If mismatch detected, create an audit record `.devs/aod_tamper.log` (appendable, rotatable) containing: timestamp, agent-id (if available), file path, expected sha, found sha, and do NOT enqueue ingestion or execute any agent logic.
  - Expose a predictable exception/error type `TamperDetectedError` for tests and upper layers to catch and convert to gate state.
  - Add a programmatic API `agents.ingest.verifyAodIntegrity(filePath)` which returns `{ ok: boolean, expected?: string, found?: string }`.
- [ ] Ensure ingestion is idempotent and that on detection the state is persisted in a human-readable audit file and in the orchestrator's `.devs/state.sqlite` (if present) for non-repudiation.

## 3. Code Review
- [ ] Verify that agent ingestion does not proceed to any code execution (parsing, linting, or running tests) if tamper is detected.
- [ ] Verify that logs do not include agent secrets or file contents, only metadata and sha values.
- [ ] Ensure the audit file is permissioned to 0600 and only accessible by the orchestrator user.

## 4. Run Automated Tests to Verify
- [ ] Run the new unit and integration tests (e.g., `pytest tests/agents/test_aod_checksum.py` or equivalent). All tests must pass in the acceptance environment.

## 5. Update Documentation
- [ ] Add a subsection to `specs/5_security_design.md` titled "AOD Checksum Verification" describing the pre-ingest verification flow, the audit record format (`.devs/aod_tamper.log`), and remediation steps for recovery (how to re-sign or re-generate checksums securely).

## 6. Automated Verification
- [ ] Add `scripts/verify_aod_integrity.(sh|py|js)` that scans `.devs/aod_checksums.json` and all `.agent.md` files and reports mismatches with exit code >0. Integrate this into the Agent Queue processing pipeline as a mandatory pre-check.

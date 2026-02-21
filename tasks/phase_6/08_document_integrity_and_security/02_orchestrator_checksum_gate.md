# Task: Implement orchestrator checksum gate (verify PRD/TAS before DistillNode/ImplementationLoop) (Sub-Epic: 08_Document Integrity and Security)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-060], [5_SECURITY_DESIGN-REQ-SEC-SD-023]

## 1. Initial Test Written
- [ ] Create an integration test `tests/integration/test_orchestrator_checksum_gate.(ts|js|py)` that simulates orchestrator startup in a sandboxed temp workspace:
  - Step 1 (happy path): create `PRD.md` and `TAS.md` with content; call `DocumentChecksum.generateManifest([...], outPath='.devs/checksums.json')`; start the orchestrator in test mode and assert it proceeds past the pre-check and reaches `DistillNode` / `ImplementationLoop` start point (assert by reading orchestrator state file `.devs/gate_state.json` or a test hook that records lifecycle events).
  - Step 2 (tamper/mismatch): mutate `PRD.md` (append a space) without regenerating the manifest; start orchestrator in test mode and assert it does NOT proceed and that the orchestrator exits/blocks with a deterministic error code and log message containing `Document checksum mismatch` and sets `.devs/gate_state.json` to `{ "blocked": true, "reason": "checksum_mismatch", "files": ["PRD.md"] }`.
- [ ] The test must run fully offline and use temporary directories created by the test harness.

## 2. Task Implementation
- [ ] Add a pre-flight check in the orchestrator startup sequence (before DistillNode and ImplementationLoop) that:
  - Loads `.devs/checksums.json` using DocumentChecksum.verifyManifest()
  - Computes current checksums for the canonical artifact set (at least: `docs/1_prd.md`, `docs/tas.md` or `PRD.md`, `TAS.md` — follow repo canonical paths).
  - If any mismatches are detected, set orchestrator state to `blocked` and persist `.devs/gate_state.json` with `{ blocked: true, reason: 'checksum_mismatch', mismatches: { <file>: { expected, found } } }` and do NOT start DistillNode/ImplementationLoop. Return a non-zero exit code for CLI runs.
  - Provide a clear, auditable log message including file names and checksums (avoid printing file contents).
- [ ] Implement a small, test-only hook that allows the integration test to assert that the orchestrator reached the DistillNode step or was blocked. Prefer implementing a lifecycle event log in `.devs/lifecycle.log` for deterministic tests.
- [ ] Export a programmatic API `orchestrator.checkDocumentIntegrity()` which returns { ok: boolean, mismatches: {...} } and is called by both the CLI and the test harness.

## 3. Code Review
- [ ] Verify the orchestrator calls DocumentChecksum only via the exported API and does not duplicate hashing logic.
- [ ] Confirm the gate_state persistence is atomic and crash-safe (write to temp -> rename) and permissioned (0700 for `.devs/`, 0600 for gate files).
- [ ] Ensure error handling is explicit: on mismatch, orchestrator must fail fast and not partially progress into implementation phases.
- [ ] Validate logging is structured (JSON lines or structured logs) for scraping by the Review Dashboard.

## 4. Run Automated Tests to Verify
- [ ] Run the new integration test(s): they should pass in both happy and tamper scenarios.
- [ ] Run the full integration suite to ensure no regressions in orchestrator lifecycle.

## 5. Update Documentation
- [ ] Update `specs/5_security_design.md` (Document Integrity Checksums) to describe the orchestrator pre-flight gate behaviour, the `.devs/gate_state.json` schema, lifecycle logging, and failure modes.
- [ ] Add a short operations HOWTO in `docs/ops/checksums.md` describing how to un-block a gate (refer to ARCH_CHANGE_DIRECTIVE in the Immutable Sign-off task) and how to regenerate checksums after a valid change.

## 6. Automated Verification
- [ ] Add `scripts/test_orchestrator_checksum_gate.(sh|js|py)` that:
  - Boots the orchestrator in test mode with a prepared workspace and asserts the correct exit code and `.devs/gate_state.json` contents for both matched and mismatched cases.
  - Integrate this script into CI as a blocking check before ImplementationLoop runs.

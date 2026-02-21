# Task: Requirement Refinement Mode & Re-distill Integration (Sub-Epic: 08_Roadmap_Visualization_UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-073], [4_USER_FEATURES-REQ-014]

## 1. Initial Test Written
- [ ] Create integration tests at tests/ui/roadmap/refinement.test.(ts|js) that exercise the end-to-end refinement flow:
  - Edit a requirement's text in the UI editor and submit for re-distillation.
  - Assert that a background re-distill job is queued and that when it completes the roadmap is updated with new/modified tasks that include trace fields linking back to the edited REQ-ID.
  - Test cancelation: while re-distill is running, the user can cancel and the previous roadmap snapshot is preserved.

## 2. Task Implementation
- [ ] Implement a Requirement Editor UI at src/ui/roadmap/RequirementEditor.(tsx|jsx) that allows inline editing of a requirement and a Re-distill button.
- [ ] Implement endpoint POST /api/roadmap/redistill that accepts { reqId, editorId, changes } and returns jobId; implement a lightweight job runner that invokes the mapper from src/core/distiller/mapper.ts and writes updated tasks back to the DAG store.
- [ ] Ensure the job runner runs in a sandboxed environment and produces a deterministic diff (added/removed/modified tasks) which is persisted into the store with an incremented snapshot id.

## 3. Code Review
- [ ] Verify re-distill jobs are sandboxed, testable, and idempotent; confirm race conditions are handled (only one active re-distill per REQ-ID) and the job exposes logs for audit and debugging.

## 4. Run Automated Tests to Verify
- [ ] Run the refinement integration tests and a CI job that posts an example edit for REQ-ID `4_USER_FEATURES-REQ-073` and verifies the resulting roadmap includes the new tasks produced by the mapper.

## 5. Update Documentation
- [ ] Update docs/redistill.md describing the user workflow for Requirement Refinement Mode, the API contract for /api/roadmap/redistill, and operational guidance for running/monitoring jobs.

## 6. Automated Verification
- [ ] Implement `scripts/verify_redistill.sh` that posts an edit to /api/roadmap/redistill, polls the job endpoint, and once complete validates that at least one resulting task references the originating REQ-ID `4_USER_FEATURES-REQ-073`.
# Task: Design data model and persistence for Approval Tokens & Blocks (Sub-Epic: 12_HITL Approval Interface)

## Covered Requirements
- [1_PRD-REQ-UI-002], [1_PRD-REQ-HITL-002], [1_PRD-REQ-NEED-ARCH-02], [1_PRD-REQ-UI-017]

## 1. Initial Test Written
- [ ] Create `tests/unit/test_approval_model.py` (pytest) containing the following tests:
  - Use an in-memory SQLite database and the project's ORM (detect and reuse existing DB layer).
  - `test_create_approval_request_persists`: Create an ApprovalRequest for doc_type `PRD` and assert a row exists with `status == 'pending'` and `doc_id` matches.
  - `test_token_generation_and_lookup`: Generate an approval token (UUIDv4 hex), persist it, then query by token and assert the correct ApprovalRequest is returned.
  - `test_block_level_approval`: Create multiple ApprovalBlock rows linked to the ApprovalRequest, approve a single block and assert its `status` changes while others remain `pending`.
  - `test_approve_changes_status_and_timestamp`: Approve the whole ApprovalRequest and assert `approved_by` is set and `approved_at` is a timezone-aware UTC timestamp.
  - `test_checksum_verification`: Compute sha256 checksum for a sample document string, persist it on the ApprovalRequest and assert the stored checksum matches the computed value.

> Tests must be deterministic and use transactions/fixtures to isolate state; name tests exactly as above so the agent harness can locate them.

## 2. Task Implementation
- [ ] Implement data models and helpers in `src/models/approval.py` (or in the project's canonical models package):
  - `ApprovalRequest` fields: `id` (UUID PK), `doc_type` (enum: `PRD`|`TAS`), `doc_id` (string), `status` (`pending`|`approved`|`rejected`), `created_at` (UTC timestamp), `approved_by` (string, nullable), `approved_at` (UTC timestamp, nullable), `approval_token` (unique string), `checksum` (hex string).
  - `ApprovalBlock` fields: `id` (UUID PK), `approval_request_id` (FK -> ApprovalRequest.id), `block_id` (string), `req_id` (string), `title` (string), `description` (text), `status` (`pending`|`approved`|`rejected`), `approved_by`, `approved_at`.
  - Implement methods: `ApprovalRequest.generate_token()` (idempotent), `compute_checksum(content: str) -> str` (sha256 hex), `ApprovalRequest.is_frozen()` (returns true only if `status == 'approved'` and checksum matches current document)
- [ ] Add a migration script at `db/migrations/0001_create_approvals.sql` (SQL DDL create table statements) or add equivalent schema initialization in the project's DB init flow.
- [ ] Wire the models into the project's ORM/session factory and add a small helper module `src/models/__init__.py` to expose them.

## 3. Code Review
- [ ] Verify the implementation for the following:
  - Proper FK constraints and indices: unique index on `approval_token`, index on `(doc_type, doc_id)`, index on `approval_request_id`.
  - Timezone-aware UTC timestamps and consistent use of timezone handling.
  - Idempotent token generation (generate but return existing token for repeated calls on same ApprovalRequest).
  - Clear distinction between request-level approval vs block-level approvals and consistent naming.
  - Parameterized queries / ORM usage to avoid SQL injection and ensure DB portability.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/unit/test_approval_model.py` and confirm all tests pass; ensure tests clean up and use transactions or fixtures to reset DB.

## 5. Update Documentation
- [ ] Add `docs/approval_data_model.md` containing:
  - Table schemas with field types and sample SQL queries to find pending approvals.
  - Example payloads for creating approval requests and block objects.
  - Migration notes and how to rollback.
- [ ] Update the agent "memory" / manifest to include the new models and table names.

## 6. Automated Verification
- [ ] Add `scripts/ci_verify_approval_model.sh` that:
  - Runs the unit tests.
  - Uses `sqlite3` (or the project's DB client) to assert the existence of the created tables and indices.
  - Returns non-zero on any mismatch so CI can fail fast.

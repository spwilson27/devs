# Task: Implement SAOP Persistence Schema and Storage (Sub-Epic: 17_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-003]

## 1. Initial Test Written
- [ ] Write tests at tests/test_saop_persistence.py first:
  - test_saop_trace_insert_creates_row_with_hash_and_commit(): call record_saop_trace(saop_json, commit_hash, agent_id) and assert a row exists with sha256(saop_json) as saop_hash and commit_hash stored.
  - test_saop_persistence_is_append_only(): attempting to update an existing saop_hash should raise an integrity error or be rejected.
  - test_atomic_write_with_commit(): record_saop_trace should be performed in a transaction together with the corresponding git commit metadata; simulate failure halfway and assert no partial rows persisted.

## 2. Task Implementation
- [ ] Implement DB migrations and storage layer in src/storage/saop_store.py:
  - Create table `saop_traces` with columns: id INTEGER PRIMARY KEY AUTOINCREMENT, saop_hash TEXT UNIQUE, saop_json TEXT (redacted), commit_hash TEXT, agent_id TEXT, signature TEXT, pubkey_ref TEXT, created_at TIMESTAMP, canonicalized BOOLEAN.
  - Use WAL mode and transaction boundaries when writing both the git commit and the saop_trace to ensure ACID semantics.
  - Persist only redacted SAOP JSON (use SecretMasker) and store saop_hash as canonical sha256 of canonicalized JSON.
  - Provide functions: record_saop_trace(saop_json, commit_hash, agent_id, signature) and get_saop_trace_by_hash(hash).

## 3. Code Review
- [ ] Verify:
  - All DB writes use parameterized queries and are part of an explicit transaction.
  - The saop_json saved is redacted; raw secrets are never persisted.
  - Schema includes indices on saop_hash and commit_hash for fast lookups.

## 4. Run Automated Tests to Verify
- [ ] Run tests/test_saop_persistence.py and the integration test that performs commit+record in a temporary git repo.

## 5. Update Documentation
- [ ] Add docs/security/saop_persistence.md describing schema, canonicalization rules, redaction policy, and migration steps.

## 6. Automated Verification
- [ ] Provide scripts/verify_saop_integrity.py that computes sha256 of canonicalized stored saop_json and ensures it matches saop_hash, and that each row has a non-null commit_hash.

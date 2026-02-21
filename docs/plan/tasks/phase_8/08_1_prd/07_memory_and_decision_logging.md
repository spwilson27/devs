# Task: Implement Agentic Memory & Decision Logging (Sub-Epic: 08_1_PRD)

## Covered Requirements
- [1_PRD-REQ-IMP-003]

## 1. Initial Test Written
- [ ] Write unit tests for MemoryStore and DecisionLogger:
  - MemoryStore.persist_decision(task_id, turn_id, action, rationale, meta) writes a row to memory.sqlite and returns an id.
  - MemoryStore.get_decisions_for_task(task_id) returns decisions ordered by created_at.
  - DecisionLogger.log_decision(task_id, turn_id, action, rationale, commit_hash=None) stores SAOP traces and links to commit when provided.
  - Tests must use temporary sqlite DB and assert persistence across new connections.

## 2. Task Implementation
- [ ] Implement MemoryStore and DecisionLogger:
  - MemoryStore schema: decisions(id TEXT PRIMARY KEY, task_id TEXT, turn_id TEXT, action TEXT, rationale TEXT, meta JSON, commit_hash TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP).
  - Implement persist_decision, query_decisions, compact_decisions APIs.
  - DecisionLogger must redact sensitive tokens per redaction rules before persisting and store a content hash for trace verification.
  - Provide a migration script to create memory.sqlite schema.

## 3. Code Review
- [ ] Verify schema design, indices on task_id and commit_hash, use of transactions, and that redaction is unit-tested; ensure large rationale fields are handled and selectable via pagination.

## 4. Run Automated Tests to Verify
- [ ] Run tests that persist several decisions, close and reopen DB, and assert decisions are returned in order; run redaction tests verifying secrets removed.

## 5. Update Documentation
- [ ] Add docs/memory.md describing MemoryStore schema, DecisionLogger contract, redaction policy, and examples of queries to generate RCA reports.

## 6. Automated Verification
- [ ] Add scripts/verify_memory_logging.sh that persists decisions, restarts a simple process, and validates persisted entries and content hashes; exit 0 on success.

# Task: Implement Medium-term Memory handoffs for DeveloperAgent (Sub-Epic: 14_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-TAS-606]

## 1. Initial Test Written
- [ ] Create tests/memory/test_medium_term_memory.py using pytest with the following tests:
  - test_store_and_retrieve_handoff: create a MediumTermMemory instance pointed at a temporary SQLite file, call save_handoff(task_id, {"summary":"RCA","artifacts":["diff.patch"]}), then call get_handoffs(task_id) and assert the stored payload matches and created_at is present.
  - test_persistence_across_instances: create a memory instance, save a handoff, close instance, create a new instance pointed at the same DB file and assert retrieval returns the previously saved handoff.

## 2. Task Implementation
- [ ] Implement memory/medium_term.py with class MediumTermMemory:
  - Use SQLite at .devs/medium_term.db with schema: handoffs(id TEXT PRIMARY KEY, task_id TEXT, payload JSON, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP).
  - Methods: save_handoff(task_id: str, payload: dict) -> str (returns generated id), get_handoffs(task_id: str, limit: int = 10) -> List[dict], search(query: str) -> List[dict].
  - Implement parameterized SQL to avoid injection and ensure atomic commits; add optional size limit on payload and reject payloads that exceed the defined size (configurable).
  - Provide a CLI helper at scripts/inspect_handoffs.py for quick inspection (optional but helpful for verification).

## 3. Code Review
- [ ] Verify schema design, parameterized queries, reasonable payload size limits, retention policy notes in docs, and that no secrets are stored in plaintext. Ensure unit tests cover persistence semantics.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/memory/test_medium_term_memory.py and confirm tests pass.

## 5. Update Documentation
- [ ] Add docs/memory/medium_term.md describing the schema, API usage examples, migration notes, and example CLI commands to inspect or purge handoffs.

## 6. Automated Verification
- [ ] CI: run the memory unit tests and a small integration where DeveloperAgent writes an RCA handoff after a pivot and another DeveloperAgent instance reads it back and asserts structure compliance.
# Task: Implement Approval Token Persistence (Sub-Epic: 02_Architecture-Driven Development Setup)

## Covered Requirements
- [1_PRD-REQ-PIL-002], [3_MCP-REQ-GOAL-002]

## 1. Initial Test Written
- [ ] Create `tests/phase_6/test_approval_token.py` with tests:
  - `test_create_approval_token()` calls `approval.create_approval(path, approver, note)` and asserts a UUID-like token is returned and that `approval.is_approved(path)` becomes `True`.
  - `test_persistence()` writes the approval to a persistent store (prefer `blueprints/approvals.json` in tests' tmpdir) and reloads it to verify the token and metadata (approver, timestamp, checksum) are stored.
  - `test_revocation()` verifies `approval.revoke(path)` clears approval and subsequent `is_approved()` is `False`.

## 2. Task Implementation
- [ ] Implement `src/blueprint/approval.py` with:
  - `def create_approval(path: pathlib.Path, approver: str, note: str) -> str` — computes checksum for the file, generates a UUID token, stores {path: {token, approver, note, checksum, ts}} in `blueprints/approvals.json` (atomic write).
  - `def is_approved(path: pathlib.Path) -> bool` — returns True if stored checksum matches current checksum.
  - `def revoke(path: pathlib.Path) -> None` — remove approval entry.
  - Use `uuid.uuid4()` for tokens and ISO8601 timestamps.

## 3. Code Review
- [ ] Verify persistence is atomic (write-temp-rename), tokens are unguessable UUIDs, stored checksums are included, and functions are idempotent.

## 4. Run Automated Tests to Verify
- [ ] Run: `pytest -q tests/phase_6/test_approval_token.py` and ensure tests pass.

## 5. Update Documentation
- [ ] Add "Approval Tokens & Persistence" to `docs/architecture_add.md` describing token format, storage location, and example `curl`/CLI commands to create and revoke approvals.

## 6. Automated Verification
- [ ] CI check: `pytest -q tests/phase_6/test_approval_token.py && test -f blueprints/approvals.json` (fail if file missing).
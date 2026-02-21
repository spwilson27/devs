# Task: Approval Gate stub and wait-for-approval mechanism (Sub-Epic: 01_ArchitectAgent Core Implementation)

## Covered Requirements
- [9_ROADMAP-PHASE-004], [TAS-050]

## 1. Initial Test Written
- [ ] Create `tests/test_approval_gate.py` with two tests:
  - test_wait_for_approval_unblocks_when_token_created:
    - Use `threading` or `concurrent.futures` to start `ApprovalGate.wait_for_approval(token_path, timeout=5)` in a separate thread.
    - After a 0.5s sleep in the main thread, create the `token_path` file (atomic write using tmp file + os.replace).
    - Assert the waiting call returns `True` within the timeout.
  - test_wait_for_approval_times_out:
    - Call `ApprovalGate.wait_for_approval(nonexistent_path, timeout=0.5)` and assert it returns `False` (or raises a documented Timeout exception) to validate timeout handling.

## 2. Task Implementation
- [ ] Implement `src/gating/approval_gate.py` with an `ApprovalGate` class or module-level functions:
  - def wait_for_approval(token_path: str, timeout_sec: float = 600.0, poll_interval: float = 0.5) -> bool:
    - Poll for the existence of `token_path` using `time.sleep(poll_interval)` between checks.
    - Return True if the file appears before `timeout_sec`, otherwise return False.
    - Use `os.replace` when creating approval token files to avoid partial reads.
  - def save_approval_token(token_path: str, payload: dict) -> None:
    - Atomically write a JSON payload representing the approval (who approved, timestamp) to `token_path`.
  - def verify_approval_token(token_path: str) -> dict:
    - Load and validate the token JSON and return the parsed dict; raise a clear error if invalid.
- [ ] Ensure the implementation avoids busy-waiting (use sleep) and supports cancellation by passing a `timeout_sec` parameter. Keep behavior deterministic for tests.

## 3. Code Review
- [ ] Verify no tight loops or high CPU polling; ensure atomic file writes, clear documented return values (`True`/`False`), and robust JSON parsing with explicit validation of expected keys (approved_by, timestamp, signature optional).

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_approval_gate.py -q` and confirm tests pass. The test runner must be able to run these tests on CI; keep timeouts small (0.5s/5s) for CI responsiveness.

## 5. Update Documentation
- [ ] Add `docs/gating/approval_gate.md` describing the API, token file schema, example of human-in-the-loop flow, and recommended timeout defaults for local dev vs CI.

## 6. Automated Verification
- [ ] Add `tools/verify_approval_gate.py` that spawns a background writer which creates an approval token after N seconds and verifies `wait_for_approval` returns True; this script should exit with non-zero on failure and be usable by CI for smoke checks.
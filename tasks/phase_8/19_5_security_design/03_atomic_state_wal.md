# Task: Implement Atomic State Persistence (WAL) (Sub-Epic: 19_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-059]

## 1. Initial Test Written
- [ ] Add unit tests at `specs/storage/test_wal.py` using pytest.
  - `test_wal_append_and_recover` — create a temporary WAL file, append several entries, simulate a crash (do not checkpoint), then call `WAL.recover()` and assert the recovered sequence of entries matches what was appended.
  - `test_wal_flush_and_checkpoint` — append entries, perform checkpoint, simulate crash, call recover and assert no duplicate replays and DB reaches expected state.
  - `test_wal_concurrent_append` — simulate concurrent appenders (threaded) and assert WAL ordering and no corruption (use file locking / advisory locks in implementation).
- [ ] Add integration tests at `specs/storage/test_wal_sqlite_integration.py` that exercise WAL-backed writes against a sqlite DB file and assert DB consistency after forced aborts (os._exit or process kill simulation using subprocess for the writer and then recovery in the test).

## 2. Task Implementation
- [ ] Implement `src/storage/wal.py` with a `WriteAheadLog` class implementing:
  - `append(record: bytes)` — append an entry, flush to disk, and fsync to guarantee durability.
  - `flush()` / `fsync()` — ensure data reaches durable storage (use `file.flush()` + `os.fsync(file.fileno())`).
  - `checkpoint(snapshot_path: str)` — perform an atomic checkpoint that persists a compacted state and truncates/rotates the WAL safely (use atomic `os.replace` for final checkpoint files).
  - `recover()` — read WAL and return ordered records for replay. Must validate record checksums to detect partial writes.
- [ ] Use simple binary framing for records: [4 byte length][payload][4 byte crc32] to make partial-write detection straightforward.
- [ ] Use an advisory file lock when writing/appending (fcntl on Unix) to prevent concurrent writers corrupting the WAL.
- [ ] Add a small integration interface `src/storage/wal_integration.py` that exposes `with wal.transaction()` context manager that the CommitNode can use to ensure WAL append -> DB apply -> checkpoint ordering.

## 3. Code Review
- [ ] Verify fsync usage is correct and placed after writes before signaling success.
- [ ] Verify atomic checkpoint is implemented via temporary file + os.replace.
- [ ] Verify record framing and checksum detection to avoid replaying partial records.
- [ ] Verify locking strategy chosen works on CI (document platform-specific notes) and falls back gracefully when locks are unavailable.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest -q specs/storage/test_wal.py specs/storage/test_wal_sqlite_integration.py` and verify all tests simulate crash+recovery and assert deterministic outcomes.

## 5. Update Documentation
- [ ] Add `docs/security/wal.md` documenting the WAL format, APIs, failure modes, and recovery steps. Include sample code for integrating WAL into existing DB commit flows.

## 6. Automated Verification
- [ ] Provide `scripts/wal_recover_verify.py` that: (a) creates a temp WAL, (b) appends a known sequence of records, (c) simulates a crash, (d) runs recover and asserts recovered sequence equals the appended sequence. The CI job should run this script as a sanity check.
# Task: Implement cross-provider state preservation (Sub-Epic: 27_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-082]

## 1. Initial Test Written
- [ ] Detect repository language and test runner before writing tests:
  - If package.json exists at repo root: create a Jest/TS test under tests/risks/state-preservation.test.ts and run with `npm test` / `npx jest`.
  - Else if pyproject.toml or requirements.txt exists: use pytest and create tests/risks/test_state_preservation.py and run `pytest -q`.
  - If neither exists, default to pytest and add a minimal pytest dependency to requirements/dev/test tooling.
- [ ] Write deterministic unit tests that assert snapshot equivalence and cross-provider restore:
  - Python (pytest): tests/risks/test_state_preservation.py
    - Fixtures: tmp_path for temporary storage.
    - Create MockProviderA and MockProviderB implementing save(bytes) and load() -> bytes.
    - canonical_state = {"files": [{"path":"/src/main","content":"print('x')"}], "git_head":"abc123"}
    - snapshot_bytes = StatePreserver.snapshot(canonical_state)
    - expected_hash = hashlib.sha256(snapshot_bytes).hexdigest()
    - StatePreserver.save(providerA, snapshot_bytes)
    - loaded = StatePreserver.load(providerB)  # via migration routine that writes to providerB
    - assert hashlib.sha256(loaded).hexdigest() == expected_hash
    - assert json.loads(loaded.decode('utf-8')) == canonical_state
  - Node/TS (jest): tests/risks/state-preservation.test.ts with equivalent assertions using Buffer and crypto.createHash('sha256').
- [ ] Tests must mock/patch clocks and random sources (if present) and ensure serialization uses stable options (sorted keys, compact separators).
- [ ] Name tests explicitly: `test_state_preservation_across_providers`, `test_snapshot_deterministic_hash`.

## 2. Task Implementation
- [ ] Add implementation module `src/risks/state_preserver.{py,ts}` with:
  - class StatePreserver:
    - snapshot(state: dict) -> bytes: deterministic JSON serialization using sort_keys=True and separators=(',', ':') then UTF-8 encode.
    - compute_hash(snapshot_bytes) -> str: SHA-256 hex digest.
    - save(provider, snapshot_bytes): atomic write (write to tmp file then os.replace / fs.renameSync) and ensure binary-safe storage.
    - load(provider) -> bytes: load and return snapshot bytes.
    - migrate(provider_from, provider_to): load from provider_from then save to provider_to and validate hash equality.
  - Provider interface (documented in the module) with methods save(bytes) and load() -> bytes; implement simple filesystem provider adapter for local tests.
- [ ] Implement file-level locking for providers that use the FS (use fcntl.lockf in Python, flock or proper node lockfile) to prevent concurrent corruption.
- [ ] Add an adapter `src/risks/adapters/git_provider.{py,ts}` which can persist snapshots into a Git-backed storage or a SQLite blobs table (choose adapter based on repo capabilities).
- [ ] Add minimal integration hooks so a DeveloperAgent can call StatePreserver.migrate(provider_a, provider_b) as an atomic operation.

## 3. Code Review
- [ ] Verify deterministic serialization (sort_keys True, consistent numeric formatting) and absence of transient fields in snapshots.
- [ ] Verify atomic write semantics (tmp file + rename) and proper lock usage to prevent write races.
- [ ] Ensure the Provider interface is small, typed, and mockable; adapters should be thin and tested separately.
- [ ] Ensure no secrets are serialized into snapshots; review snapshot schema and redact sensitive fields per security policy.

## 4. Run Automated Tests to Verify
- [ ] Run tests for the chosen language/runtime:
  - Python: `pytest tests/risks/test_state_preservation.py -q` and ensure exit code 0.
  - Node: `npx jest tests/risks/state-preservation.test.ts --runInBand` and ensure exit code 0.
- [ ] Verify both tests `test_state_preservation_across_providers` and `test_snapshot_deterministic_hash` are present and passing.

## 5. Update Documentation
- [ ] Add `docs/tasks/phase_8/27_8_risks/01_state_preservation.md` describing:
  - Snapshot schema (fields, redaction rules), provider adapter API, CLI examples for `devs state snapshot --provider git --task-id <id>`, and migration examples.

## 6. Automated Verification
- [ ] Add `scripts/verify_state_preservation.sh` that:
  - Creates a canonical_state JSON file,
  - Invokes a small harness that calls StatePreserver.snapshot -> save on provider A -> migrate -> load from provider B,
  - Computes sha256 of original and restored snapshot and exits non-zero on mismatch.
- [ ] Add a CI step (or a simple workflow check) that runs the verify script when files under `src/risks` change.

# Task: Implement deterministic execution engine for repeatable test runs (Sub-Epic: 09_1_PRD)

## Covered Requirements
- [1_PRD-REQ-IMP-013]

## 1. Initial Test Written
- [ ] Create a unit test file `tests/unit/test_deterministic_execution.py` that verifies identical test runs produce identical outputs when using the same deterministic seed and environment normalization. The test must:
  1. Instantiate the `ExecutionEngine` (or test-run wrapper) and run the same test suite twice with the same `seed` and identical sandbox configuration.
  2. Capture stdout/stderr, test result summaries, and any generated artifacts (e.g., files) from both runs.
  3. Assert byte-for-byte equality between the two run outputs and identical artifacts checksums.
  4. Repeat with different seeds to ensure outputs differ when expected.

Example pytest sketch:

```python
def test_execution_is_deterministic(tmp_path):
    from devs.execution import ExecutionEngine
    engine = ExecutionEngine()
    seed = 12345
    out1 = engine.run_in_sandbox(task_id="task-09-1-deterministic", seed=seed)
    out2 = engine.run_in_sandbox(task_id="task-09-1-deterministic", seed=seed)
    assert out1.stdout == out2.stdout
    assert out1.summary == out2.summary
    # assert artifacts checksums match
    out3 = engine.run_in_sandbox(task_id="task-09-1-deterministic", seed=seed+1)
    assert out1.stdout != out3.stdout
```

## 2. Task Implementation
- [ ] Implement a deterministic `ExecutionEngine`:
  - Provide `run_in_sandbox(task_id, seed=None)` that:
    - Normalizes environment variables (e.g., `TZ=UTC`, `LANG=C`), clears or pins locale-dependent values.
    - Seeds all known RNG sources (`random.seed(seed)`, `numpy.random.seed(seed)` if used, any language-specific RNGs) and provides a deterministic monotonic time source or patch `time.time()` for test runs.
    - Uses a fresh, isolated working directory per run (tmpdir) and pins dependency versions using the project's lockfile.
    - Captures and normalizes outputs (mask user-specific paths, timestamps) or produce structured outputs that are deterministic.
  - Expose a deterministic artifact collector that returns checksums for produced files.
  - Add configuration flags to enable strict-determinism mode and a diagnostic mode that emits a normalized transcript and seed used.

## 3. Code Review
- [ ] Verify:
  - All RNG sources are seeded and any non-deterministic sinks are either fixed or normalized.
  - Environment normalization is documented and reversible for debugging.
  - Execution runs are isolated (no shared tmp dirs) and cleanup occurs even on failure.

## 4. Run Automated Tests to Verify
- [ ] Run:
  - `pytest -q tests/unit/test_deterministic_execution.py`
  - Run the deterministic scenario multiple times to ensure bit-for-bit equivalence.

## 5. Update Documentation
- [ ] Update `docs/PRD.md` (or `docs/operations/deterministic_execution.md`) to describe the determinism guarantees (seed behavior, environment normalization, artifact checksums) and how developers can reproduce runs.

## 6. Automated Verification
- [ ] Add `scripts/verify_deterministic_engine.sh` that:
  1. Runs the deterministic test twice and diffs the normalized transcripts/artifacts; exits non-zero if differences are found.

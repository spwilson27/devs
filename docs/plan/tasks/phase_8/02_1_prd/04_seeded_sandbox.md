# Task: Implement Seeded Deterministic Sandbox (Sub-Epic: 02_1_PRD)

## Covered Requirements
- [1_PRD-REQ-NEED-AGENT-03]

## 1. Initial Test Written
- [ ] Add unit/integration tests at tests/determinism/test_seeded_runs.py::test_seeded_python_run_is_reproducible:
  - Create a small script tests/determinism/fixtures/demo_random.py which prints a sequence of values from random, numpy.random, and a deterministic timestamp using time.time() with a fixed offset.
  - Test should run the sandbox runner twice with the same seed and assert the stdout outputs are byte-for-byte identical.
  - Use subprocess or the project's SandboxRunner API and ensure the runner sets env vars: PYTHONHASHSEED, DEVS_DETERMINISTIC=1 and calls random.seed(seed) and numpy.random.seed(seed) in the spawned process.

## 2. Task Implementation
- [ ] Implement deterministic seeding in the sandbox runner (src/sandbox/runner.py or equivalent):
  - Add parameter seed: int to SandboxRunner.run(seed: int, ...) and propagate it to the child process via environment variables and a short bootstrap that sets:
    - PYTHONHASHSEED=str(seed)
    - env['DEVS_RUN_SEED'] = str(seed)
    - In the child process bootstrap (create a small prepend script or use -c), call:
      - import os, random
      - random.seed(int(os.environ['DEVS_RUN_SEED']))
      - try: import numpy as np; np.random.seed(int(os.environ['DEVS_RUN_SEED']))
      - set time.time() stability by mocking/stubbing in tests where necessary
  - Ensure file system timestamps are normalized in captured outputs where possible (strip wall-clock timestamps before hashing) or inject a deterministic time source.

## 3. Code Review
- [ ] Verify:
  - No global state leak between runs (runner uses clean process per run).
  - Seeding covers common RNGs (random, numpy.random, secrets should remain non-deterministic except where explicitly seeded).
  - Documentation explains limitations (native C-extensions or non-seedable libs may remain non-deterministic).

## 4. Run Automated Tests to Verify
- [ ] Run: pytest tests/determinism/test_seeded_runs.py -q
  - Expected: deterministic run outputs are identical across multiple runs with the same seed.

## 5. Update Documentation
- [ ] Update docs/prd/determinism.md describing how to run SandboxRunner in deterministic mode, environment variables to set, and how to reproduce runs locally.

## 6. Automated Verification
- [ ] Add CI job scripts/determinism/verify_seeded_runner.sh that runs the demo twice and compares SHA-256(a) == SHA-256(b) of captured stdout files.

# Task: Create benchmark suite for cost heuristics and record results (Sub-Epic: 07_Cost_Estimation_And_Budgeting)

## Covered Requirements
- [9_ROADMAP-REQ-032]

## 1. Initial Test Written
- [ ] Write unit-level smoke tests in `tests/test_benchmark_runner.py` that assert the benchmark runner executes and produces a results JSON with the following keys: `heuristic_name`, `dataset_id`, `mape`, `runtime_seconds`, `timestamp`.
  - test_benchmark_output_schema: run the benchmark on a tiny dataset (2 projects) and assert the results JSON schema matches the expected keys and types.
  - test_benchmark_reproducible: running the benchmark twice on the tiny dataset yields identical `mape` value (deterministic algorithm and fixed seed where needed).

## 2. Task Implementation
- [ ] Implement a benchmark runner at `benchmarks/run_cost_heuristics.py` that:
  - Accepts flags: `--heuristics [list]`, `--dataset path`, `--output path` and `--repeat N`.
  - Loads a dataset of ground-truth projects (format same as `tests/fixtures/benchmark_projects.json`).
  - Runs the selected heuristics (token heuristic, baseline constant heuristic, and any experimental heuristics) and collects metrics: MAPE, MAE, runtime, memory usage (optional).
  - Writes per-run JSON results to `benchmarks/results/<dataset_id>/<heuristic_name>-<timestamp>.json` and appends a human-readable CSV summary to `benchmarks/results/summary.csv`.
  - Provide a helper `benchmarks/compare_results.py` that can produce a ranked table of heuristics by MAPE for a given dataset.
  - Ensure runner is deterministic: set any RNG seeds and avoid non-deterministic file ordering.

## 3. Code Review
- [ ] Verify:
  - Outputs are machine-parseable JSON and include the required keys.
  - Benchmarks are reproducible and documented in `benchmarks/README.md`.
  - Benchmarks do not call external APIs and can be run locally with the fixture datasets.

## 4. Run Automated Tests to Verify
- [ ] Run the smoke tests: `pytest -q tests/test_benchmark_runner.py` and run the benchmark runner on the tiny dataset: `python benchmarks/run_cost_heuristics.py --dataset tests/fixtures/benchmark_projects.json --heuristics token_heuristic --output /tmp/benchout`.

## 5. Update Documentation
- [ ] Add `benchmarks/README.md` describing how to add new datasets, how to run benchmarks, and how to interpret outputs. Update `docs/estimation.md` to link to the benchmark runner and explain that benchmark artifacts are stored under `benchmarks/results/`.

## 6. Automated Verification
- [ ] Add `scripts/verify_benchmarks.sh` which runs the runner on the tiny dataset, checks that a results JSON was produced, and verifies the `mape` key is present and a non-negative number. Exit non-zero on failure.

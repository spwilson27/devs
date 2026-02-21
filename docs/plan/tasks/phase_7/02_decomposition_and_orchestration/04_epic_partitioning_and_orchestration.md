# Task: Epic Partitioning and Orchestration (Sub-Epic: 02_Decomposition_And_Orchestration)

## Covered Requirements
- [1_PRD-REQ-PLAN-002], [1_PRD-REQ-PLAN-004]

## 1. Initial Test Written
- [ ] Add tests at `tests/unit/test_partitioning.py` written first:
  - [ ] `test_partition_returns_epic_count_in_range()` constructs a synthetic set of 200+ task stubs and asserts the partitioner returns between 8 and 16 epics when possible.
  - [ ] `test_each_epic_has_minimum_tasks()` asserts each epic returned contains at least 25 tasks when overall task count allows.
  - [ ] `test_partition_is_stable()` ensures repeated runs with same seed/input produce the same epic assignments.

## 2. Task Implementation
- [ ] Implement `src/planner/partitioner.py` exposing `partition_into_epics(tasks, min_epics=8, max_epics=16, min_tasks_per_epic=25)`:
  - [ ] Implement a two-stage algorithm: (1) cluster tasks by requirement/semantic tags (e.g., req_id prefix or topic tags), (2) rebalance clusters to meet `min_tasks_per_epic` and `min/max` epic constraints.
  - [ ] Provide deterministic seeding and a stable rebalancing algorithm (e.g., greedy reassign by cluster size).
  - [ ] Expose a CLI `scripts/partition_epics.py --tasks tasks.json --out epics.json` that outputs each epic with its task list and metadata (title, description, estimated token cost).
  - [ ] If constraints cannot be met, the CLI should fail with a clear error and a suggested rebalance report.

## 3. Code Review
- [ ] Verify algorithm determinism, adequate unit tests, and that the partitioner documents trade-offs (semantic clustering vs balancing for constraints).
- [ ] Ensure no task is duplicated across epics and epic metadata includes task counts and estimated cost.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/unit/test_partitioning.py` and confirm success.

## 5. Update Documentation
- [ ] Add `docs/epic_partitioning.md` describing the partitioning algorithm, configuration knobs (min/max epics, min_tasks_per_epic), and example outputs.

## 6. Automated Verification
- [ ] Add `tests/scripts/verify_partitioning.sh` that partitions a representative `tasks.json` and asserts epic count and per-epic minimums; produce a JSON verification artifact `verification/partitioning_report.json`.

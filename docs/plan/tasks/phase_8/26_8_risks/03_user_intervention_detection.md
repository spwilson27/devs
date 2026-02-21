# Task: Implement user intervention detection and pause trigger (Sub-Epic: 26_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-075]

## 1. Initial Test Written
- [ ] Create `tests/phase_8/26_8_risks/test_03_user_intervention_detection.py` that:
  - Simulates a running `DeveloperAgent` with a known `task_start_time` and `head_commit`.
  - Creates a manual out-of-band commit or modifies a tracked file in the workspace (use a temporary git repo fixture).
  - Asserts `DeveloperAgent.detect_user_intervention(task_start_time, head_commit)` returns `True` and that the detector returns evidence (commit SHAs or file paths).
  - This test must be deterministic: use a controlled ephemeral repository fixture and clearly authored test commits.

## 2. Task Implementation
- [ ] Implement `UserInterventionDetector` (put under `src/agent/detectors`) with methods:
  - `check_for_manual_commits(task_start_time: datetime, head_commit: str) -> List[Commit]`:
    - Run `git log --since=<task_start_time>` and return commits not authored by the agent service account (agent identity should be configurable).
  - `check_for_out_of_band_file_edits(workspace_root: Path, agent_lockfile: Path) -> List[Path]`:
    - Compare file mtimes, `git status --porcelain` and the agent's recorded write-log to identify files changed externally.
  - `detect_user_intervention(...) -> InterventionReport`:
    - Combine the checks above and return a typed report containing reasons and evidence.
- [ ] Integrate the detector into the `DeveloperAgent` loop so that when `detect_user_intervention` returns evidence the agent transitions to `paused_for_user` state and emits a human-readable UI event including evidence.

## 3. Code Review
- [ ] Ensure the detector uses deterministic git ranges, excludes service-account commits, and tolerates fast-moving branches (use commit SHAs rather than timestamps when possible).
- [ ] Ensure detector performance is bounded and that any git subprocess calls are sandboxed and time-limited.

## 4. Run Automated Tests to Verify
- [ ] Run the detector unit test using the repository test runner and validate both positive and negative cases (intervention/no-intervention).

## 5. Update Documentation
- [ ] Add `docs/user_intervention.md` describing detection heuristics, the `paused_for_user` state, UI expectations, and remediation steps for users.

## 6. Automated Verification
- [ ] Add a CI test that runs the intervention detector in an ephemeral repo and asserts zero false-negatives for a curated set of engineered cases (script: `scripts/verify_user_intervention.sh`).

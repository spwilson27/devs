# Task: DoD P6 — Execution (The Hands) Done verification (Sub-Epic: 16_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-DOD-P6]

## 1. Initial Test Written
- [ ] Add an integration test at `tests/integ/test_dod_p6.(py|js)` that composes the minimal end-to-end execution acceptance criteria:
  - Use a temporary workspace and git repo fixture.
  - Run the `scripts/self_host_harness.(py|js)` (from Task 05) and assert it completes successfully.
  - During the run, validate that `EntropyDetector` (Task 02) is exercisable: simulate feeding repeated identical outputs to its API and assert the detector records `triggered` status and emits/returns an indicator (this may be mocked if necessary).
  - Validate `surgical_edit` (Task 04) is used or can be used by the harness to apply code changes atomically.
  - Final assertion: the workspace contains the committed feature file(s) and the test harness produced an explicit success artifact (e.g., a JSON file `dod_p6_result.json` with `{ "status": "success", "commit": "<sha>" }`).
- [ ] Keep the test deterministic, short (<30s), and filesystem-local.

## 2. Task Implementation
- [ ] Implement a verification driver `scripts/dod_p6_verify.(py|js)` that runs the integration test scenario end-to-end and writes `dod_p6_result.json` in the repo root when successful. The driver should:
  - Create a temp git repo
  - Invoke `scripts/self_host_harness.(py|js)` (or equivalent) to run a full TDD microtask creating a trivial feature and committing it
  - Instantiate `EntropyDetector` and programmatically feed it repeated identical outputs to confirm `triggered` behaviour (optionally via the detector's CLI)
  - Confirm surgical_edit can apply a sample multi-block edit atomically (use the CLI or library API)
  - Write `dod_p6_result.json` with keys `status`, `commit`, `checks` where `checks` documents detector and surgical_edit verification results.

## 3. Code Review
- [ ] Verify the verification driver covers the high-level acceptance criteria of "Execution (The Hands) Done": end-to-end TDD flow, atomic edits, entropy detection, and commit produced. Confirm the driver is safe, network-free, and idempotent.

## 4. Run Automated Tests to Verify
- [ ] Execute the integration test or the verification driver locally: `python3 scripts/dod_p6_verify.py` (or `node scripts/dod_p6_verify.js`) and assert that `dod_p6_result.json` is produced and `status` == `success`.

## 5. Update Documentation
- [ ] Add `docs/dod_p6.md` describing the DoD acceptance test, how to run the verification driver, and how CI will interpret `dod_p6_result.json`.

## 6. Automated Verification
- [ ] Add `scripts/verify_dod_p6.sh` that runs the verification driver and exits non-zero unless `dod_p6_result.json` exists and contains `{"status":"success"}`. CI uses this script as the final gate for the Sub-Epic.

This task provides the final execution acceptance test harness and scripts required to claim "Execution (The Hands) Done" for Sub-Epic 16_9_ROADMAP.
# Task: Implement Zero-Data-Retention Option (Sub-Epic: 25_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-063]

## 1. Initial Test Written
- [ ] Add tests at tests/test_zero_data_retention.py using pytest. Implement these first:
  - test_zero_data_retention_flag_prevents_persistence: run a short agent workflow with env var ZERO_DATA_RETENTION=1 and assert that no disk-based artifacts are written to persistent locations (e.g., sqlite files, cache directories, or logs that contain user-provided content).
  - test_in_memory_stores_used_when_flag_set: verify that in-memory stores (or mocks) are used for vector stores, temporary files are removed immediately, and no indexes or DB files are left behind after the run.
  - test_no_pii_logged: run a scenario that would normally log a snippet of user data and assert logs are redacted or not written when the flag is set.

## 2. Task Implementation
- [ ] Implement a global zero-data-retention mode in src/devs/config/data_retention.py with:
  - Function is_zero_retention_enabled() that reads env var ZERO_DATA_RETENTION and runtime config.
  - Abstractions for persistent stores (e.g., DiskStore) and in-memory/noop stores (MemoryStore/NoopStore). Use factory pattern so the rest of the codebase requests a store via StoreFactory.get(name) which respects zero retention mode.
  - Ensure all places that persist data (vector stores, sqlite, temporary caches, logs containing user input) are routed through the factory and therefore become ephemeral when flag enabled.
  - Add a cleanup hook that double-checks there are no leftover files under configured data directories after shutdown.

## 3. Code Review
- [ ] Verify that the factory pattern covers all persistence entry points, that no direct file writes remain, and that tests include negative assertions (files/directories do not exist). Ensure logs are redacted and the implementation honors the flag even under error paths.

## 4. Run Automated Tests to Verify
- [ ] Run pytest -q tests/test_zero_data_retention.py and a short integration run (scripts/run_zero_retention_check.sh) which starts a mini-agent run with the flag set and then verifies no persistent artifacts remain.

## 5. Update Documentation
- [ ] Update docs/privacy/zero_data_retention.md with exact behavior, environment variables, and operational notes for running the system in zero-retention mode.

## 6. Automated Verification
- [ ] Add a CI check scripts/verify_zero_retention.sh that runs the integration scenario in CI and fails if any file under the project's data directories exists afterward. Include this check behind a privacy feature flag in CI.
